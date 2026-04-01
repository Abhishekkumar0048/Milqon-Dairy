const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  
  // Admin
  const adminExists = await User.findOne({ email: 'admin@milqondairy.com' });
  if (!adminExists) {
    const hash = await bcrypt.hash('Milqon@123', 10);
    await User.create({ name: 'Admin', email: 'admin@milqondairy.com', password: hash, role: 'admin' });
    console.log('Admin created!');
  } else {
    console.log('Admin already exists');
  }

  // Delivery
  const deliveryExists = await User.findOne({ email: 'delivery@milqon.com' });
  if (!deliveryExists) {
    const hash = await bcrypt.hash('delivery123', 10);
    await User.create({ name: 'Delivery Boy', email: 'delivery@milqon.com', password: hash, role: 'delivery' });
    console.log('Delivery user created!');
  } else {
    console.log('Delivery user already exists');
  }

  process.exit();
}).catch(err => { console.error(err); process.exit(1); });
