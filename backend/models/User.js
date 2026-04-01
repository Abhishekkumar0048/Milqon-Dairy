const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone:    { type: String },
  address:  { type: String },
  role:     { type: String, enum: ['user', 'admin', 'delivery'], default: 'user' },
  liveLocation: {
    lat:       { type: Number },
    lng:       { type: Number },
    updatedAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
