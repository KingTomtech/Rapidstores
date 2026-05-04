import db from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const createUser = (userData) => {
  const { phone, name, email, password, role = 'customer' } = userData;
  const id = uuidv4();
  
  let passwordHash = null;
  if (password) {
    passwordHash = bcrypt.hashSync(password, 10);
  }

  const stmt = db.prepare(`
    INSERT INTO users (id, phone, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, phone, name, email || null, passwordHash, role);
  return { id, phone, name, email, role };
};

export const findUserByPhone = (phone) => {
  const stmt = db.prepare('SELECT * FROM users WHERE phone = ?');
  return stmt.get(phone);
};

export const findUserById = (id) => {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
};

export const validatePassword = (user, password) => {
  if (!user.password_hash) return false;
  return bcrypt.compareSync(password, user.password_hash);
};

export const getAllUsers = () => {
  const stmt = db.prepare('SELECT id, phone, name, email, role, created_at FROM users');
  return stmt.all();
};

export const updateUser = (id, userData) => {
  const { name, email } = userData;
  const stmt = db.prepare(`
    UPDATE users 
    SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(name, email || null, id);
  return findUserById(id);
};
