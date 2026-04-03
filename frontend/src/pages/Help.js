import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const TYPES = [
  { key: 'Order Issue',     icon: '📦', color: '#e3f2fd', border: '#1976d2', text: '#0d47a1' },
  { key: 'Payment Issue',   icon: '💳', color: '#fff3e0', border: '#f57c00', text: '#e65100' },
  { key: 'Product Quality', icon: '🥛', color: '#e8f5e9', border: '#2e7d32', text: '#1b5e20' },
  { key: 'Delivery Issue',  icon: '🚚', color: '#f3e5f5', border: '#7b1fa2', text: '#4a148c' },
  { key: 'Complaint',       icon: '⚠️', color: '#fce4ec', border: '#c62828', text: '#b71c1c' },
  { key: 'General Query',   icon: '💬', color: '#e0f7fa', border: '#00838f', text: '#006064' },
];

const FAQS = [
  { q: 'How do I track my order?', a: 'Go to "My Orders" page to see real-time status of your order.' },
  { q: 'What is the delivery time?', a: 'We deliver fresh dairy every morning by 7 AM for subscriptions. Regular orders within 2-4 hours.' },
  { q: 'Can I cancel my order?', a: 'Orders can be cancelled before they are confirmed. Contact us immediately after placing.' },
  { q: 'How to subscribe for daily milk?', a: 'During checkout, enable the "Daily Milk Subscription" toggle.' },
  { q: 'What payment methods are accepted?', a: 'We accept Cash on Delivery, UPI (GPay, PhonePe, Paytm, BHIM), and Card via Razorpay.' },
];

export default function Help() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '', type: 'General Query', message: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.email || !form.message) return setMsg('error:Please fill all required fields');
    setLoading(true); setMsg('');
    try {
      const { data } = await api.post('/support', form);
      setMsg('success:' + data.message);
      setForm(f => ({ ...f, message: '' }));
    } catch (err) {
      setMsg('error:' + (err.response?.data?.message || 'Failed to send. Try again.'));
    }
    setLoading(false);
  };

  const isSuccess = msg.startsWith('success:');
  const msgText = msg.replace(/^(success|error):/, '');

  return (
    <div className="container" style={{ maxWidth: 900, paddingTop: 32, paddingBottom: 48 }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 56, marginBottom: 10 }}>🎧</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1b5e20', margin: 0 }}>Help & Support</h1>
        <p style={{ color: '#888', marginTop: 8, fontSize: 15 }}>We're here to help! Send us your query or complaint and we'll respond within 24 hours.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>

        {/* LEFT — Form */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: '#1b5e20', marginBottom: 20 }}>📝 Send a Message</div>

          {/* Type selector */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600, fontSize: 13, color: '#555', display: 'block', marginBottom: 8 }}>Issue Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {TYPES.map(t => (
                <button key={t.key} onClick={() => set('type', t.key)} style={{
                  padding: '9px 10px', borderRadius: 10, border: `2px solid ${form.type === t.key ? t.border : '#e0e0e0'}`,
                  background: form.type === t.key ? t.color : '#fafafa', color: form.type === t.key ? t.text : '#666',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: 16 }}>{t.icon}</span>{t.key}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Full Name <span style={{ color: '#e53935' }}>*</span></label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
          </div>
          <div className="form-group">
            <label>Email <span style={{ color: '#e53935' }}>*</span></label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label>Phone (optional)</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Phone number" />
          </div>
          <div className="form-group">
            <label>Message / Complaint <span style={{ color: '#e53935' }}>*</span></label>
            <textarea rows={5} value={form.message} onChange={e => set('message', e.target.value)} placeholder="Describe your issue or query in detail..." style={{ resize: 'vertical' }} />
          </div>

          {msg && (
            <div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 14, background: isSuccess ? '#e8f5e9' : '#fce4ec', color: isSuccess ? '#2e7d32' : '#c62828', fontWeight: 600, fontSize: 13 }}>
              {isSuccess ? '✅ ' : '❌ '}{msgText}
            </div>
          )}

          <button onClick={submit} disabled={loading} style={{
            width: '100%', padding: 14, background: loading ? '#ccc' : '#2e7d32', color: '#fff',
            border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'transform 0.2s',
          }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {loading ? 'Sending...' : '📤 Send Message'}
          </button>
        </div>

        {/* RIGHT — Contact info + FAQ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Contact Cards */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#1b5e20', marginBottom: 16 }}>📞 Contact Us</div>
            {[
              { icon: '📱', label: 'Phone / WhatsApp', value: '+91-XXXXXXXXXX', color: '#e8f5e9' },
              { icon: '📧', label: 'Email', value: 'milqondairy@gmail.com', color: '#e3f2fd' },
              { icon: '⏰', label: 'Support Hours', value: 'Mon–Sat, 7 AM – 8 PM', color: '#fff8e1' },
              { icon: '📍', label: 'Location', value: 'Bokaro Steel City, Jharkhand – 828304', color: '#f3e5f5' },
            ].map(c => (
              <div key={c.label} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
                background: c.color, borderRadius: 12, marginBottom: 10,
                transition: 'transform 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
              >
                <span style={{ fontSize: 24 }}>{c.icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>{c.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ fontWeight: 800, fontSize: 17, color: '#1b5e20', marginBottom: 16 }}>❓ FAQs</div>
            {FAQS.map((f, i) => (
              <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? '1px solid #f0f0f0' : 'none', marginBottom: 4 }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                  width: '100%', background: 'none', border: 'none', textAlign: 'left', padding: '12px 0',
                  fontWeight: 700, fontSize: 13, color: '#1a1a1a', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  {f.q}
                  <span style={{ fontSize: 18, color: '#2e7d32', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ fontSize: 13, color: '#666', paddingBottom: 12, lineHeight: 1.6 }}>{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile responsive */}
      <style>{`@media(max-width:700px){.help-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
