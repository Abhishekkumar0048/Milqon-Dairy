import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const [delivered, setDelivered] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && ['admin', 'delivery'].includes(user.role)) {
      api.get('/orders/delivery')
        .then(r => { setOrders(r.data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [user]);

  // Send live location every 30 seconds
  useEffect(() => {
    if (!user || user.role !== 'delivery') return;
    const sendLocation = () => {
      navigator.geolocation?.getCurrentPosition(pos => {
        api.post('/orders/delivery/location', { lat: pos.coords.latitude, lng: pos.coords.longitude }).catch(() => {});
      });
    };
    sendLocation();
    const interval = setInterval(sendLocation, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/orders/${id}/delivery-update`, { status });
      if (status === 'delivered') {
        setDelivered(d => d + 1);
        setOrders(prev => prev.filter(o => o._id !== id));
        let t = document.getElementById('milqon-toast');
        if (!t) { t = document.createElement('div'); t.id = 'milqon-toast'; t.className = 'toast'; document.body.appendChild(t); }
        t.textContent = '📦 Order marked as Delivered!';
        t.style.display = 'block';
        setTimeout(() => { t.style.display = 'none'; }, 2500);
      } else {
        setOrders(prev => prev.map(o => o._id === id ? data : o));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  if (!user || !['admin', 'delivery'].includes(user.role)) return (
    <div className="empty-state">
      <div className="icon">🔐</div>
      <h3>Delivery access only</h3>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/login')}>Login</button>
    </div>
  );

  const confirmed     = orders.filter(o => o.status === 'confirmed');
  const outForDelivery = orders.filter(o => o.status === 'out_for_delivery');

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: '#1b5e20', color: '#fff', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 32 }}>🚚</span>
        <div>
          <h2 style={{ margin: 0, fontSize: 20 }}>Delivery Dashboard</h2>
          <p style={{ margin: 0, color: '#a5d6a7', fontSize: 13 }}>Milqon Dairy — {user.name}</p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20, maxWidth: 700 }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
          <div style={{ background: '#fff3e0', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>✅</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#e65100' }}>{confirmed.length}</div>
            <div style={{ fontSize: 13, color: '#888' }}>Ready to Pickup</div>
          </div>
          <div style={{ background: '#e8f5e9', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>🚚</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#2e7d32' }}>{outForDelivery.length}</div>
            <div style={{ fontSize: 13, color: '#888' }}>Out for Delivery</div>
          </div>
          <div style={{ background: '#e3f2fd', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>📦</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1565c0' }}>{delivered}</div>
            <div style={{ fontSize: 13, color: '#888' }}>Delivered Today</div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="icon">✅</div>
            <h3>No pending deliveries</h3>
            <p>All orders delivered!</p>
          </div>
        ) : (
          <>
            {/* Confirmed Orders — Ready to Pickup */}
            {confirmed.length > 0 && (
              <>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#e65100', marginBottom: 10 }}>✅ Ready to Pickup ({confirmed.length})</div>
                {confirmed.map(o => <OrderCard key={o._id} o={o} updateStatus={updateStatus} />)}
              </>
            )}

            {/* Out for Delivery */}
            {outForDelivery.length > 0 && (
              <>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#2e7d32', margin: '20px 0 10px' }}>🚚 Out for Delivery ({outForDelivery.length})</div>
                {outForDelivery.map(o => <OrderCard key={o._id} o={o} updateStatus={updateStatus} />)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function OrderCard({ o, updateStatus }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderLeft: `4px solid ${o.status === 'confirmed' ? '#e65100' : '#2e7d32'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong>#{o._id.slice(-6).toUpperCase()}</strong>
        <span style={{ fontSize: 12, color: '#888' }}>{new Date(o.createdAt).toLocaleString()}</span>
      </div>

      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>👤 {o.name} &nbsp; 📞 {o.phone}</div>
      <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>
        📍 {o.address}{o.landmark ? `, Near: ${o.landmark}` : ''}{o.pincode ? ` — ${o.pincode}` : ''}
      </div>
      {o.location && (
        <a href={o.location} target="_blank" rel="noreferrer"
          style={{ fontSize: 13, color: '#1565c0', fontWeight: 600, display: 'inline-block', marginBottom: 8 }}>
          🗺️ Open in Google Maps
        </a>
      )}

      <div className="items-tags" style={{ marginBottom: 8 }}>
        {o.items.map((i, idx) => <span key={idx} className="item-tag">{i.name} × {i.quantity}</span>)}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <strong style={{ color: '#2e7d32', fontSize: 16 }}>₹{o.totalAmount} — {o.paymentMethod === 'cod' ? '💵 Collect Cash' : '📱 UPI Paid'}</strong>
        {o.status === 'confirmed' && (
          <button onClick={() => updateStatus(o._id, 'out_for_delivery')}
            style={{ background: '#e65100', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            🚚 Pickup & Start Delivery
          </button>
        )}
        {o.status === 'out_for_delivery' && (
          <button onClick={() => updateStatus(o._id, 'delivered')}
            style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            📦 Mark as Delivered
          </button>
        )}
      </div>
    </div>
  );
}
