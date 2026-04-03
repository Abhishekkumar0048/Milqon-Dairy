import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!form.email || !form.password) return setError('Please enter email and password');
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.user.role !== 'admin') {
        setError('Access denied. Admin only.');
        setLoading(false);
        return;
      }
      login(data.user, data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0d1b0f,#1b3a1f)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 420, margin: 16, backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#1b5e20,#2e7d32)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 16px', boxShadow: '0 4px 20px rgba(46,125,50,0.4)' }}>🛠️</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>Admin Panel</div>
          <div style={{ fontSize: 13, color: '#a5d6a7', marginTop: 6 }}>Milqon Dairy — Restricted Access</div>
        </div>

        {/* Form */}
        <div style={{ marginBottom: 16 }}>
          <input
            placeholder="Admin Email"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            style={{ width: '100%', padding: '13px 16px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: 20, position: 'relative' }}>
          <input
            placeholder="Password"
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '13px 44px 13px 16px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
          />
          <button onClick={() => setShowPass(p => !p)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#a5d6a7' }}>
            {showPass ? '🙈' : '👁️'}
          </button>
        </div>

        <button onClick={handleLogin} disabled={loading}
          style={{ width: '100%', padding: 14, background: loading ? '#555' : 'linear-gradient(135deg,#1b5e20,#2e7d32)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(46,125,50,0.4)' }}>
          {loading ? 'Logging in...' : '🔐 Login as Admin'}
        </button>

        {error && (
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(198,40,40,0.2)', border: '1px solid rgba(198,40,40,0.4)', color: '#ef9a9a', borderRadius: 10, fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
            ❌ {error}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a href="/login" style={{ fontSize: 13, color: '#a5d6a7', textDecoration: 'none' }}>← Customer Login</a>
        </div>
      </div>
    </div>
  );
}
