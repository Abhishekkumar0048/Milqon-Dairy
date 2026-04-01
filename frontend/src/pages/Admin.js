import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['milk', 'paneer', 'curd', 'ghee', 'butter'];
const EMOJI = { milk: '🥛', paneer: '🧀', curd: '🍶', ghee: '🧈', butter: '🧈' };
const STATUS_COLORS = { pending: '#fff3e0', confirmed: '#e8f5e9', delivered: '#e3f2fd', out_for_delivery: '#f3e5f5', cancelled: '#fce4ec' };
const STATUS_TEXT   = { pending: '#e65100', confirmed: '#2e7d32', delivered: '#1565c0', out_for_delivery: '#6a1b9a', cancelled: '#c62828' };

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', category: 'milk', price: '', unit: '1L', description: '', inStock: true });
  const [filterStatus, setFilterStatus] = useState('all');
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (user?.role === 'admin') {
      api.get('/orders').then(r => setOrders(r.data)).catch(() => {});
      api.get('/products').then(r => setProducts(r.data)).catch(() => {});
      // Fetch delivery location every 30 sec
      const fetchLocation = () => api.get('/orders/delivery/location').then(r => setDeliveryLocation(r.data)).catch(() => {});
      fetchLocation();
      const interval = setInterval(fetchLocation, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/orders/${id}`, { status });
      setOrders(prev => prev.map(o => o._id === id ? data : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const addProduct = async () => {
    if (!form.name || !form.price) return alert('Name and price required');
    try {
      const { data } = await api.post('/products', { ...form, price: Number(form.price) });
      setProducts(prev => [...prev, data]);
      setForm({ name: '', category: 'milk', price: '', unit: '1L', description: '', inStock: true });
    } catch { alert('Failed to add product'); }
  };

  const toggleStock = async (p) => {
    const { data } = await api.put(`/products/${p._id}`, { inStock: !p.inStock });
    setProducts(prev => prev.map(x => x._id === p._id ? data : x));
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    setProducts(prev => prev.filter(p => p._id !== id));
  };

  if (!user || user.role !== 'admin') return (
    <div className="empty-state"><p>Admin access only</p></div>
  );

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + o.totalAmount, 0),
  };

  const filteredOrders = filterStatus === 'all' ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div style={{ background: '#f0f4f0', minHeight: '100vh', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ background: '#2e7d32', color: '#fff', padding: '20px 24px' }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>⚙️ Admin Dashboard</h2>
        <p style={{ margin: '4px 0 0', color: '#c8e6c9', fontSize: 13 }}>Milqon Dairy — Management Panel</p>
      </div>

      <div className="container" style={{ paddingTop: 20 }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Orders', value: stats.total, icon: '📦', bg: '#e8f5e9', color: '#2e7d32' },
            { label: 'Pending', value: stats.pending, icon: '⏳', bg: '#fff3e0', color: '#e65100' },
            { label: 'Confirmed', value: stats.confirmed, icon: '✅', bg: '#e8f5e9', color: '#2e7d32' },
            { label: 'Delivered', value: stats.delivered, icon: '🚚', bg: '#e3f2fd', color: '#1565c0' },
            { label: 'Revenue', value: `₹${stats.revenue}`, icon: '💰', bg: '#fce4ec', color: '#c62828' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 24 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 'bold', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Delivery Man Live Location */}
        {deliveryLocation?.liveLocation?.lat && (
          <div style={{ background: '#e8f5e9', borderRadius: 12, padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1b5e20' }}>🚴 Delivery Man Live Location</div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{deliveryLocation.name} — Updated: {new Date(deliveryLocation.liveLocation.updatedAt).toLocaleTimeString()}</div>
            </div>
            <a href={`https://maps.google.com/?q=${deliveryLocation.liveLocation.lat},${deliveryLocation.liveLocation.lng}`} target="_blank" rel="noreferrer"
              style={{ background: '#2e7d32', color: '#fff', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              🗺️ Track on Map
            </a>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab${tab === 'orders' ? ' active' : ''}`} onClick={() => setTab('orders')}>📦 Orders ({orders.length})</button>
          <button className={`tab${tab === 'products' ? ' active' : ''}`} onClick={() => setTab('products')}>🛍️ Products ({products.length})</button>
        </div>

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div>
            {/* Filter */}
            <div className="cat-filter" style={{ marginBottom: 16 }}>
              {['all', 'pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
                <button key={s} className={`cat-btn${filterStatus === s ? ' active' : ''}`} onClick={() => setFilterStatus(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)} {s !== 'all' && `(${orders.filter(o => o.status === s).length})`}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0
              ? <p style={{ color: '#666', textAlign: 'center', padding: 40 }}>No orders found.</p>
              : filteredOrders.map(o => (
                <div key={o._id} style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderLeft: `4px solid ${STATUS_TEXT[o.status]}` }}>

                  {/* Order Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: 16, color: '#1a1a1a' }}>#{o._id.slice(-6).toUpperCase()}</span>
                      <span style={{ color: '#999', fontSize: 12 }}>{new Date(o.createdAt).toLocaleString()}</span>
                    </div>
                    <span style={{ background: STATUS_COLORS[o.status], color: STATUS_TEXT[o.status], padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                      {o.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Customer Info Box */}
                  <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#1a1a1a', marginBottom: 6 }}>👤 Customer Details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 13, color: '#444' }}>
                      <span>👤 <strong>{o.name}</strong></span>
                      <span>📞 <strong>{o.phone}</strong></span>
                      <span style={{ gridColumn: '1/-1' }}>📍 {o.address}{o.landmark ? `, Near: ${o.landmark}` : ''}{o.pincode ? ` — ${o.pincode}` : ''}</span>
                      {o.location && <a href={o.location} target="_blank" rel="noreferrer" style={{ color: '#1565c0', fontWeight: 600, gridColumn: '1/-1' }}>🗺️ View on Google Maps</a>}
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#555', marginBottom: 6 }}>🛒 Items Ordered:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {o.items?.map((i, idx) => (
                        <span key={idx} style={{ background: '#f1f8e9', padding: '4px 12px', borderRadius: 20, fontSize: 13, color: '#2e7d32', fontWeight: 600 }}>{i.name} × {i.quantity}</span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 10 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <strong style={{ color: '#2e7d32', fontSize: 16 }}>₹{o.totalAmount}</strong>
                      <span style={{ fontSize: 12, color: '#888' }}>{o.paymentMethod === 'cod' ? '💵 COD' : `📱 ${o.paymentMethod.toUpperCase()}`}</span>
                      {o.upiTransactionId && <span style={{ fontSize: 12, background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>✅ Paid | Txn: {o.upiTransactionId}</span>}
                      {o.paymentMethod !== 'cod' && !o.upiTransactionId && <span style={{ fontSize: 12, background: '#fce4ec', color: '#c62828', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>⚠️ Payment Pending</span>}
                      {o.subscription && <span style={{ fontSize: 12, color: '#2e7d32' }}>🔄 Subscription</span>}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="status-row" style={{ marginTop: 12 }}>
                    {o.status === 'cancelled' ? (
                      <span style={{ color: '#c62828', fontWeight: 700, fontSize: 13 }}>❌ Order Cancelled by Customer</span>
                    ) : o.status === 'delivered' ? (
                      <span style={{ color: '#1565c0', fontWeight: 700, fontSize: 13 }}>📦 Order Delivered</span>
                    ) : (
                      ['pending', 'confirmed', 'out_for_delivery', 'delivered']
                        .filter(s => {
                          if (s === 'confirmed') return o.status === 'pending';
                          if (s === 'out_for_delivery') return o.status === 'confirmed';
                          if (s === 'delivered') return o.status === 'out_for_delivery';
                          return false;
                        })
                        .map(s => (
                          <button key={s}
                            onClick={() => updateStatus(o._id, s)}
                            style={{ flex: 1, padding: '10px', background: STATUS_TEXT[s], color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            {s === 'confirmed' ? '✅ Confirm Order' : s === 'out_for_delivery' ? '🚚 Out for Delivery' : '📦 Mark Delivered'}
                          </button>
                        ))
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* Products Tab */}
        {tab === 'products' && (
          <div>
            {/* Add Product Form */}
            <div className="card" style={{ marginBottom: 20 }}>
              <strong style={{ display: 'block', fontSize: 16, marginBottom: 14, color: '#2e7d32' }}>➕ Add New Product</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Product Name</label>
                  <input placeholder="e.g. Full Cream Milk" value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Price (₹)</label>
                  <input type="number" placeholder="e.g. 60" value={form.price} onChange={e => set('price', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Unit</label>
                  <input placeholder="e.g. 1L, 500g" value={form.unit} onChange={e => set('unit', e.target.value)} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Description</label>
                  <input placeholder="Short description" value={form.description} onChange={e => set('description', e.target.value)} />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 8 }}>Category</label>
                <div className="cat-filter" style={{ margin: 0 }}>
                  {CATEGORIES.map(c => (
                    <button key={c} className={`cat-btn${form.category === c ? ' active' : ''}`} onClick={() => set('category', c)}>
                      {EMOJI[c]} {c}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <input type="checkbox" id="inStock" checked={form.inStock} onChange={e => set('inStock', e.target.checked)} style={{ width: 'auto', cursor: 'pointer' }} />
                <label htmlFor="inStock" style={{ fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>In Stock</label>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 14, padding: 12 }} onClick={addProduct}>
                Add Product
              </button>
            </div>

            {/* Product List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {products.map(p => (
                <div key={p._id} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 32, textAlign: 'center' }}>{EMOJI[p.category]}</div>
                  <strong style={{ textAlign: 'center' }}>{p.name}</strong>
                  <div style={{ textAlign: 'center', color: '#2e7d32', fontWeight: 'bold', fontSize: 16 }}>₹{p.price}</div>
                  <div style={{ textAlign: 'center', color: '#888', fontSize: 12 }}>{p.category} · {p.unit}</div>
                  <span style={{ textAlign: 'center', fontSize: 12, padding: '3px 10px', borderRadius: 20, background: p.inStock ? '#e8f5e9' : '#fce4ec', color: p.inStock ? '#2e7d32' : '#c62828', fontWeight: 600 }}>
                    {p.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                  </span>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button className="btn btn-outline" style={{ flex: 1, padding: '6px 0', fontSize: 12 }} onClick={() => toggleStock(p)}>
                      {p.inStock ? 'Mark Out' : 'Mark In'}
                    </button>
                    <button className="btn btn-danger" style={{ flex: 1, padding: '6px 0', fontSize: 12 }} onClick={() => deleteProduct(p._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
