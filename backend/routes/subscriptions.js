const router = require('express').Router();
const Subscription = require('../models/Subscription');
const { auth, adminOnly } = require('../middleware/auth');
const adminAuth = [auth, adminOnly];

// GET all subscriptions (admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const subs = await Subscription.find().sort({ createdAt: -1 });
    res.json(subs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET my subscription (user) — match by user id OR phone
router.get('/my', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const me = await User.findById(req.user.id);
    const sub = await Subscription.findOne({
      $or: [
        { user: req.user.id },
        { phone: me?.phone }
      ]
    }).sort({ createdAt: -1 });
    res.json(sub);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create subscription (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const sub = await Subscription.create(req.body);
    res.status(201).json(sub);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST customer self-request subscription
router.post('/request', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const me = await User.findById(req.user.id);
    const existing = await Subscription.findOne({ $or: [{ user: req.user.id }, { phone: me?.phone }] });
    if (existing) return res.status(400).json({ message: 'You already have a subscription' });
    const { quantity, address, phone, name, deliveryTime } = req.body;
    const sub = await Subscription.create({
      user: req.user.id,
      name: name || me.name,
      phone: phone || me.phone || '',
      address,
      milkType: 'Full Cream Milk',
      quantity: Number(quantity),
      pricePerLitre: 60,
      deliveryTime: deliveryTime || 'morning',
      startDate: new Date().toISOString().split('T')[0],
      active: false,
    });
    res.status(201).json(sub);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT mark attendance for a date (admin)
router.put('/:id/attendance', adminAuth, async (req, res) => {
  try {
    const { date, delivered } = req.body;
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });

    const existing = sub.attendance.find(a => a.date === date);
    if (existing) {
      existing.delivered = delivered;
    } else {
      sub.attendance.push({ date, delivered, quantity: sub.quantity });
    }
    await sub.save();
    res.json(sub);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT toggle active (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(sub);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST mark month as paid (user)
router.post('/:id/pay', auth, async (req, res) => {
  try {
    const { monthKey } = req.body; // "YYYY-MM"
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Not found' });
    if (!sub.paidMonths.includes(monthKey)) {
      sub.paidMonths.push(monthKey);
      await sub.save();
    }
    res.json({ success: true, paidMonths: sub.paidMonths });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT cancel subscription (user)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user.id });
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    sub.active = false;
    sub.cancelled = true;
    await sub.save();
    res.json(sub);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE subscription (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await Subscription.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET monthly bill for a subscription
router.get('/:id/bill', auth, async (req, res) => {
  try {
    const { month, year } = req.query; // e.g. month=4&year=2025
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Not found' });

    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    const monthAttendance = sub.attendance.filter(a => a.date.startsWith(prefix));
    const deliveredDays = monthAttendance.filter(a => a.delivered).length;
    const totalLitres = deliveredDays * sub.quantity;
    const totalAmount = totalLitres * sub.pricePerLitre;

    res.json({ deliveredDays, totalLitres, totalAmount, pricePerLitre: sub.pricePerLitre, quantity: sub.quantity, attendance: monthAttendance });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
