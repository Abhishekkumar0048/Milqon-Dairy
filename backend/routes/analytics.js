const router = require('express').Router();
const Order = require('../models/Order');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find();

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;
    const pending   = orders.filter(o => o.status === 'pending').length;
    const confirmed = orders.filter(o => o.status === 'confirmed').length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const subscriptions = orders.filter(o => o.subscription).length;

    // Revenue by day (last 7 days)
    const now = new Date();
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const revenueByDay = last7.map(day => ({
      day,
      revenue: orders
        .filter(o => o.createdAt.toISOString().slice(0, 10) === day)
        .reduce((sum, o) => sum + o.totalAmount, 0)
    }));

    // Top products by quantity sold
    const productMap = {};
    orders.forEach(o => o.items.forEach(i => {
      productMap[i.name] = (productMap[i.name] || 0) + i.quantity;
    }));
    const topProducts = Object.entries(productMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));

    res.json({ totalRevenue, totalOrders, pending, confirmed, delivered, subscriptions, revenueByDay, topProducts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
