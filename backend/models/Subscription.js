const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date:      { type: String, required: true }, // YYYY-MM-DD
  delivered: { type: Boolean, default: false },
  quantity:  { type: Number },                 // override for that day (optional)
});

const subscriptionSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:       { type: String, required: true },
  phone:      { type: String, required: true },
  address:    { type: String, required: true },
  milkType:   { type: String, default: 'Full Cream Milk' },
  quantity:   { type: Number, required: true },  // litres per day e.g. 0.5, 1, 2
  pricePerLitre: { type: Number, required: true },
  startDate:  { type: String, required: true },  // YYYY-MM-DD
  active:     { type: Boolean, default: true },
  cancelled:  { type: Boolean, default: false },
  attendance: [attendanceSchema],
  paidMonths: [{ type: String }], // format: "YYYY-MM"
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
