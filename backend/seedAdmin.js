const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const existing = await User.findOne({ email: 'admin@radhadairy.com' });
  if (existing) {
    await User.updateOne({ email: 'admin@radhadairy.com' }, { $set: { role: 'admin' } });
    console.log('✅ Existing user promoted to admin');
  } else {
    const password = await bcrypt.hash('admin123', 10);
    await User.create({ name: 'Admin', email: 'admin@radhadairy.com', password, role: 'admin' });
    console.log('✅ Admin user created');
  }
  console.log('📧 Email:    admin@radhadairy.com');
  console.log('🔑 Password: admin123');
  process.exit();
}).catch(err => { console.error(err); process.exit(1); });
