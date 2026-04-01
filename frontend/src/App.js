import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
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

function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="topbar">🚚 Free delivery on orders above ₹299 &nbsp;|&nbsp; 🥛 Fresh dairy every morning &nbsp;|&nbsp; 📞 Call us: +91-XXXXXXXXXX</div>
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
          <button onClick={() => navigate('/products')}>🔍</button>
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>{menuOpen ? '✕' : '☰'}</button>

        <div className={`navbar-links${menuOpen ? ' open' : ''}`}>
          <NavLink to="/products" className="nav-link" onClick={() => setMenuOpen(false)}>🛍️ Products</NavLink>
          <NavLink to="/cart" className="nav-link" onClick={() => setMenuOpen(false)}>
            🛒 Cart {cart.length > 0 && <span className="badge">{cart.length}</span>}
          </NavLink>
          {user ? (
            <>
              <NavLink to="/my-orders" className="nav-link" onClick={() => setMenuOpen(false)}>📦 Orders</NavLink>
              {user.role === 'admin' && <NavLink to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>⚙️ Admin</NavLink>}
              {['admin', 'delivery'].includes(user.role) && <NavLink to="/delivery" className="nav-link" onClick={() => setMenuOpen(false)}>🚚 Delivery</NavLink>}
              <NavLink to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>👤 {user.name}</NavLink>
              <button className="nav-link" onClick={() => { logout(); navigate('/'); setMenuOpen(false); }} style={{background:'none',border:'none',cursor:'pointer',color:'inherit'}}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link nav-btn-login" onClick={() => setMenuOpen(false)}>Login</NavLink>
              <NavLink to="/register" className="nav-link" onClick={() => setMenuOpen(false)}>Register</NavLink>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo"><img src="/logo.jpeg" alt="Milqon Dairy" style={{ width: 36, height: 36, borderRadius: 8, verticalAlign: 'middle', marginRight: 8 }} />Milqon Dairy</div>
      <div className="footer-tagline">Har Ghar Ka Bharosa – Milqon Dairy</div>
      <div className="footer-links">
        <a href="/">Home</a>
        <a href="/products">Products</a>
        <a href="/my-orders">My Orders</a>
        <a href="/login">Login</a>
      </div>
      <div className="footer-copy">© 2025 Milqon Dairy. All rights reserved. | Made with ❤️ for fresh dairy lovers</div>
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
          </Routes>
          <Footer />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
