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
    <div className="auth-page">
      <div className="auth-logo">
        <img src="/logo.jpeg" alt="Milqon Dairy" style={{ width: 90, height: 90, borderRadius: 20, objectFit: 'cover', boxShadow: '0 4px 12px rgba(27,94,32,0.25)' }} />
      </div>
      <div className="auth-title">Milqon Dairy</div>
      <div className="auth-subtitle">Har Ghar Ka Bharosa</div>
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
  );
}
