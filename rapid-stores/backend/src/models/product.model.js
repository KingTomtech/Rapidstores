import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const createProduct = (productData) => {
  const {
    name,
    description,
    price,
    stock_quantity,
    category,
    image_url,
    is_manufactured = false,
    production_status = 'not_applicable',
    custom_options
  } = productData;

  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO products (id, name, description, price, stock_quantity, category, image_url, is_manufactured, production_status, custom_options)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    name,
    description || null,
    price,
    stock_quantity || 0,
    category,
    image_url || null,
    is_manufactured ? 1 : 0,
    production_status,
    custom_options ? JSON.stringify(custom_options) : null
  );

  return getProductById(id);
};

export const getProductById = (id) => {
  const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
  return stmt.get(id);
};

export const getAllProducts = (filters = {}) => {
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (filters.category) {
    query += ' AND category = ?';
    params.push(filters.category);
  }

  if (filters.is_manufactured !== undefined) {
    query += ' AND is_manufactured = ?';
    params.push(filters.is_manufactured ? 1 : 0);
  }

  if (filters.in_stock) {
    query += ' AND stock_quantity > 0';
  }

  if (filters.search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY created_at DESC';

  const stmt = db.prepare(query);
  return stmt.all(...params);
};

export const updateProduct = (id, productData) => {
  const {
    name,
    description,
    price,
    stock_quantity,
    category,
    image_url,
    is_manufactured,
    production_status,
    custom_options
  } = productData;

  const stmt = db.prepare(`
    UPDATE products SET
      name = ?,
      description = ?,
      price = ?,
      stock_quantity = ?,
      category = ?,
      image_url = ?,
      is_manufactured = ?,
      production_status = ?,
      custom_options = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(
    name,
    description || null,
    price,
    stock_quantity,
    category,
    image_url || null,
    is_manufactured ? 1 : 0,
    production_status,
    custom_options ? JSON.stringify(custom_options) : null,
    id
  );

  return getProductById(id);
};

export const deleteProduct = (id) => {
  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  return stmt.run(id);
};

export const getLowStockProducts = (threshold = 10) => {
  const stmt = db.prepare('SELECT * FROM products WHERE stock_quantity <= ?');
  return stmt.all(threshold);
};

export const getCategories = () => {
  const stmt = db.prepare('SELECT DISTINCT category FROM products');
  return stmt.all().map(row => row.category);
};

export const updateStock = (id, quantityChange) => {
  const stmt = db.prepare(`
    UPDATE products 
    SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(quantityChange, id);
  return getProductById(id);
};
