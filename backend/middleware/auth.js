const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access only' });
  next();
};

const deliveryOnly = (req, res, next) => {
  if (!['admin', 'delivery'].includes(req.user.role)) return res.status(403).json({ message: 'Delivery access only' });
  next();
};

module.exports = { auth, adminOnly, deliveryOnly };
