const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hash = await bcrypt.hash('Milqon@123', 10);
  const result = await User.findOneAndUpdate(
    { email: 'admin@milqondairy.com' },
    { $set: { password: hash, role: 'admin' } },
    { new: true, upsert: true }
  );
  console.log('✅ Admin password reset successfully');
  console.log('📧 Email:    admin@milqondairy.com');
  console.log('🔑 Password: Milqon@123');
  process.exit();
}).catch(err => { console.error(err); process.exit(1); });
