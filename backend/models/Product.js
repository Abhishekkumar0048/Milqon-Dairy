const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  category:    { type: String, enum: ['milk', 'paneer', 'curd', 'ghee', 'butter', 'makhan', 'lassi', 'chach', 'peda'], required: true },
  price:       { type: Number, required: true },
  unit:        { type: String, default: '1L' },
  description: { type: String },
  image:       { type: String },
  inStock:     { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
