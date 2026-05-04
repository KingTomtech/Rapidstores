import type { AI } from '@cloudflare/workers-types';

export class AIService {
  private ai: AI;

  constructor(ai: AI) {
    this.ai = ai;
  }

  async chat(message: string, context?: any): Promise<string> {
    const systemPrompt = `You are a helpful customer assistant for Rapid Stores and General Dealers Ltd, a multi-sector business in Mansa, Zambia.

Business Details:
- Founded: 2018
- Location: Mansa, Zambia
- Sectors: Retail, Manufacturing (mattresses, foam products), Supply & Logistics

Your role:
- Answer questions about products, prices, and availability
- Help customers with orders and delivery information
- Be friendly, professional, and concise
- Use Zambian context (prices in ZMW, local references)
- Keep responses short and mobile-friendly

Current context: ${JSON.stringify(context || {})}`;

    try {
      const response = await this.ai.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500
      });

      return response.response || response.message?.content || 'Sorry, I could not process your request.';
    } catch (error) {
      console.error('AI chat error:', error);
      return 'I apologize, but I\'m having trouble responding right now. Please contact us directly on WhatsApp: +260970000000';
    }
  }

  async recommendProducts(cartItems: any[], viewedProducts: any[]): Promise<any[]> {
    const prompt = `Based on these cart items and viewed products, recommend 3-5 complementary products for a Zambian customer:

Cart Items: ${JSON.stringify(cartItems)}
Viewed Products: ${JSON.stringify(viewedProducts)}

Consider:
- Complementary products (e.g., mattress protector with mattress)
- Popular items in Zambia
- Good value bundles
- Seasonal recommendations

Return ONLY a JSON array of product recommendation objects with: id, name, reason`;

    try {
      const response = await this.ai.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { 
            role: 'system', 
            content: 'You are a sales assistant. Return ONLY valid JSON. No explanations.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400
      });

      const content = response.response || response.message?.content || '[]';
      // Extract JSON from response
      const jsonMatch = content.match(/\[.*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error('AI recommendation error:', error);
      return [];
    }
  }

  async generateInventoryAlerts(products: any[]): Promise<any[]> {
    const alerts: any[] = [];

    for (const product of products) {
      let priority = 'low';
      let message = '';

      if (product.stock_quantity === 0) {
        priority = 'critical';
        message = `OUT OF STOCK: ${product.name} needs immediate restocking`;
      } else if (product.stock_quantity < 5) {
        priority = 'high';
        message = `VERY LOW STOCK: ${product.name} has only ${product.stock_quantity} units left`;
      } else if (product.stock_quantity < 10) {
        priority = 'medium';
        message = `LOW STOCK: ${product.name} has ${product.stock_quantity} units remaining`;
      }

      if (message) {
        alerts.push({
          product_id: product.id,
          product_name: product.name,
          current_stock: product.stock_quantity,
          priority,
          message,
          suggested_action: priority === 'critical' ? 'Order immediately' : 'Plan restock soon'
        });
      }
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return alerts;
  }

  async generateMarketingContent(
    type: 'whatsapp_status' | 'promotional_message' | 'product_highlight',
    products: any[],
    campaign_goal: string
  ): Promise<string> {
    const prompt = `Generate marketing content for Rapid Stores in Zambia.

Type: ${type}
Goal: ${campaign_goal}
Products: ${JSON.stringify(products)}

Requirements:
- Use engaging, friendly tone
- Include emojis appropriately
- Keep it concise for mobile users
- Include call-to-action
- Mention ZMW prices
- Add WhatsApp contact: +260970000000
- Location: Mansa, Zambia

Generate the content:`;

    try {
      const response = await this.ai.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { 
            role: 'system', 
            content: 'You are a marketing expert for Zambian retail. Create engaging, culturally relevant content.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 600
      });

      return response.response || response.message?.content || '';
    } catch (error) {
      console.error('AI marketing error:', error);
      return '';
    }
  }

  async analyzeSalesTrends(orders: any[]): Promise<any> {
    const prompt = `Analyze these sales orders and provide insights:

Orders: ${JSON.stringify(orders.slice(0, 50))} // Limit to first 50 for token efficiency

Provide:
1. Best-selling products
2. Peak sales times
3. Revenue trends
4. Recommendations for improvement

Return as structured JSON.`;

    try {
      const response = await this.ai.run('@cf/meta/llama-3-8b-instruct', {
        messages: [
          { 
            role: 'system', 
            content: 'You are a business analyst. Return structured JSON with insights.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800
      });

      const content = response.response || response.message?.content || '{}';
      const jsonMatch = content.match(/\{.*\}/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {};
    } catch (error) {
      console.error('AI analytics error:', error);
      return {};
    }
  }
}
