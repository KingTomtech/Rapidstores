import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const createVoucher = (voucherData) => {
  const {
    code,
    discount_type,
    discount_value,
    min_order_amount = 0,
    max_uses = 1,
    expires_at
  } = voucherData;

  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO vouchers (id, code, discount_type, discount_value, min_order_amount, max_uses, current_uses, is_active, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?)
  `);

  stmt.run(id, code, discount_type, discount_value, min_order_amount, max_uses, expires_at || null);
  return getVoucherByCode(code);
};

export const getVoucherByCode = (code) => {
  const stmt = db.prepare('SELECT * FROM vouchers WHERE code = ?');
  return stmt.get(code);
};

export const getAllVouchers = () => {
  const stmt = db.prepare('SELECT * FROM vouchers ORDER BY created_at DESC');
  return stmt.all();
};

export const validateVoucher = (code, orderAmount) => {
  const voucher = getVoucherByCode(code);
  
  if (!voucher) {
    return { valid: false, error: 'Invalid voucher code' };
  }

  if (!voucher.is_active) {
    return { valid: false, error: 'Voucher is inactive' };
  }

  if (voucher.current_uses >= voucher.max_uses) {
    return { valid: false, error: 'Voucher has reached maximum uses' };
  }

  if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
    return { valid: false, error: 'Voucher has expired' };
  }

  if (orderAmount < voucher.min_order_amount) {
    return { 
      valid: false, 
      error: `Minimum order amount is ZMW ${voucher.min_order_amount}` 
    };
  }

  let discount = 0;
  if (voucher.discount_type === 'percentage') {
    discount = (orderAmount * voucher.discount_value) / 100;
  } else {
    discount = voucher.discount_value;
  }

  return {
    valid: true,
    discount,
    discount_type: voucher.discount_type,
    discount_value: voucher.discount_value
  };
};

export const useVoucher = (code) => {
  const stmt = db.prepare(`
    UPDATE vouchers 
    SET current_uses = current_uses + 1
    WHERE code = ?
  `);
  stmt.run(code);
  return getVoucherByCode(code);
};

export const toggleVoucherStatus = (id) => {
  const voucher = getVoucherById(id);
  if (!voucher) return null;

  const newStatus = voucher.is_active ? 0 : 1;
  const stmt = db.prepare(`
    UPDATE vouchers 
    SET is_active = ?
    WHERE id = ?
  `);
  stmt.run(newStatus, id);
  return getVoucherById(id);
};

export const getVoucherById = (id) => {
  const stmt = db.prepare('SELECT * FROM vouchers WHERE id = ?');
  return stmt.get(id);
};

export const deleteVoucher = (id) => {
  const stmt = db.prepare('DELETE FROM vouchers WHERE id = ?');
  return stmt.run(id);
};

export const generateVoucherCode = (prefix = 'RAPID') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = prefix + '-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
