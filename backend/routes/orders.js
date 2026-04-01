const router = require('express').Router();
const Order = require('../models/Order');
const { auth, adminOnly, deliveryOnly } = require('../middleware/auth');

// Place order
router.post('/', async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      statusHistory: [{ status: 'pending', message: 'Order placed successfully' }]
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders - admin only
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get orders by user
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get confirmed+out_for_delivery orders for delivery man
router.get('/delivery', auth, deliveryOnly, async (req, res) => {
  try {
    const orders = await Order.find({ status: { $in: ['confirmed', 'out_for_delivery'] } }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delivery man update live location
router.post('/delivery/location', auth, deliveryOnly, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.id, { liveLocation: { lat, lng, updatedAt: new Date() } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get delivery man live location - admin only
router.get('/delivery/location', auth, adminOnly, async (req, res) => {
  try {
    const User = require('../models/User');
    const delivery = await User.findOne({ role: 'delivery' }, 'name liveLocation');
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status - admin only
const STATUS_MESSAGES = {
  pending:          'Order placed successfully',
  confirmed:        'Order confirmed by Milqon Dairy',
  out_for_delivery: 'Out for delivery — arriving soon!',
  delivered:        'Order delivered successfully',
};

router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, $push: { statusHistory: { status, message: STATUS_MESSAGES[status] || status } } },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel order - user only pending
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'pending') return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', message: 'Order cancelled by customer' });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delivery man update: confirmed→out_for_delivery or out_for_delivery→delivered
router.put('/:id/delivery-update', auth, deliveryOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const allowed = (order.status === 'confirmed' && status === 'out_for_delivery') ||
                    (order.status === 'out_for_delivery' && status === 'delivered');
    if (!allowed) return res.status(400).json({ message: 'Invalid status update' });
    order.status = status;
    order.statusHistory.push({ status, message: STATUS_MESSAGES[status] });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
