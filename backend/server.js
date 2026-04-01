const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: ['http://localhost:3000', 'https://milqon-dairy.vercel.app'], credentials: true }));
app.use(express.json());

// Rate limiting — 100 requests per 15 min per IP
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { message: 'Too many requests, try again later' } }));

// Merchant UPI info
app.get('/api/merchant', (req, res) => {
  res.json({ upiId: process.env.MERCHANT_UPI, name: process.env.MERCHANT_NAME });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/payment', require('./routes/payment'));

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    // Auto-create admin and delivery users if not exist
    const bcrypt = require('bcryptjs');
    const User = require('./models/User');
    const adminExists = await User.findOne({ email: 'admin@milqondairy.com' });
    if (!adminExists) {
      const hash = await bcrypt.hash('Milqon@123', 10);
      await User.create({ name: 'Admin', email: 'admin@milqondairy.com', password: hash, role: 'admin' });
      console.log('Admin user created');
    }
    const deliveryExists = await User.findOne({ email: 'delivery@milqon.com' });
    if (!deliveryExists) {
      const hash = await bcrypt.hash('delivery123', 10);
      await User.create({ name: 'Delivery Boy', email: 'delivery@milqon.com', password: hash, role: 'delivery' });
      console.log('Delivery user created');
    }
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error(err));
