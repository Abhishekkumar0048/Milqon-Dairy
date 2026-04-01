import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Profile() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const save = async () => {
    setLoading(true);
    setMsg('');
    try {
      const { data } = await api.put('/auth/profile', { name, email, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined });
      login(data.token, data.user);
      setMsg('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed');
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 40 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 12px' }}>👤</div>
          <h2 style={{ margin: 0, color: '#1b5e20' }}>My Profile</h2>
        </div>

        <div className="form-group">
          <label>Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginTop: 8, marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#555', marginBottom: 12 }}>🔒 Change Password (optional)</div>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" placeholder="Enter current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" placeholder="Min 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', padding: 13 }} onClick={save} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

        {msg && <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: msg.includes('success') ? '#e8f5e9' : '#fce4ec', color: msg.includes('success') ? '#2e7d32' : '#c62828', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{msg}</div>}
      </div>
    </div>
  );
}
