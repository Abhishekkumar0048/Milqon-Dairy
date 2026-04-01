import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const PAYMENT_OPTIONS = [
  { key: 'cod',      label: 'Cash on Delivery', img: null,             emoji: '💵' },
  { key: 'razorpay', label: 'Pay via UPI / Card', img: null,           emoji: '💳' },
  { key: 'gpay',     label: 'Google Pay',        img: '/gpay.png' },
  { key: 'phonepe',  label: 'PhonePe',           img: '/phonepe.png' },
  { key: 'bhimupi',  label: 'BHIM UPI',          img: '/bhimupi.png' },
  { key: 'paytm',    label: 'Paytm',             img: '/paytm.png' },
];

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || '', phone: '', address: '', landmark: '', pincode: '', location: '', paymentMethod: 'cod', subscription: false });
  const [upiStep, setUpiStep]           = useState(false);   // show UPI payment screen
  const [upiTxnId, setUpiTxnId]         = useState('');
  const [merchant, setMerchant]         = useState({ upiId: '', name: 'Milqon Dairy' });
  const [loading, setLoading]           = useState(false);
  const [locLoading, setLocLoading]     = useState(false);
  const [copied, setCopied]             = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    api.get('/merchant').then(r => setMerchant(r.data)).catch(() => {});
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          set('address', data.display_name || `${latitude}, ${longitude}`);
          set('location', `https://maps.google.com/?q=${latitude},${longitude}`);
          set('pincode', data.address?.postcode || '');
        } catch {
          set('location', `https://maps.google.com/?q=${latitude},${longitude}`);
        }
        setLocLoading(false);
      },
      () => { alert('Location access denied'); setLocLoading(false); }
    );
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(merchant.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openRazorpay = async () => {
    try {
      const { data } = await api.post('/payment/create-order', { amount: total });
      const options = {
        key: data.key,
        amount: total * 100,
        currency: 'INR',
        name: 'Milqon Dairy',
        description: 'Order Payment',
        order_id: data.orderId,
        handler: async (response) => {
          // Verify payment
          const verify = await api.post('/payment/verify', response);
          if (verify.data.verified) {
            await placeOrder(verify.data.paymentId);
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: { name: form.name, contact: form.phone },
        theme: { color: '#2e7d32' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert('Could not initiate payment. Try again.');
    }
  };

  // Step 1 — validate form, if UPI show payment screen else place order directly
  const handleProceed = () => {
    if (!form.name || !form.phone || !form.address) return alert('Please fill all fields');
    if (form.paymentMethod === 'cod') {
      placeOrder();
    } else if (form.paymentMethod === 'razorpay') {
      openRazorpay();
    } else {
      setUpiStep(true);
      window.scrollTo(0, 0);
    }
  };

  // Step 2 — place order with UPI txn ID
  const placeOrder = async (txnId = '') => {
    if (form.paymentMethod !== 'cod' && form.paymentMethod !== 'razorpay' && !txnId) return alert('Please enter your UPI Transaction ID');
    setLoading(true);
    try {
      await api.post('/orders', {
        ...form,
        user: user?.id,
        items: cart.map(i => ({ product: i._id, name: i.name, quantity: i.qty, price: i.price })),
        totalAmount: total,
        upiTransactionId: txnId,
        paymentStatus: form.paymentMethod === 'cod' ? 'pending' : 'paid',
      });
      clearCart();
      navigate('/my-orders');
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed');
    }
    setLoading(false);
  };

  const getUpiLink = (appKey) => {
    const base = `pa=${merchant.upiId}&pn=${encodeURIComponent(merchant.name)}&am=${total}&cu=INR&tn=${encodeURIComponent('Milqon Dairy Order')}`;
    const links = {
      gpay:    `intent://pay?${base}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`,
      phonepe: `intent://pay?${base}#Intent;scheme=upi;package=com.phonepe.app;end`,
      paytm:   `intent://pay?${base}#Intent;scheme=upi;package=net.one97.paytm;end`,
      bhimupi: `intent://pay?${base}#Intent;scheme=upi;package=in.org.npci.upiapp;end`,
    };
    return links[appKey] || `upi://pay?${base}`;
  };

  // ── UPI Payment Screen ──
  if (upiStep) {
    const selectedApp = PAYMENT_OPTIONS.find(p => p.key === form.paymentMethod);
    return (
      <div className="container" style={{ maxWidth: 500, paddingTop: 24 }}>
        <button onClick={() => setUpiStep(false)} style={{ background: 'none', border: 'none', color: '#2e7d32', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 16 }}>
          ← Back
        </button>

        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>

          {/* App Icon & Title */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            {selectedApp?.img && <img src={selectedApp.img} alt={selectedApp.label} style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 8 }} />}
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a' }}>Pay via {selectedApp?.label}</div>
          </div>

          {/* Amount Box */}
          <div style={{ background: '#f1f8e9', border: '2px solid #2e7d32', borderRadius: 12, padding: '16px', textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Amount to Pay</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: '#1b5e20' }}>₹{total}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Milqon Dairy Order</div>
          </div>

          {/* UPI ID Box */}
          <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '14px', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Pay to UPI ID</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', letterSpacing: 0.5 }}>{merchant.upiId}</span>
              <button onClick={copyUPI} style={{ background: copied ? '#2e7d32' : '#e8f5e9', color: copied ? '#fff' : '#2e7d32', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Name: {merchant.name}</div>
          </div>

          {/* Open App Button */}
          <a href={getUpiLink(form.paymentMethod)}
            style={{ width: '100%', padding: 14, background: '#1b5e20', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, textDecoration: 'none' }}>
            {selectedApp?.img && <img src={selectedApp.img} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />}
            Open {selectedApp?.label} & Pay ₹{total}
          </a>

          <div style={{ textAlign: 'center', color: '#888', fontSize: 13, marginBottom: 16 }}>
            — After payment, enter Transaction ID below —
          </div>

          {/* Transaction ID Input */}
          <div className="form-group">
            <label style={{ fontWeight: 700 }}>UPI Transaction ID <span style={{ color: '#e53935' }}>*</span></label>
            <input
              placeholder="e.g. 123456789012"
              value={upiTxnId}
              onChange={e => setUpiTxnId(e.target.value)}
              style={{ fontSize: 16, letterSpacing: 1 }}
            />
            <span style={{ fontSize: 12, color: '#888' }}>Find it in your payment app under transaction history</span>
          </div>

          {/* Order Summary */}
          <div style={{ background: '#f8f9fa', borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: '#555' }}>Order Summary</div>
            {cart.map(i => (
              <div key={i._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{i.name} × {i.qty}</span><span>₹{i.price * i.qty}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15, borderTop: '1px solid #e0e0e0', paddingTop: 8, marginTop: 8, color: '#1b5e20' }}>
              <span>Total</span><span>₹{total}</span>
            </div>
          </div>

          <button onClick={() => placeOrder(upiTxnId)} disabled={loading || !upiTxnId}
            style={{ width: '100%', padding: 14, background: upiTxnId ? '#2e7d32' : '#ccc', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: upiTxnId ? 'pointer' : 'not-allowed' }}>
            {loading ? 'Placing Order...' : `✅ Confirm Order — ₹${total}`}
          </button>
        </div>
      </div>
    );
  }

  // ── Normal Checkout Form ──
  return (
    <div className="container" style={{ maxWidth: 600, paddingTop: 24 }}>
      <div className="section-title">Checkout</div>

      <div className="form-group"><label>Full Name</label>
        <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
      </div>
      <div className="form-group"><label>Phone Number</label>
        <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Phone number" />
      </div>

      <div className="form-group">
        <label>Delivery Address</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button type="button" className="btn btn-outline" style={{ whiteSpace: 'nowrap', padding: '8px 14px', fontSize: 13 }} onClick={detectLocation} disabled={locLoading}>
            {locLoading ? '📍 Detecting...' : '📍 Use My Location'}
          </button>
          {form.location && <a href={form.location} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '8px 14px', fontSize: 13 }}>🗺️ View Map</a>}
        </div>
        <textarea rows={3} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address" />
      </div>

      <div className="form-group"><label>Landmark (optional)</label>
        <input value={form.landmark} onChange={e => set('landmark', e.target.value)} placeholder="Near school, temple, etc." />
      </div>
      <div className="form-group"><label>Pincode</label>
        <input value={form.pincode} onChange={e => set('pincode', e.target.value)} placeholder="Pincode" />
      </div>

      <div className="form-group">
        <label>Payment Method</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {PAYMENT_OPTIONS.map(m => (
            <button key={m.key} onClick={() => set('paymentMethod', m.key)}
              style={{ padding: '12px 10px', borderRadius: 10, border: `2px solid ${form.paymentMethod === m.key ? '#2e7d32' : '#e0e0e0'}`, background: form.paymentMethod === m.key ? '#f1f8e9' : '#fff', color: form.paymentMethod === m.key ? '#1b5e20' : '#555', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {m.img
                ? <img src={m.img} alt={m.label} style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6 }} />
                : <span style={{ fontSize: 24 }}>{m.emoji}</span>
              }
              {m.label}
              {form.paymentMethod === m.key && <span style={{ marginLeft: 'auto', color: '#2e7d32' }}>✔️</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="switch-row" style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600 }}>🔄 Daily Milk Subscription</label>
        <input type="checkbox" checked={form.subscription} onChange={e => set('subscription', e.target.checked)} style={{ width: 'auto', cursor: 'pointer' }} />
      </div>

      <div className="checkout-summary">
        <div style={{ fontWeight: 'bold', color: '#2e7d32', marginBottom: 10 }}>Order Summary</div>
        {cart.map(i => (
          <div key={i._id} className="summary-row">
            <span>{i.name} × {i.qty}</span><span>₹{i.price * i.qty}</span>
          </div>
        ))}
        <div className="summary-row total"><span>Total</span><span>₹{total}</span></div>
      </div>

      <button className="btn btn-primary" style={{ width: '100%', padding: 14, fontSize: 16 }} onClick={handleProceed} disabled={loading}>
        {form.paymentMethod === 'cod' ? `Place Order — ₹${total}` : `Proceed to Pay — ₹${total}`}
      </button>
    </div>
  );
}
