import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { createUser, findUserByPhone, validatePassword, getAllUsers, updateUser } from '../models/user.model.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Register new user
router.post('/register', (req, res) => {
  try {
    const { phone, name, email, password } = req.body;

    // Validate required fields
    if (!phone || !name) {
      return res.status(400).json({ error: 'Phone and name are required' });
    }

    // Check if user already exists
    const existingUser = findUserByPhone(phone);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this phone number already exists' });
    }

    // Create user
    const user = createUser({ phone, name, email, password });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    const user = findUserByPhone(phone);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!validatePassword(user, password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user profile
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = findUserByPhone(req.user.phone);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/me', authMiddleware, (req, res) => {
  try {
    const { name, email } = req.body;
    const updatedUser = updateUser(req.user.id, { name, email });
    
    res.json({
      id: updatedUser.id,
      phone: updatedUser.phone,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Admin: Get all users
router.get('/admin/users', authMiddleware, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const users = getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

export default router;
