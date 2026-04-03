import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import Admin from './pages/Admin';
import DeliveryDashboard from './pages/DeliveryDashboard';
import StaffLogin from './pages/StaffLogin';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import ProductDetail from './pages/ProductDetail';
import Help from './pages/Help';
import MySubscription from './pages/MySubscription';
import AdminLogin from './pages/AdminLogin';

function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const hideNav = ['/login', '/register', '/forgot-password', '/staff-login', '/admin-login'].includes(location.pathname);
  if (hideNav) return null;

  const closeAll = () => { setMenuOpen(false); setAccountOpen(false); };

  const loggedInItems = [
    { icon: '📦', label: 'My Orders', path: '/my-orders' },
    { icon: '🥛', label: 'My Subscription', path: '/my-subscription' },
    { icon: '⚙️', label: 'My Account', path: '/profile' },
    ...(user?.role === 'admin' ? [{ icon: '🛠️', label: 'Admin Panel', path: '/admin' }] : []),
    ...(['admin', 'delivery'].includes(user?.role) ? [{ icon: '🚚', label: 'Delivery', path: '/delivery' }] : []),
    { icon: '❓', label: 'Help & Support', path: '/help' },
  ];

  const guestItems = [
    { icon: '📝', label: 'Register', path: '/register' },
    { icon: '❓', label: 'Help & Support', path: '/help' },
  ];

  return (
    <>
      <nav className="navbar">
        <NavLink to="/" className="navbar-logo">
          <img src="/logo.jpeg" alt="Milqon Dairy" className="logo-img" />
          <div className="logo-text">
            <span className="logo-name">Milqon</span>
            <span className="logo-tagline">Har Ghar Ka Bharosa</span>
          </div>
        </NavLink>

        <div className="navbar-search">
          <input placeholder="Search milk, paneer, ghee, lassi..." />
          <button onClick={() => navigate('/products')}>Search</button>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>{menuOpen ? '✕' : '☰'}</button>

        <div className={`navbar-links${menuOpen ? ' open' : ''}`}>
          <NavLink to="/" className="nav-link" onClick={closeAll}>🏠 Home</NavLink>
          <NavLink to="/products" className="nav-link" onClick={closeAll}>🛍️ Products</NavLink>
          <NavLink to="/cart" className="nav-link" onClick={closeAll}>
            🛒 Cart {cart.length > 0 && <span className="badge">{cart.length}</span>}
          </NavLink>

          {/* Account Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="nav-link"
              onClick={() => setAccountOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <span style={{ fontSize: 20 }}>👤</span>
              <span>{user ? user.name.split(' ')[0] : 'Account'}</span>
              <span style={{ fontSize: 10, marginTop: 1 }}>▾</span>
            </button>

            {accountOpen && (
              <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', minWidth: 200, zIndex: 999, overflow: 'hidden', border: '1px solid #f0f0f0' }}
                onMouseLeave={() => setAccountOpen(false)}>

                {user ? (
                  <>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', background: '#f1f8e9' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1b5e20' }}>👋 {user.name}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>{user.email}</div>
                    </div>
                    {loggedInItems.map((item, idx) => (
                      <button key={idx} onClick={() => { navigate(item.path); closeAll(); }}
                        style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10, color: '#333', fontWeight: 500 }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <span>{item.icon}</span>{item.label}
                      </button>
                    ))}
                    <div style={{ borderTop: '1px solid #f0f0f0' }}>
                      <button onClick={() => { logout(); navigate('/'); closeAll(); }}
                        style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10, color: '#c62828', fontWeight: 600 }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fce4ec'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0' }}>
                      <div style={{ fontSize: 13, color: '#555', marginBottom: 10 }}>Login to access orders, profile & more</div>
                      <button onClick={() => { navigate('/login'); closeAll(); }}
                        style={{ width: '100%', padding: '10px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                        Login
                      </button>
                    </div>
                    {guestItems.map((item, idx) => (
                      <button key={idx} onClick={() => { navigate(item.path); closeAll(); }}
                        style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10, color: '#333' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <span>{item.icon}</span>{item.label}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

function Footer() {
  const location = useLocation();
  const hideFooter = ['/login', '/register', '/forgot-password', '/staff-login', '/admin-login'].includes(location.pathname);
  if (hideFooter) return null;
  return (
    <footer className="footer">
      <div className="footer-logo"><img src="/logo.jpeg" alt="Milqon Dairy" style={{ width: 36, height: 36, borderRadius: 8, verticalAlign: 'middle', marginRight: 8 }} />Milqon Dairy</div>
      <div className="footer-tagline">Har Ghar Ka Bharosa – Milqon Dairy</div>
      <div style={{ fontSize: 13, color: '#a5d6a7', marginBottom: 16 }}>📍 Bokaro Steel City, Jharkhand – 828304</div>
      <div className="footer-links">
        <a href="/">Home</a>
        <a href="/products">Products</a>
        <a href="/my-orders">My Orders</a>
        <a href="/help">Help</a>
        <a href="/login">Login</a>
      </div>
      <div className="footer-copy">© 2025 Milqon Dairy. All rights reserved. | Since 2020 | Made with ❤️ for fresh dairy lovers</div>
      <div style={{ marginTop: 12 }}>
        <a href="/staff-login" style={{ fontSize: 18, opacity: 0.3, color: '#fff' }} title="Staff Login">⚙️</a>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/delivery" element={<DeliveryDashboard />} />
            <Route path="/staff-login" element={<StaffLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/help" element={<Help />} />
            <Route path="/my-subscription" element={<MySubscription />} />
            <Route path="/admin-login" element={<AdminLogin />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
