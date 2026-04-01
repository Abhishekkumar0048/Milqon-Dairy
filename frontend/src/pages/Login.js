import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const SLIDES = ['/milk1.jpg', '/milk2.jpg', '/milk3.jpg', '/milk4.jpg'];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [slide, setSlide] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleLogin = async () => {
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Full screen sliding background */}
      {SLIDES.map((src, i) => (
        <img key={i} src={src} alt="" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: slide === i ? 1 : 0, transition: 'opacity 0.8s ease', zIndex: 0 }} />
      ))}
      {/* Dark overlay */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,61,31,0.6)', zIndex: 1 }} />

      {/* Login Form */}
      <div style={{ position: 'relative', zIndex: 2, background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 36, width: '100%', maxWidth: 420, margin: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <img src="/logo.jpeg" alt="Milqon Dairy" style={{ width: 70, height: 70, borderRadius: 16, objectFit: 'cover', boxShadow: '0 4px 12px rgba(27,94,32,0.25)' }} />
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1b5e20', marginTop: 10 }}>Welcome Back!</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Login to your account</div>
        </div>
        <div className="form-group">
          <input placeholder="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="form-group">
          <div style={{ position: 'relative' }}>
            <input placeholder="Password" type={showPass ? 'text' : 'password'} value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ paddingRight: 44 }} />
            <button onClick={() => setShowPass(p => !p)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#888' }}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', padding: 14 }} onClick={handleLogin}>Login</button>
        <div style={{ textAlign: 'right', marginTop: 8 }}>
          <a href="/forgot-password" style={{ fontSize: 13, color: '#2e7d32', fontWeight: 600 }}>Forgot Password?</a>
        </div>
        <div className="auth-link" onClick={() => navigate('/register')}>
          Don't have an account? <span>Register</span>
        </div>
        {/* Slider dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {SLIDES.map((_, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: slide === i ? '#2e7d32' : '#ccc', transition: 'all 0.3s' }} />)}
        </div>
      </div>
    </div>
  );
}
