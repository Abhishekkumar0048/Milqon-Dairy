import { useEffect, useState } from 'react';
import api from '../api';

const today = () => new Date().toISOString().split('T')[0];
const monthName = (m) => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1];

export default function SubscriptionAdmin() {
  const [subs, setSubs] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', address: '', quantity: 1, pricePerLitre: 60, startDate: today() });
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1);
  const [selYear, setSelYear] = useState(new Date().getFullYear());
  const [bills, setBills] = useState({});
  const [showForm, setShowForm] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { fetchSubs(); }, []);

  const fetchSubs = async () => {
    const { data } = await api.get('/subscriptions');
    setSubs(data);
  };

  const pendingSubs = subs.filter(s => !s.active && !s.attendance?.length);
  const activeSubs = subs.filter(s => s.active || s.attendance?.length);

  const addSub = async () => {
    if (!form.name || !form.phone || !form.address) return alert('Fill all fields');
    await api.post('/subscriptions', { ...form, milkType: 'Full Cream Milk', quantity: Number(form.quantity), pricePerLitre: Number(form.pricePerLitre) });
    setForm({ name: '', phone: '', address: '', quantity: 1, pricePerLitre: 60, startDate: today() });
    setShowForm(false);
    fetchSubs();
  };

  const markAttendance = async (id, date, delivered) => {
    const { data } = await api.put(`/subscriptions/${id}/attendance`, { date, delivered });
    setSubs(prev => prev.map(s => s._id === id ? data : s));
  };

  const toggleActive = async (sub) => {
    const { data } = await api.put(`/subscriptions/${sub._id}`, { active: !sub.active });
    setSubs(prev => prev.map(s => s._id === sub._id ? data : s));
  };

  const deleteSub = async (id) => {
    if (!window.confirm('Delete this subscription?')) return;
    await api.delete(`/subscriptions/${id}`);
    setSubs(prev => prev.filter(s => s._id !== id));
  };

  const fetchBill = async (id) => {
    const { data } = await api.get(`/subscriptions/${id}/bill?month=${selMonth}&year=${selYear}`);
    setBills(prev => ({ ...prev, [id]: data }));
  };

  // Get days in selected month
  const daysInMonth = new Date(selYear, selMonth, 0).getDate();
  const monthDates = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    return `${selYear}-${String(selMonth).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#1b5e20' }}>🥛 Daily Milk Subscriptions</div>
        <button onClick={() => setShowForm(o => !o)} style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 700, cursor: 'pointer' }}>
          {showForm ? '✕ Cancel' : '➕ Add Customer'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={{ background: '#f1f8e9', borderRadius: 14, padding: 20, marginBottom: 20, border: '1.5px solid #a5d6a7' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Customer Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Phone *</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Phone number" />
            </div>
            <div className="form-group" style={{ marginBottom: 0, gridColumn: '1/-1' }}>
              <label>Address *</label>
              <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Delivery address" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Milk per Day (Litres)</label>
              <select value={form.quantity} onChange={e => set('quantity', e.target.value)}>
                <option value={0.5}>0.5 L</option>
                <option value={1}>1 L</option>
                <option value={1.5}>1.5 L</option>
                <option value={2}>2 L</option>
                <option value={3}>3 L</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Price per Litre (₹)</label>
              <input type="number" value={form.pricePerLitre} onChange={e => set('pricePerLitre', e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Start Date</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </div>
          </div>
          <button onClick={addSub} style={{ marginTop: 14, width: '100%', padding: 12, background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            ✅ Save Subscription
          </button>
        </div>
      )}

      {/* Pending Requests */}
      {pendingSubs.length > 0 && (
        <div style={{ background: '#fff3e0', borderRadius: 14, padding: 16, marginBottom: 20, border: '1.5px solid #ffcc80' }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#e65100', marginBottom: 12 }}>⏳ Pending Subscription Requests ({pendingSubs.length})</div>
          {pendingSubs.map(sub => (
            <div key={sub._id} style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontSize: 14 }}>
                <strong>{sub.name}</strong> &nbsp;|&nbsp; 📞 {sub.phone} &nbsp;|&nbsp; 📍 {sub.address}
                <span style={{ marginLeft: 8, color: '#1b5e20', fontWeight: 700 }}>🥛 {sub.quantity}L/day</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggleActive(sub)} style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>✅ Approve</button>
                <button onClick={() => deleteSub(sub._id)} style={{ background: '#fce4ec', color: '#c62828', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>❌ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Month Selector */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20, background: '#fff', padding: '12px 16px', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>📅 Attendance Month:</span>
        <select value={selMonth} onChange={e => setSelMonth(Number(e.target.value))} style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontWeight: 600 }}>
          {Array.from({length:12},(_,i)=>i+1).map(m => <option key={m} value={m}>{monthName(m)}</option>)}
        </select>
        <select value={selYear} onChange={e => setSelYear(Number(e.target.value))} style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e0e0e0', fontWeight: 600 }}>
          {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span style={{ fontSize: 13, color: '#888' }}>{subs.filter(s=>s.active).length} active subscribers</span>
      </div>

      {activeSubs.length === 0 && pendingSubs.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>No subscriptions yet. Add your first customer!</div>}

      {/* Subscription Cards */}
      {activeSubs.map(sub => {
        const bill = bills[sub._id];
        const monthAtt = sub.attendance?.filter(a => a.date.startsWith(`${selYear}-${String(selMonth).padStart(2,'0')}`)) || [];
        const deliveredCount = monthAtt.filter(a => a.delivered).length;
        const monthTotal = deliveredCount * sub.quantity * sub.pricePerLitre;

        return (
          <div key={sub._id} style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', borderLeft: `4px solid ${sub.active ? '#2e7d32' : '#ccc'}` }}>

            {/* Customer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>👤 {sub.name}</div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>📞 {sub.phone} &nbsp;|&nbsp; 📍 {sub.address}</div>
                <div style={{ fontSize: 13, color: '#1b5e20', fontWeight: 700, marginTop: 4 }}>
                  🥛 {sub.quantity}L/day &nbsp;·&nbsp; ₹{sub.pricePerLitre}/L &nbsp;·&nbsp; Since {sub.startDate}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: sub.active ? '#e8f5e9' : '#fce4ec', color: sub.active ? '#2e7d32' : '#c62828' }}>
                  {sub.active ? '🟢 Active' : '🔴 Paused'}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => toggleActive(sub)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, border: '1.5px solid #2e7d32', background: '#fff', color: '#2e7d32', cursor: 'pointer', fontWeight: 600 }}>
                    {sub.active ? 'Pause' : 'Resume'}
                  </button>
                  <button onClick={() => deleteSub(sub._id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, border: '1.5px solid #c62828', background: '#fff', color: '#c62828', cursor: 'pointer', fontWeight: 600 }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Monthly Summary */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              {[
                { label: 'Delivered Days', value: deliveredCount, color: '#2e7d32', bg: '#e8f5e9' },
                { label: 'Total Litres', value: `${deliveredCount * sub.quantity}L`, color: '#1565c0', bg: '#e3f2fd' },
                { label: `${monthName(selMonth)} Bill`, value: `₹${monthTotal}`, color: '#e65100', bg: '#fff3e0' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '10px 16px', textAlign: 'center', minWidth: 100 }}>
                  <div style={{ fontWeight: 900, fontSize: 18, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Attendance Grid */}
            <div style={{ fontWeight: 700, fontSize: 13, color: '#555', marginBottom: 8 }}>📋 Attendance — {monthName(selMonth)} {selYear}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {monthDates.map(date => {
                const att = sub.attendance?.find(a => a.date === date);
                const isDelivered = att?.delivered;
                const dayNum = parseInt(date.split('-')[2]);
                const isPast = date <= today();
                return (
                  <button key={date} onClick={() => isPast && markAttendance(sub._id, date, !isDelivered)}
                    title={date}
                    style={{
                      width: 36, height: 36, borderRadius: 8, border: 'none', cursor: isPast ? 'pointer' : 'default',
                      background: !isPast ? '#f5f5f5' : isDelivered ? '#2e7d32' : '#fce4ec',
                      color: !isPast ? '#ccc' : isDelivered ? '#fff' : '#c62828',
                      fontWeight: 700, fontSize: 12,
                      transition: 'transform 0.15s',
                    }}
                    onMouseEnter={e => { if(isPast) e.currentTarget.style.transform='scale(1.15)'; }}
                    onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
                    {dayNum}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
              <span style={{ background: '#2e7d32', color: '#fff', padding: '2px 8px', borderRadius: 4, marginRight: 8 }}>✓ Delivered</span>
              <span style={{ background: '#fce4ec', color: '#c62828', padding: '2px 8px', borderRadius: 4, marginRight: 8 }}>✗ Not Delivered</span>
              <span style={{ background: '#f5f5f5', color: '#ccc', padding: '2px 8px', borderRadius: 4 }}>Future</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
