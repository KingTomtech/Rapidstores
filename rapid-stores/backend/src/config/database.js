import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure data directory exists
const dataDir = join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../data/rapidstores.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
export function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      password_hash TEXT,
      role TEXT DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      stock_quantity INTEGER DEFAULT 0,
      category TEXT NOT NULL CHECK(category IN ('groceries', 'electronics', 'furniture', 'mattresses', 'foam_products')),
      image_url TEXT,
      is_manufactured INTEGER DEFAULT 0,
      production_status TEXT DEFAULT 'not_applicable' CHECK(production_status IN ('not_applicable', 'pending', 'in_production', 'ready')),
      custom_options TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'processing', 'ready', 'delivered')),
      total_amount REAL NOT NULL,
      payment_method TEXT CHECK(payment_method IN ('mtn', 'airtel', 'zamtel', 'lenco', 'cash')),
      payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'completed', 'failed')),
      delivery_method TEXT DEFAULT 'pickup' CHECK(delivery_method IN ('pickup', 'delivery')),
      delivery_address TEXT,
      phone_number TEXT NOT NULL,
      whatsapp_order INTEGER DEFAULT 0,
      voucher_code TEXT,
      discount_amount REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Order items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price_at_purchase REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Vouchers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS vouchers (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL CHECK(discount_type IN ('percentage', 'fixed')),
      discount_value REAL NOT NULL,
      min_order_amount REAL DEFAULT 0,
      max_uses INTEGER DEFAULT 1,
      current_uses INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Inventory alerts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory_alerts (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      threshold INTEGER DEFAULT 10,
      is_triggered INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Carts table (for session-based carts)
  db.exec(`
    CREATE TABLE IF NOT EXISTS carts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      session_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Cart items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      cart_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cart_id) REFERENCES carts(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Create indexes for better performance
  db.exec(`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code)`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id)`);

  console.log('✅ Database initialized successfully');
}

export default db;
