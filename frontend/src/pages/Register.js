import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-split">
      <div className="auth-image-panel">
        <img src="/nature.jpeg" alt="Milqon Dairy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div className="auth-image-overlay">
          <img src="/logo.jpeg" alt="logo" style={{ width: 70, height: 70, borderRadius: 16, objectFit: 'cover', marginBottom: 16 }} />
          <h2 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: 0 }}>Milqon Dairy</h2>
          <p style={{ color: '#c8e6c9', fontSize: 14, marginTop: 8 }}>Har Ghar Ka Bharosa</p>
        </div>
      </div>
      <div className="auth-form-panel">
        <div className="auth-page">
          <div className="auth-logo">
            <img src="/logo.jpeg" alt="Milqon Dairy" style={{ width: 70, height: 70, borderRadius: 16, objectFit: 'cover', boxShadow: '0 4px 12px rgba(27,94,32,0.25)' }} />
          </div>
          <div className="auth-title">Create Account</div>
          <div className="auth-subtitle">Join Milqon Dairy family</div>
          {[
            { key: 'name', placeholder: 'Full Name', type: 'text' },
            { key: 'email', placeholder: 'Email', type: 'email' },
            { key: 'password', placeholder: 'Password (min 6 chars)', type: 'password' },
            { key: 'phone', placeholder: 'Phone Number', type: 'tel' },
            { key: 'address', placeholder: 'Address', type: 'text' },
          ].map(f => (
            <div key={f.key} className="form-group">
              <input type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={e => set(f.key, e.target.value)} />
            </div>
          ))}
          <button className="btn btn-primary" style={{ width: '100%', padding: 14 }} onClick={handleRegister}>Register</button>
          <div className="auth-link" onClick={() => navigate('/login')}>
            Already have an account? <span>Login</span>
          </div>
        </div>
      </div>
    </div>
  );
}
