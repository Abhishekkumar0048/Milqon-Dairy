const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:          { type: String, required: true },
  phone:         { type: String, required: true },
  address:       { type: String, required: true },
  landmark:      { type: String },
  pincode:       { type: String },
  location:      { type: String },
  items: [
    {
      product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name:     String,
      quantity: Number,
      price:    Number
    }
  ],
  totalAmount:   { type: Number, required: true },
  paymentMethod:    { type: String, enum: ['cod', 'gpay', 'phonepe', 'bhimupi', 'paytm'], default: 'cod' },
  upiTransactionId: { type: String },
  paymentStatus:    { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  status:        { type: String, enum: ['pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'], default: 'pending' },
  statusHistory: [
    {
      status:    { type: String },
      message:   { type: String },
      updatedAt: { type: Date, default: Date.now }
    }
  ],
  subscription:  { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
