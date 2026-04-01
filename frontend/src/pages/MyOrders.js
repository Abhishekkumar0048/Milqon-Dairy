import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const PAY_LABEL = { cod: '💵 Cash on Delivery', gpay: '🟢 Google Pay', phonepe: '🟣 PhonePe', bhimupi: '🇮🇳 BHIM UPI', paytm: '🔵 Paytm' };

const STEPS = [
  { key: 'pending',          icon: '🛒', label: 'Order Placed' },
  { key: 'confirmed',        icon: '✅', label: 'Confirmed' },
  { key: 'out_for_delivery', icon: '🚚', label: 'Out for Delivery' },
  { key: 'delivered',        icon: '📦', label: 'Delivered' },
];

const STATUS_INDEX = { pending: 0, confirmed: 1, out_for_delivery: 2, delivered: 3 };

function TrackingBar({ status }) {
  const current = STATUS_INDEX[status] ?? 0;
  return (
    <div className="tracking-bar">
      {STEPS.map((step, i) => (
        <div key={step.key} className={`track-step ${i <= current ? 'done' : ''} ${i === current ? 'active' : ''}`}>
          <div className="track-icon">{step.icon}</div>
          <div className="track-label">{step.label}</div>
          {i < STEPS.length - 1 && <div className={`track-line ${i < current ? 'done' : ''}`} />}
        </div>
      ))}
    </div>
  );
}

function StatusHistory({ history }) {
  if (!history?.length) return null;
  return (
    <div className="status-history">
      {[...history].reverse().map((h, i) => (
        <div key={i} className="history-item">
          <div className="history-dot" />
          <div>
            <div className="history-msg">{h.message}</div>
            <div className="history-time">{new Date(h.updatedAt).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) api.get('/orders/my').then(r => setOrders(r.data));
  }, [user]);

  const cancelOrder = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const { data } = await api.put(`/orders/${id}/cancel`);
      setOrders(prev => prev.map(o => o._id === id ? data : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot cancel order');
    }
  };

  if (!user) return (
    <div className="empty-state">
      <div className="icon">🔐</div>
      <h3>Please login to view your orders</h3>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/login')}>Login</button>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: 24, maxWidth: 700 }}>
      <div className="section-title" style={{ marginBottom: 20 }}>📦 My Orders</div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🛒</div>
          <h3>No orders yet</h3>
          <p>Start shopping from Milqon Dairy!</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/products')}>Shop Now</button>
        </div>
      ) : orders.map(o => (
        <div key={o._id} className="order-card" style={{ marginBottom: 16 }}>

          {/* Header */}
          <div className="order-header" style={{ marginBottom: 12 }}>
            <div>
              <strong style={{ fontSize: 15 }}>#{o._id.slice(-6).toUpperCase()}</strong>
              <span style={{ color: '#888', fontSize: 12, marginLeft: 10 }}>{new Date(o.createdAt).toLocaleString()}</span>
            </div>
            <strong style={{ color: '#2e7d32', fontSize: 16 }}>₹{o.totalAmount}</strong>
          </div>

          {/* Tracking Bar or Cancelled */}
          {o.status === 'cancelled' ? (
            <div style={{ background: '#fce4ec', color: '#c62828', borderRadius: 10, padding: '12px 16px', fontWeight: 700, fontSize: 14, textAlign: 'center', margin: '8px 0' }}>
              ❌ Order Cancelled
            </div>
          ) : (
            <TrackingBar status={o.status} />
          )}

          {/* Items */}
          <div className="items-tags" style={{ marginTop: 12 }}>
            {o.items.map((i, idx) => <span key={idx} className="item-tag">{i.name} × {i.quantity}</span>)}
          </div>

          {/* Info */}
          <div style={{ fontSize: 13, color: '#555', marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span>📍 {o.address}{o.landmark ? `, Near: ${o.landmark}` : ''}{o.pincode ? ` — ${o.pincode}` : ''}</span>
            {o.location && <a href={o.location} target="_blank" rel="noreferrer" style={{ color: '#1565c0', fontWeight: 600 }}>🗺️ View on Google Maps</a>}
            <span>{PAY_LABEL[o.paymentMethod] || o.paymentMethod}</span>
            {o.upiTransactionId && (
              <span style={{ color: '#2e7d32', fontWeight: 700 }}>✅ Payment Done | Txn ID: {o.upiTransactionId}</span>
            )}
            {o.paymentMethod !== 'cod' && !o.upiTransactionId && (
              <span style={{ color: '#e65100', fontWeight: 700 }}>⚠️ Payment Pending</span>
            )}
            {o.subscription && <span style={{ color: '#2e7d32' }}>🔄 Daily Subscription Active</span>}
          </div>

          {/* Buttons Row */}
          <div style={{ display: 'flex', gap: 10, marginTop: 14, alignItems: 'center' }}>
            {/* Cancel — only pending */}
            {o.status === 'pending' && (
              <button onClick={() => cancelOrder(o._id)}
                style={{ background: '#fce4ec', color: '#c62828', border: '1.5px solid #ef9a9a', borderRadius: 8, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                ❌ Cancel Order
              </button>
            )}

            {/* Timeline toggle */}
            <button onClick={() => setExpanded(expanded === o._id ? null : o._id)}
              style={{ background: 'none', border: 'none', color: '#2e7d32', fontWeight: 600, fontSize: 13, cursor: 'pointer', padding: 0 }}>
              {expanded === o._id ? '▲ Hide Timeline' : '▼ View Full Timeline'}
            </button>
          </div>

          {/* Status History Timeline */}
          {expanded === o._id && <StatusHistory history={o.statusHistory} />}
        </div>
      ))}
    </div>
  );
}
