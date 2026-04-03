import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

function PayNowButton({ amount, subId, monthKey, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payment/create-order', { amount });
      const options = {
        key: data.key,
        amount: amount * 100,
        currency: 'INR',
        name: 'Milqon Dairy',
        description: `Milk Bill - ${monthKey}`,
        order_id: data.orderId,
        handler: async (response) => {
          const verify = await api.post('/payment/verify', response);
          if (verify.data.verified) {
            await api.post(`/subscriptions/${subId}/pay`, { monthKey });
            onSuccess();
          }
        },
        theme: { color: '#1b5e20' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert('Payment failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <button onClick={handlePay} disabled={loading}
      style={{ marginTop: 16, width: '100%', padding: 13, background: 'linear-gradient(135deg,#1b5e20,#2e7d32)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>
      {loading ? 'Processing...' : `💳 Pay ₹${amount} Now`}
    </button>
  );
}

const monthName = (m) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1];

export default function MySubscription() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1);
  const [selYear] = useState(new Date().getFullYear());
  const [reqForm, setReqForm] = useState({ quantity: 1, address: '', phone: '', name: '' });
  const [reqMsg, setReqMsg] = useState('');
  const [reqLoading, setReqLoading] = useState(false);
  const setR = (k, v) => setReqForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!user) return navigate('/login');
    api.get('/subscriptions/my').then(r => { setSub(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  const submitRequest = async () => {
    if (!reqForm.name || !reqForm.address || !reqForm.phone) return setReqMsg('Please fill all required fields');
    setReqLoading(true);
    try {
      const { data } = await api.post('/subscriptions/request', { ...reqForm, name: reqForm.name });
      setSub(data);
      setReqMsg('');
    } catch (err) {
      setReqMsg(err.response?.data?.message || 'Failed to submit request');
    }
    setReqLoading(false);
  };

  const cancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) return;
    try {
      await api.put(`/subscriptions/${sub._id}`, { active: false, cancelled: true });
      setSub(s => ({ ...s, active: false, cancelled: true }));
    } catch {
      alert('Failed to cancel. Try again.');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading...</div>;

  if (!sub) return (
    <div className="container" style={{ maxWidth: 500, paddingTop: 48 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <img src="/milqon-milk.jpeg" alt="Milk" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 16px rgba(46,125,50,0.25)', marginBottom: 12, border: '3px solid #2e7d32' }} />
        <h2 style={{ color: '#1b5e20', margin: '12px 0 6px' }}>Subscribe for Daily Milk</h2>
        <p style={{ color: '#888', fontSize: 14 }}>Fresh milk delivered to your door every morning</p>
      </div>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <div className="form-group">
          <label>Full Name *</label>
          <input placeholder="Your full name" value={reqForm.name} onChange={e => setR('name', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Phone Number *</label>
          <input placeholder="Your phone number" value={reqForm.phone} onChange={e => setR('phone', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Delivery Address *</label>
          <input placeholder="Full delivery address" value={reqForm.address} onChange={e => setR('address', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Milk per Day</label>
          <select value={reqForm.quantity} onChange={e => setR('quantity', e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontWeight: 600 }}>
            <option value={0.5}>0.5 Litre — ₹30/day</option>
            <option value={1}>1 Litre — ₹60/day</option>
            <option value={1.5}>1.5 Litre — ₹90/day</option>
            <option value={2}>2 Litre — ₹120/day</option>
            <option value={3}>3 Litre — ₹180/day</option>
          </select>
        </div>
        <div style={{ background: '#f1f8e9', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#2e7d32' }}>
          💰 Price: ₹60/Litre &nbsp;|&nbsp; 🥛 Full Cream Milk &nbsp;|&nbsp; 🚚 Morning Delivery
        </div>
        {reqMsg && <div style={{ padding: '10px 14px', borderRadius: 8, background: '#fce4ec', color: '#c62828', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{reqMsg}</div>}
        <button className="btn btn-primary" style={{ width: '100%', padding: 13 }} onClick={submitRequest} disabled={reqLoading}>
          {reqLoading ? 'Submitting...' : '📩 Request Subscription'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#888', marginTop: 12 }}>Admin will activate your subscription within 24 hours</p>
      </div>
    </div>
  );

  // Pending approval state
  if (!sub.active && !sub.attendance?.length) return (
    <div className="container" style={{ maxWidth: 500, paddingTop: 60, textAlign: 'center' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>⏳</div>
      <h2 style={{ color: '#e65100' }}>Request Pending Approval</h2>
      <p style={{ color: '#888', marginBottom: 8 }}>Your subscription request has been submitted.</p>
      <p style={{ color: '#888', fontSize: 14 }}>Admin will activate it within 24 hours. You'll see your attendance and bill here once active.</p>
      <div style={{ background: '#fff3e0', borderRadius: 12, padding: 16, marginTop: 20, textAlign: 'left', fontSize: 14 }}>
        <div><strong>Name:</strong> {sub.name}</div>
        <div><strong>Phone:</strong> {sub.phone}</div>
        <div><strong>Address:</strong> {sub.address}</div>
        <div><strong>Quantity:</strong> {sub.quantity}L/day</div>
      </div>
    </div>
  );

  const monthKey = `${selYear}-${String(selMonth).padStart(2,'0')}`;
  const today = new Date().toISOString().split('T')[0];
  const daysInMonth = new Date(selYear, selMonth, 0).getDate();
  const monthDates = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    return `${selYear}-${String(selMonth).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  });
  const monthAtt = sub.attendance?.filter(a => a.date.startsWith(`${selYear}-${String(selMonth).padStart(2,'0')}`)) || [];
  const deliveredDays = monthAtt.filter(a => a.delivered).length;
  const totalLitres = deliveredDays * sub.quantity;
  const totalAmount = totalLitres * sub.pricePerLitre;

  return (
    <div className="container" style={{ maxWidth: 700, paddingTop: 28, paddingBottom: 48 }}>
      <div style={{ fontWeight: 900, fontSize: 22, color: '#1b5e20', marginBottom: 20 }}>🥛 My Milk Subscription</div>

      {/* Subscription Info */}
      <div style={{ background: 'linear-gradient(135deg,#1b5e20,#2e7d32)', borderRadius: 16, padding: 24, color: '#fff', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#a5d6a7', marginBottom: 4 }}>Active Subscription</div>
        <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 8 }}>{sub.name}</div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 14 }}>
          <span>🥛 {sub.quantity}L per day</span>
          <span>💰 ₹{sub.pricePerLitre}/Litre</span>
          <span>📅 Since {sub.startDate}</span>
          <span style={{ background: sub.active ? '#69f0ae' : '#ef9a9a', color: '#000', padding: '2px 10px', borderRadius: 20, fontWeight: 700, fontSize: 12 }}>
            {sub.active ? '🟢 Active' : '🔴 Paused'}
          </span>
        </div>
        {sub.active && !sub.cancelled && (
          <button onClick={cancelSubscription}
            style={{ marginTop: 16, background: 'rgba(198,40,40,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            ❌ Cancel Subscription
          </button>
        )}
        {sub.cancelled && (
          <div style={{ marginTop: 12, background: 'rgba(198,40,40,0.3)', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 700 }}>❌ Subscription Cancelled</div>
        )}
      </div>

      {/* Month Selector */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontWeight: 700 }}>📅 Month:</span>
        <select value={selMonth} onChange={e => setSelMonth(Number(e.target.value))} style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontWeight: 600 }}>
          {Array.from({length:12},(_,i)=>i+1).map(m => <option key={m} value={m}>{monthName(m)} {selYear}</option>)}
        </select>
      </div>

      {/* Monthly Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { icon: '✅', label: 'Delivered Days', value: deliveredDays, bg: '#e8f5e9', color: '#2e7d32' },
          { icon: '🥛', label: 'Total Litres', value: `${totalLitres}L`, bg: '#e3f2fd', color: '#1565c0' },
          { icon: '💰', label: `${monthName(selMonth)} Bill`, value: `₹${totalAmount}`, bg: '#fff3e0', color: '#e65100' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '18px 14px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontWeight: 900, fontSize: 22, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Attendance Calendar */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#1b5e20', marginBottom: 14 }}>📋 Attendance — {monthName(selMonth)} {selYear}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {monthDates.map(date => {
            const att = sub.attendance?.find(a => a.date === date);
            const isDelivered = att?.delivered;
            const dayNum = parseInt(date.split('-')[2]);
            const isPast = date <= today;
            return (
              <div key={date} title={date} style={{
                width: 42, height: 42, borderRadius: 10,
                background: !isPast ? '#f5f5f5' : isDelivered ? '#2e7d32' : '#fce4ec',
                color: !isPast ? '#ccc' : isDelivered ? '#fff' : '#c62828',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13,
              }}>
                {dayNum}
                <span style={{ fontSize: 9 }}>{!isPast ? '' : isDelivered ? '✓' : '✗'}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 14, fontSize: 12 }}>
          <span><span style={{ background: '#2e7d32', color: '#fff', padding: '2px 8px', borderRadius: 4 }}>✓</span> Delivered</span>
          <span><span style={{ background: '#fce4ec', color: '#c62828', padding: '2px 8px', borderRadius: 4 }}>✗</span> Not Delivered</span>
          <span><span style={{ background: '#f5f5f5', color: '#ccc', padding: '2px 8px', borderRadius: 4 }}>—</span> Upcoming</span>
        </div>
      </div>

      {/* Bill Breakdown */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 20, marginTop: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#1b5e20', marginBottom: 14 }}>🧾 Bill Breakdown — {monthName(selMonth)} {selYear}</div>
        <div style={{ fontSize: 14, color: '#555', lineHeight: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Daily Quantity</span><span style={{ fontWeight: 700 }}>{sub.quantity} Litre</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Price per Litre</span><span style={{ fontWeight: 700 }}>₹{sub.pricePerLitre}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Delivered Days</span><span style={{ fontWeight: 700 }}>{deliveredDays} days</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Litres</span><span style={{ fontWeight: 700 }}>{totalLitres}L</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #f0f0f0', paddingTop: 10, marginTop: 6, fontWeight: 900, fontSize: 18, color: '#1b5e20' }}>
            <span>Total Amount</span><span>₹{totalAmount}</span>
          </div>
        </div>
        {totalAmount > 0 && (
          sub.paidMonths?.includes(monthKey)
            ? <div style={{ marginTop: 16, background: '#e8f5e9', borderRadius: 10, padding: '12px 16px', color: '#2e7d32', fontWeight: 700, textAlign: 'center', fontSize: 15 }}>✅ Paid for {monthName(selMonth)} {selYear}</div>
            : <PayNowButton amount={totalAmount} subId={sub._id} monthKey={monthKey} onSuccess={() => setSub(s => ({ ...s, paidMonths: [...(s.paidMonths||[]), monthKey] }))} />
        )}
      </div>
    </div>
  );
}
