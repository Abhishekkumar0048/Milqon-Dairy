const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  next();
};

// In-memory OTP store { email: { otp, expiry } }
const otpStore = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

router.post('/register',
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
  async (req, res) => {
    try {
      const { name, email, password, phone, address } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already registered' });
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed, phone, address });
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.post('/login',
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid credentials' });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ message: 'Invalid credentials' });
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Send OTP for forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with this email' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expiry: Date.now() + 10 * 60 * 1000 }; // 10 min
    await transporter.sendMail({
      from: `"Milqon Dairy" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP — Milqon Dairy',
      html: `<div style="font-family:sans-serif;max-width:400px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px">
        <h2 style="color:#2e7d32">🥛 Milqon Dairy</h2>
        <p>Your OTP to reset password:</p>
        <div style="font-size:36px;font-weight:900;color:#1b5e20;letter-spacing:8px;text-align:center;padding:16px;background:#f1f8e9;border-radius:8px">${otp}</div>
        <p style="color:#888;font-size:13px;margin-top:16px">Valid for 10 minutes. Do not share with anyone.</p>
      </div>`,
    });
    res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send OTP. Check email config.' });
  }
});

// Verify OTP and reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const record = otpStore[email];
    if (!record || record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (Date.now() > record.expiry) return res.status(400).json({ message: 'OTP expired. Request a new one.' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashed });
    delete otpStore[email];
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile (name, email, password)
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }
    if (name) user.name = name;
    if (newPassword) {
      const match = await bcrypt.compare(currentPassword || '', user.password);
      if (!match) return res.status(400).json({ message: 'Current password is incorrect' });
      user.password = await bcrypt.hash(newPassword, 10);
    }
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
