import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const ROLE_CONFIG = {
  admin:    { icon: '⚙️', title: 'Admin Login',    color: '#1b5e20', redirect: '/admin' },
  delivery: { icon: '🚚', title: 'Delivery Login',  color: '#e65100', redirect: '/delivery' },
};

export default function StaffLogin() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [role, setRole]     = useState('admin');
  const [showPass, setShowPass] = useState(false);
  const { login }           = useAuth();
  const navigate            = useNavigate();
  const config              = ROLE_CONFIG[role];

  const handleLogin = async () => {
    try {
      const { data } = await api.post('/auth/login', form);
      if (!['admin', 'delivery'].includes(data.user.role)) {
        alert('Access denied. Staff only.');
        return;
      }
      login(data.user, data.token);
      navigate(ROLE_CONFIG[data.user.role].redirect);
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 36, width: '100%', maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>

        {/* Role Toggle */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          {Object.entries(ROLE_CONFIG).map(([key, val]) => (
            <button key={key} onClick={() => setRole(key)}
              style={{ flex: 1, padding: '10px', borderRadius: 10, border: `2px solid ${role === key ? val.color : '#e0e0e0'}`, background: role === key ? val.color : '#fff', color: role === key ? '#fff' : '#555', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              {val.icon} {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 52, marginBottom: 8 }}>{config.icon}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: config.color }}>{config.title}</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Milqon Dairy — Staff Portal</div>
        </div>

        {/* Email */}
        <div className="form-group">
          <input placeholder="Staff Email" type="email" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>

        {/* Password with show/hide */}
        <div className="form-group">
          <div style={{ position: 'relative' }}>
            <input
              placeholder="Password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ paddingRight: 44 }}
            />
            <button onClick={() => setShowPass(p => !p)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#888' }}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button onClick={handleLogin}
          style={{ width: '100%', padding: 14, background: config.color, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 4 }}>
          {config.icon} Login as {role.charAt(0).toUpperCase() + role.slice(1)}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#aaa' }}>
          Customer? <span style={{ color: '#2e7d32', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/login')}>Login here</span>
        </div>
      </div>
    </div>
  );
}
