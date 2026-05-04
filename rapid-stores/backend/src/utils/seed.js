import db from '../config/database.js';
import { createUser } from '../models/user.model.js';
import { createProduct } from '../models/product.model.js';
import { createVoucher } from '../models/voucher.model.js';

// Seed database with initial data
export function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Create admin user
  try {
    const admin = createUser({
      phone: '+260970000000',
      name: 'Admin User',
      email: 'admin@rapidstores.co.zm',
      password: 'admin123',
      role: 'admin'
    });
    console.log('✅ Admin user created');
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      console.log('ℹ️  Admin user already exists');
    } else {
      console.error('❌ Error creating admin:', error);
    }
  }

  // Create sample products
  const sampleProducts = [
    // Mattresses
    {
      name: 'Foam Mattress - Single',
      description: 'High-quality foam mattress, perfect for single beds. Durable and comfortable.',
      price: 650,
      stock_quantity: 25,
      category: 'mattresses',
      is_manufactured: true,
      production_status: 'ready'
    },
    {
      name: 'Foam Mattress - Double',
      description: 'Spacious double foam mattress with excellent support.',
      price: 950,
      stock_quantity: 20,
      category: 'mattresses',
      is_manufactured: true,
      production_status: 'ready'
    },
    {
      name: 'Spring Mattress - Queen',
      description: 'Premium spring mattress with pocket springs for ultimate comfort.',
      price: 2500,
      stock_quantity: 15,
      category: 'mattresses',
      is_manufactured: true,
      production_status: 'ready'
    },
    {
      name: 'Divan Base - Single',
      description: 'Sturdy divan base with storage option.',
      price: 850,
      stock_quantity: 10,
      category: 'furniture',
      is_manufactured: true,
      production_status: 'pending'
    },
    // Foam Products
    {
      name: 'Foam Pillow',
      description: 'Comfortable foam pillow for better sleep.',
      price: 85,
      stock_quantity: 50,
      category: 'foam_products',
      is_manufactured: true,
      production_status: 'ready'
    },
    {
      name: 'Foam Mattress Topper',
      description: 'Add extra comfort to your existing mattress.',
      price: 350,
      stock_quantity: 20,
      category: 'foam_products',
      is_manufactured: true,
      production_status: 'ready'
    },
    // Groceries
    {
      name: 'Breakfast Mealie Meal (10kg)',
      description: 'Premium quality mealie meal for your family.',
      price: 180,
      stock_quantity: 100,
      category: 'groceries',
      is_manufactured: false
    },
    {
      name: 'Cooking Oil (5L)',
      description: 'Pure vegetable cooking oil.',
      price: 145,
      stock_quantity: 60,
      category: 'groceries',
      is_manufactured: false
    },
    {
      name: 'Sugar (5kg)',
      description: 'White refined sugar.',
      price: 95,
      stock_quantity: 80,
      category: 'groceries',
      is_manufactured: false
    },
    {
      name: 'Rice (5kg)',
      description: 'Long grain premium rice.',
      price: 120,
      stock_quantity: 70,
      category: 'groceries',
      is_manufactured: false
    },
    {
      name: 'Beans (5kg)',
      description: 'Nutritious dried beans.',
      price: 85,
      stock_quantity: 50,
      category: 'groceries',
      is_manufactured: false
    },
    // Household
    {
      name: 'Detergent Powder (2kg)',
      description: 'Effective laundry detergent.',
      price: 65,
      stock_quantity: 100,
      category: 'groceries',
      is_manufactured: false
    },
    {
      name: 'Soap Bars (Pack of 6)',
      description: 'Multipurpose soap bars.',
      price: 45,
      stock_quantity: 150,
      category: 'groceries',
      is_manufactured: false
    }
  ];

  let productsCreated = 0;
  for (const product of sampleProducts) {
    try {
      createProduct(product);
      productsCreated++;
    } catch (error) {
      if (!error.message.includes('UNIQUE')) {
        console.error(`❌ Error creating product ${product.name}:`, error);
      }
    }
  }
  console.log(`✅ ${productsCreated} products created`);

  // Create sample vouchers
  const sampleVouchers = [
    {
      code: 'WELCOME10',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_amount: 200,
      max_uses: 100
    },
    {
      code: 'RAPID50',
      discount_type: 'fixed',
      discount_value: 50,
      min_order_amount: 500,
      max_uses: 50
    },
    {
      code: 'BULK15',
      discount_type: 'percentage',
      discount_value: 15,
      min_order_amount: 1000,
      max_uses: 25
    }
  ];

  let vouchersCreated = 0;
  for (const voucher of sampleVouchers) {
    try {
      createVoucher(voucher);
      vouchersCreated++;
    } catch (error) {
      if (!error.message.includes('UNIQUE')) {
        console.error(`❌ Error creating voucher ${voucher.code}:`, error);
      }
    }
  }
  console.log(`✅ ${vouchersCreated} vouchers created`);

  console.log('🎉 Database seeding completed!');
  console.log('\n📋 Sample Credentials:');
  console.log('   Admin Phone: +260970000000');
  console.log('   Admin Password: admin123');
  console.log('\n   (Change these in production!)');
}

// Run seed if called directly
if (process.argv[1]?.includes('seed.js')) {
  seedDatabase();
  process.exit(0);
}
