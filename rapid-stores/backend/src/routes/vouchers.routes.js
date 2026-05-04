import { Router } from 'express';
import { createVoucher, getAllVouchers, toggleVoucherStatus, deleteVoucher, generateVoucherCode } from '../models/voucher.model.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all vouchers (admin only)
router.get('/', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const vouchers = getAllVouchers();
    res.json(vouchers);
  } catch (error) {
    console.error('Get vouchers error:', error);
    res.status(500).json({ error: 'Failed to get vouchers' });
  }
});

// Create voucher (admin only)
router.post('/', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { code, discount_type, discount_value, min_order_amount, max_uses, expires_at } = req.body;

    // Validate required fields
    if (!discount_type || !discount_value) {
      return res.status(400).json({ error: 'Discount type and value are required' });
    }

    // Validate discount type
    if (!['percentage', 'fixed'].includes(discount_type)) {
      return res.status(400).json({ error: 'Invalid discount type. Must be "percentage" or "fixed"' });
    }

    // Generate code if not provided
    const voucherCode = code || generateVoucherCode();

    const voucher = createVoucher({
      code: voucherCode,
      discount_type,
      discount_value,
      min_order_amount,
      max_uses,
      expires_at
    });

    res.status(201).json(voucher);
  } catch (error) {
    console.error('Create voucher error:', error);
    res.status(500).json({ error: 'Failed to create voucher' });
  }
});

// Toggle voucher status (admin only)
router.put('/:id/toggle', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const voucher = toggleVoucherStatus(req.params.id);
    if (!voucher) {
      return res.status(404).json({ error: 'Voucher not found' });
    }

    res.json(voucher);
  } catch (error) {
    console.error('Toggle voucher error:', error);
    res.status(500).json({ error: 'Failed to toggle voucher' });
  }
});

// Delete voucher (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    deleteVoucher(req.params.id);
    res.json({ message: 'Voucher deleted successfully' });
  } catch (error) {
    console.error('Delete voucher error:', error);
    res.status(500).json({ error: 'Failed to delete voucher' });
  }
});

export default router;
