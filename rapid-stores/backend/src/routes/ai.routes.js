import { Router } from 'express';
import { getAllProducts, updateProduct } from '../models/product.model.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// AI Customer Assistant - Answer product questions
router.post('/chat', (req, res) => {
  try {
    const { message, context = {} } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const lowerMessage = message.toLowerCase();
    let response = '';
    let suggestions = [];

    // Greeting detection
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon)/)) {
      response = "Hello! Welcome to Rapid Stores. How can I help you today? I can help you find products, check prices, or answer questions about our mattresses and groceries.";
      suggestions = ['Show me mattresses', 'What groceries do you have?', 'Check my order status'];
    }
    // Product availability
    else if (lowerMessage.includes('available') || lowerMessage.includes('have') || lowerMessage.includes('stock')) {
      const products = getAllProducts({ in_stock: true });
      const count = products.length;
      response = `We currently have ${count} products in stock. Browse our catalog to see what's available!`;
      suggestions = ['Show all products', 'Show mattresses', 'Show groceries'];
    }
    // Mattress inquiries
    else if (lowerMessage.includes('mattress') || lowerMessage.includes('foam')) {
      const mattresses = getAllProducts({ category: 'mattresses' });
      const foamProducts = getAllProducts({ category: 'foam_products' });
      const total = mattresses.length + foamProducts.length;
      
      if (total > 0) {
        const topProducts = [...mattresses, ...foamProducts].slice(0, 3);
        response = `We have ${total} mattress and foam products. Our popular items include: ${topProducts.map(p => p.name).join(', ')}. Would you like to see more details?`;
        suggestions = topProducts.map(p => `Tell me about ${p.name}`);
      } else {
        response = 'We specialize in foam mattresses, spring mattresses, divan bases, and custom foam products. Check our furniture category!';
      }
    }
    // Price inquiries
    else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      const products = getAllProducts({});
      if (products.length > 0) {
        const cheapest = products.reduce((min, p) => min.price < p.price ? min : p, products[0]);
        const expensive = products.reduce((max, p) => max.price > p.price ? max : p, products[0]);
        response = `Our prices range from ZMW ${cheapest.price} to ZMW ${expensive.price}. What product are you interested in?`;
        suggestions = ['Show cheapest products', 'Show premium products'];
      }
    }
    // Delivery questions
    else if (lowerMessage.includes('deliver') || lowerMessage.includes('shipping') || lowerMessage.includes('pickup')) {
      response = 'We offer pickup at our Mansa branch. For large orders, we can arrange delivery. During checkout, select your preferred delivery method.';
      suggestions = ['Place an order', 'Contact us'];
    }
    // Payment questions
    else if (lowerMessage.includes('pay') || lowerMessage.includes('mobile money') || lowerMessage.includes('mtn') || lowerMessage.includes('airtel')) {
      response = 'We accept MTN Mobile Money, Airtel Money, Zamtel Kwacha, and Lenco Pay. Select your preferred payment method during checkout.';
      suggestions = ['Start shopping', 'View cart'];
    }
    // Order status
    else if (lowerMessage.includes('order') && (lowerMessage.includes('status') || lowerMessage.includes('track'))) {
      response = 'You can check your order status in your profile under "My Orders". Orders go through: Pending → Paid → Processing → Ready → Delivered.';
      suggestions = ['Go to my orders', 'Contact support'];
    }
    // Contact/Help
    else if (lowerMessage.includes('contact') || lowerMessage.includes('help') || lowerMessage.includes('support')) {
      response = 'You can reach us via WhatsApp, phone, or visit our store in Mansa. We\'re here to help!';
      suggestions = ['WhatsApp us', 'Call us'];
    }
    // Default response
    else {
      response = 'I\'d be happy to help! You can ask me about:\n• Product availability and prices\n• Mattresses and foam products\n• Payment methods\n• Delivery options\n• Order status\n\nWhat would you like to know?';
      suggestions = ['Show products', 'About mattresses', 'Payment options', 'Delivery info'];
    }

    res.json({
      response,
      suggestions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat' });
  }
});

// AI Product Recommendations
router.post('/recommend', (req, res) => {
  try {
    const { cart_items = [], category } = req.body;

    let recommendations = [];
    const allProducts = getAllProducts({});

    // If cart has mattresses, recommend accessories
    const hasMattress = cart_items.some(item => 
      item.category === 'mattresses' || item.name.toLowerCase().includes('mattress')
    );

    if (hasMattress) {
      const accessories = allProducts.filter(p => 
        p.name.toLowerCase().includes('pillow') || 
        p.name.toLowerCase().includes('sheet') ||
        p.name.toLowerCase().includes('protector')
      );
      recommendations = accessories.slice(0, 3);
    }

    // If cart total is high, suggest bulk discount
    const cartTotal = cart_items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal > 500) {
      const bulkProducts = allProducts.filter(p => p.stock_quantity > 20).slice(0, 2);
      recommendations = [...recommendations, ...bulkProducts];
    }

    // Category-based recommendations
    if (category && !recommendations.length) {
      const sameCategory = allProducts.filter(p => p.category === category);
      recommendations = sameCategory.slice(0, 4);
    }

    // Default: best sellers
    if (!recommendations.length) {
      recommendations = allProducts.slice(0, 4);
    }

    res.json({
      recommendations,
      reason: hasMattress ? 'Frequently bought together' : 'Recommended for you'
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// AI Inventory Analysis (admin only)
router.post('/inventory', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const products = getAllProducts({});
    const lowStock = products.filter(p => p.stock_quantity <= 10);
    const outOfStock = products.filter(p => p.stock_quantity === 0);
    const overstocked = products.filter(p => p.stock_quantity > 50);

    const analysis = {
      total_products: products.length,
      low_stock_count: lowStock.length,
      out_of_stock_count: outOfStock.length,
      overstocked_count: overstocked.length,
      alerts: [
        ...lowStock.map(p => ({
          product_id: p.id,
          name: p.name,
          current_stock: p.stock_quantity,
          severity: 'warning',
          message: `Low stock alert: ${p.name} has only ${p.stock_quantity} units left`
        })),
        ...outOfStock.map(p => ({
          product_id: p.id,
          name: p.name,
          current_stock: 0,
          severity: 'critical',
          message: `Out of stock: ${p.name} needs immediate restocking`
        }))
      ],
      suggestions: overstocked.map(p => ({
        product_id: p.id,
        name: p.name,
        current_stock: p.stock_quantity,
        message: `Consider promoting ${p.name} - currently overstocked with ${p.stock_quantity} units`
      }))
    };

    res.json(analysis);
  } catch (error) {
    console.error('Inventory analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze inventory' });
  }
});

// AI Marketing Content Generator (admin only)
router.post('/marketing', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { type = 'whatsapp_status', products = [] } = req.body;
    
    const templates = {
      whatsapp_status: [
        `🔥 HOT DEAL at Rapid Stores!\n\nGet quality mattresses and household essentials at unbeatable prices.\n\n📍 Visit us in Mansa\n📞 Order now!`,
        `✨ New Stock Alert! ✨\n\nFresh supplies just arrived. Don't miss out on our latest products.\n\n#RapidStores #Mansa`,
        `💰 Weekend Special! 💰\n\nStock up on groceries and home essentials. Bulk discounts available!\n\n🛒 Shop now at Rapid Stores`
      ],
      promotional_message: [
        `Dear Valued Customer,\n\nRapid Stores brings you quality products at affordable prices. From mattresses to groceries, we've got you covered!\n\nVisit us today in Mansa.`,
        `🎉 SPECIAL OFFER 🎉\n\nGet amazing deals on our manufactured mattresses. Custom sizes available!\n\nContact us: +260 XXX XXX XXX`
      ],
      product_announcement: products.length > 0 
        ? [`New Arrival! ${products[0]?.name} now in stock at ZMW ${products[0]?.price}. Visit Rapid Stores today!`]
        : ['Check out our latest products at Rapid Stores!']
    };

    const content = templates[type] || templates.whatsapp_status;

    res.json({
      type,
      content,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Marketing generator error:', error);
    res.status(500).json({ error: 'Failed to generate marketing content' });
  }
});

export default router;
