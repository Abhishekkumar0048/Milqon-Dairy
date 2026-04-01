import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="auth-split">
      {/* Left Image Panel */}
      <div className="auth-image-panel">
        <img src="/nature.jpeg" alt="Milqon Dairy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div className="auth-image-overlay">
          <img src="/logo.jpeg" alt="logo" style={{ width: 70, height: 70, borderRadius: 16, objectFit: 'cover', marginBottom: 16 }} />
          <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: 0 }}>Milqon Dairy</h2>
          <p style={{ color: '#c8e6c9', fontSize: 14, marginTop: 8 }}>Har Ghar Ka Bharosa</p>
        </div>
      </div>
      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-page">
          <div className="auth-logo">
            <img src="/logo.jpeg" alt="Milqon Dairy" style={{ width: 70, height: 70, borderRadius: 16, objectFit: 'cover', boxShadow: '0 4px 12px rgba(27,94,32,0.25)' }} />
          </div>
          <div className="auth-title">Welcome Back!</div>
          <div className="auth-subtitle">Login to your account</div>
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
        </div>
      </div>
    </div>
  );
}
