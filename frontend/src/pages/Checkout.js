import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const PAYMENT_OPTIONS = [
  { key: 'cod',      label: 'Cash on Delivery', img: null, emoji: '💵' },
  { key: 'razorpay', label: 'Pay via UPI / Card', img: null, emoji: '💳' },
  { key: 'gpay',     label: 'Google Pay',        img: '/gpay.png' },
  { key: 'phonepe',  label: 'PhonePe',           img: '/phonepe.png' },
  { key: 'bhimupi',  label: 'BHIM UPI',          img: '/bhimupi.png' },
  { key: 'paytm',    label: 'Paytm',             img: '/paytm.png' },
];

const ADDR_KEY = 'dairy_address';

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const savedAddr = (() => { try { return JSON.parse(localStorage.getItem(ADDR_KEY)) || {}; } catch { return {}; } })();

  const [step, setStep] = useState(1); // 1=address, 2=summary, 3=payment
  const [editAddr, setEditAddr] = useState(!savedAddr.address); // if no saved address, start in edit mode
  const [form, setForm] = useState({
    name:          savedAddr.name     || user?.name || '',
    phone:         savedAddr.phone    || '',
    address:       savedAddr.address  || '',
    landmark:      savedAddr.landmark || '',
    pincode:       savedAddr.pincode  || '',
    location:      savedAddr.location || '',
    paymentMethod: 'cod',
    subscription:  false,
  });
  const [upiStep, setUpiStep]       = useState(false);
  const [upiTxnId, setUpiTxnId]     = useState('');
  const [merchant, setMerchant]     = useState({ upiId: '', name: 'Milqon Dairy' });
  const [loading, setLoading]       = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [copied, setCopied]         = useState(false);

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

  const saveAndNext = () => {
    if (!form.name || !form.phone || !form.address) return alert('Please fill all required fields');
    localStorage.setItem(ADDR_KEY, JSON.stringify({ name: form.name, phone: form.phone, address: form.address, landmark: form.landmark, pincode: form.pincode, location: form.location }));
    setEditAddr(false);
    setStep(2);
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
        key: data.key, amount: total * 100, currency: 'INR',
        name: 'Milqon Dairy', description: 'Order Payment', order_id: data.orderId,
        handler: async (response) => {
          const verify = await api.post('/payment/verify', response);
          if (verify.data.verified) await placeOrder(verify.data.paymentId);
          else alert('Payment verification failed. Please contact support.');
        },
        prefill: { name: form.name, contact: form.phone },
        theme: { color: '#2e7d32' },
      };
      new window.Razorpay(options).open();
    } catch {
      alert('Could not initiate payment. Try again.');
    }
  };

  const handleProceed = () => {
    if (form.paymentMethod === 'cod') placeOrder();
    else if (form.paymentMethod === 'razorpay') openRazorpay();
    else { setUpiStep(true); window.scrollTo(0, 0); }
  };

  const placeOrder = async (txnId = '') => {
    if (form.paymentMethod !== 'cod' && form.paymentMethod !== 'razorpay' && !txnId) return alert('Please enter your UPI Transaction ID');
    setLoading(true);
    try {
      await api.post('/orders', {
        ...form, user: user?.id,
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

  // Step indicator
  const StepBar = () => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 0 }}>
      {['Address', 'Summary', 'Payment'].map((label, i) => {
        const s = i + 1;
        const active = step === s;
        const done = step > s;
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? '#2e7d32' : active ? '#1b5e20' : '#e0e0e0', color: done || active ? '#fff' : '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                {done ? '✓' : s}
              </div>
              <div style={{ fontSize: 11, marginTop: 4, fontWeight: active ? 700 : 400, color: active ? '#1b5e20' : '#888' }}>{label}</div>
            </div>
            {s < 3 && <div style={{ height: 2, flex: 1, background: step > s ? '#2e7d32' : '#e0e0e0', marginBottom: 16 }} />}
          </div>
        );
      })}
    </div>
  );

  // ── UPI Payment Screen ──
  if (upiStep) {
    const selectedApp = PAYMENT_OPTIONS.find(p => p.key === form.paymentMethod);
    return (
      <div className="container" style={{ maxWidth: 500, paddingTop: 24 }}>
        <button onClick={() => setUpiStep(false)} style={{ background: 'none', border: 'none', color: '#2e7d32', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 16 }}>← Back</button>
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            {selectedApp?.img && <img src={selectedApp.img} alt={selectedApp.label} style={{ width: 64, height: 64, objectFit: 'contain', marginBottom: 8 }} />}
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a' }}>Pay via {selectedApp?.label}</div>
          </div>
          <div style={{ background: '#f1f8e9', border: '2px solid #2e7d32', borderRadius: 12, padding: '16px', textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Amount to Pay</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: '#1b5e20' }}>₹{total}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Milqon Dairy Order</div>
          </div>
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
          <a href={getUpiLink(form.paymentMethod)} style={{ width: '100%', padding: 14, background: '#1b5e20', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, textDecoration: 'none' }}>
            {selectedApp?.img && <img src={selectedApp.img} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />}
            Open {selectedApp?.label} & Pay ₹{total}
          </a>
          <div style={{ textAlign: 'center', color: '#888', fontSize: 13, marginBottom: 16 }}>— After payment, enter Transaction ID below —</div>
          <div className="form-group">
            <label style={{ fontWeight: 700 }}>UPI Transaction ID <span style={{ color: '#e53935' }}>*</span></label>
            <input placeholder="e.g. 123456789012" value={upiTxnId} onChange={e => setUpiTxnId(e.target.value)} style={{ fontSize: 16, letterSpacing: 1 }} />
            <span style={{ fontSize: 12, color: '#888' }}>Find it in your payment app under transaction history</span>
          </div>
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

  return (
    <div className="container" style={{ maxWidth: 600, paddingTop: 24 }}>
      <div className="section-title">Checkout</div>
      <StepBar />

      {/* ── STEP 1: Address ── */}
      {step === 1 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          {!editAddr && savedAddr.address ? (
            <>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: '#1b5e20' }}>📍 Delivery Address</div>
              <div style={{ background: '#f1f8e9', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <div style={{ fontWeight: 700 }}>{form.name}</div>
                <div style={{ color: '#555', fontSize: 14 }}>{form.phone}</div>
                <div style={{ color: '#555', fontSize: 14, marginTop: 4 }}>{form.address}</div>
                {form.landmark && <div style={{ color: '#888', fontSize: 13 }}>Near: {form.landmark}</div>}
                {form.pincode && <div style={{ color: '#888', fontSize: 13 }}>Pincode: {form.pincode}</div>}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setEditAddr(true)} style={{ flex: 1, padding: '10px', background: '#fff', border: '2px solid #2e7d32', color: '#2e7d32', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
                  ✏️ Change Address
                </button>
                <button onClick={() => setStep(2)} style={{ flex: 2, padding: '10px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
                  Continue →
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="form-group"><label>Full Name <span style={{ color: '#e53935' }}>*</span></label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
              </div>
              <div className="form-group"><label>Phone Number <span style={{ color: '#e53935' }}>*</span></label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Phone number" />
              </div>
              <div className="form-group">
                <label>Delivery Address <span style={{ color: '#e53935' }}>*</span></label>
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
              <div style={{ display: 'flex', gap: 10 }}>
                {savedAddr.address && (
                  <button onClick={() => setEditAddr(false)} style={{ flex: 1, padding: '12px', background: '#fff', border: '2px solid #ccc', color: '#555', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
                    Cancel
                  </button>
                )}
                <button onClick={saveAndNext} style={{ flex: 2, padding: '12px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                  Save & Continue →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── STEP 2: Order Summary ── */}
      {step === 2 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>

          {/* Address Box */}
          <div style={{ background: '#f1f8e9', border: '1.5px solid #a5d6a7', borderRadius: 12, padding: 14, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1b5e20' }}>📍 Delivery Address</div>
              <button onClick={() => { setStep(1); setEditAddr(true); }} style={{ background: 'none', border: 'none', color: '#2e7d32', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>✏️ Change</button>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{form.name} &nbsp;·&nbsp; <span style={{ fontWeight: 400, color: '#555' }}>{form.phone}</span></div>
            <div style={{ fontSize: 13, color: '#555', marginTop: 3 }}>{form.address}</div>
            {form.landmark && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Near: {form.landmark}</div>}
            {form.pincode && <div style={{ fontSize: 12, color: '#888' }}>Pincode: {form.pincode}</div>}
          </div>

          {/* Products */}
          <div style={{ fontWeight: 700, fontSize: 14, color: '#333', marginBottom: 10 }}>🧺 Items Ordered</div>
          {cart.map(i => (
            <div key={i._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{i.name}</div>
                <div style={{ fontSize: 12, color: '#888' }}>₹{i.price} × {i.qty}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1b5e20' }}>₹{i.price * i.qty}</div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 17, paddingTop: 12, marginTop: 4, color: '#1b5e20' }}>
            <span>Total</span><span>₹{total}</span>
          </div>

          <div className="switch-row" style={{ margin: '18px 0' }}>
            <label style={{ fontWeight: 600 }}>🔄 Daily Milk Subscription</label>
            <input type="checkbox" checked={form.subscription} onChange={e => set('subscription', e.target.checked)} style={{ width: 'auto', cursor: 'pointer' }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px', background: '#fff', border: '2px solid #ccc', color: '#555', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
              ← Back
            </button>
            <button onClick={() => setStep(3)} style={{ flex: 2, padding: '12px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Choose Payment →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: Payment ── */}
      {step === 3 && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: '#1b5e20' }}>💳 Payment Method</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
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

          <div style={{ background: '#f8f9fa', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#1b5e20', fontSize: 16 }}>
              <span>Total</span><span>₹{total}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(2)} style={{ flex: 1, padding: '12px', background: '#fff', border: '2px solid #ccc', color: '#555', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
              ← Back
            </button>
            <button onClick={handleProceed} disabled={loading}
              style={{ flex: 2, padding: '12px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              {loading ? 'Placing...' : form.paymentMethod === 'cod' ? `Place Order — ₹${total}` : `Proceed to Pay — ₹${total}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
