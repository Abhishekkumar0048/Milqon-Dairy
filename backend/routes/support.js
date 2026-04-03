const router = require('express').Router();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// POST /api/support
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, type, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: 'Name, email and message are required' });

    await transporter.sendMail({
      from: `"Milqon Support" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `[${type || 'General'}] Support Request from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:12px">
          <h2 style="color:#2e7d32">🥛 Milqon Dairy — Support Request</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px;color:#888;width:100px">Name</td><td style="padding:8px;font-weight:700">${name}</td></tr>
            <tr><td style="padding:8px;color:#888">Email</td><td style="padding:8px">${email}</td></tr>
            <tr><td style="padding:8px;color:#888">Phone</td><td style="padding:8px">${phone || '—'}</td></tr>
            <tr><td style="padding:8px;color:#888">Type</td><td style="padding:8px"><b>${type || 'General'}</b></td></tr>
          </table>
          <div style="background:#f1f8e9;border-radius:8px;padding:16px;margin-top:12px;font-size:14px;color:#333;line-height:1.6">${message}</div>
        </div>`,
    });

    res.json({ message: 'Your message has been sent! We will get back to you soon.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message. Please try again.' });
  }
});

module.exports = router;
