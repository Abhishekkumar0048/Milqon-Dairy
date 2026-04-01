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
    // Seed products if empty
    const Product = require('./models/Product');
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const products = [
        { name: 'Full Cream Milk', category: 'milk', price: 60, unit: '1L', description: 'Fresh full cream milk' },
        { name: 'Toned Milk', category: 'milk', price: 50, unit: '1L', description: 'Low fat toned milk' },
        { name: 'Buffalo Milk', category: 'milk', price: 70, unit: '1L', description: 'Rich creamy buffalo milk' },
        { name: 'Cow Milk (A2)', category: 'milk', price: 80, unit: '1L', description: 'Pure A2 desi cow milk' },
        { name: 'Fresh Paneer', category: 'paneer', price: 80, unit: '200g', description: 'Soft homemade paneer' },
        { name: 'Malai Paneer', category: 'paneer', price: 110, unit: '200g', description: 'Extra creamy malai paneer' },
        { name: 'Dahi (Curd)', category: 'curd', price: 40, unit: '500g', description: 'Thick creamy curd' },
        { name: 'Mishti Doi', category: 'curd', price: 55, unit: '400g', description: 'Sweet Bengali style curd' },
        { name: 'Pure Cow Ghee', category: 'ghee', price: 800, unit: '500ml', description: 'Pure bilona method cow ghee' },
        { name: 'Buffalo Ghee', category: 'ghee', price: 900, unit: '500ml', description: 'Rich buffalo milk ghee' },
        { name: 'White Butter', category: 'butter', price: 120, unit: '200g', description: 'Fresh homemade white butter' },
        { name: 'Salted Butter', category: 'butter', price: 130, unit: '200g', description: 'Lightly salted fresh butter' },
        { name: 'Desi Makhan', category: 'makhan', price: 150, unit: '200g', description: 'Traditional hand-churned makhan' },
        { name: 'Malai Makhan', category: 'makhan', price: 180, unit: '200g', description: 'Soft creamy malai makhan' },
        { name: 'Sweet Lassi', category: 'lassi', price: 40, unit: '300ml', description: 'Chilled sweet lassi' },
        { name: 'Salted Lassi', category: 'lassi', price: 35, unit: '300ml', description: 'Refreshing salted lassi' },
        { name: 'Mango Lassi', category: 'lassi', price: 55, unit: '300ml', description: 'Thick mango flavored lassi' },
        { name: 'Rose Lassi', category: 'lassi', price: 50, unit: '300ml', description: 'Fragrant rose lassi' },
        { name: 'Masala Chach', category: 'chach', price: 25, unit: '250ml', description: 'Spiced buttermilk' },
        { name: 'Plain Chach', category: 'chach', price: 20, unit: '250ml', description: 'Light refreshing buttermilk' },
        { name: 'Milk Peda', category: 'peda', price: 200, unit: '250g (10 pcs)', description: 'Traditional soft milk peda' },
        { name: 'Kesar Peda', category: 'peda', price: 250, unit: '250g (10 pcs)', description: 'Saffron flavored peda' },
        { name: 'Chocolate Peda', category: 'peda', price: 220, unit: '250g (10 pcs)', description: 'Fusion chocolate peda' },
      ];
      await Product.insertMany(products);
      console.log('Products seeded!');
    }
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error(err));
