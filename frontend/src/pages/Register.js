import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const SLIDES = ['/milk1.jpg', '/milk2.jpg', '/milk3.jpg', '/milk4.jpg'];

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [slide, setSlide] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 3000);
    return () => clearInterval(t);
  }, []);

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
    <div style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {SLIDES.map((src, i) => (
        <img key={i} src={src} alt="" style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: slide === i ? 1 : 0, transition: 'opacity 0.8s ease', zIndex: 0 }} />
      ))}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,61,31,0.6)', zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 2, background: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 36, width: '100%', maxWidth: 420, margin: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <img src="/logo.jpeg" alt="Milqon Dairy" style={{ width: 70, height: 70, borderRadius: 16, objectFit: 'cover', boxShadow: '0 4px 12px rgba(27,94,32,0.25)' }} />
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1b5e20', marginTop: 10 }}>Create Account</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Join Milqon Dairy family</div>
        </div>
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
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          {SLIDES.map((_, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: slide === i ? '#2e7d32' : '#ccc', transition: 'all 0.3s' }} />)}
        </div>
      </div>
    </div>
  );
}
