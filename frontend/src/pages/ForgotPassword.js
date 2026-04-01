import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1=email, 2=otp+newpass
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const sendOtp = async () => {
    if (!email) return setMsg('Please enter your email');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      setMsg('OTP sent to your email. Check inbox/spam.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const resetPassword = async () => {
    if (!otp || !newPassword) return setMsg('Please fill all fields');
    if (newPassword.length < 6) return setMsg('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setMsg('Password reset successfully!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: 48 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/logo.jpeg" alt="Milqon" style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover' }} />
          <h2 style={{ margin: '12px 0 4px', color: '#1b5e20' }}>Forgot Password</h2>
          <p style={{ color: '#888', fontSize: 13, margin: 0 }}>We'll send an OTP to your email</p>
        </div>

        {step === 1 ? (
          <>
            <div className="form-group">
              <label>Registered Email</label>
              <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: 13 }} onClick={sendOtp} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>OTP (sent to {email})</label>
              <input placeholder="6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} style={{ letterSpacing: 4, fontSize: 20, textAlign: 'center' }} maxLength={6} />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" placeholder="Min 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: 13 }} onClick={resetPassword} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button onClick={() => { setStep(1); setMsg(''); }} style={{ width: '100%', marginTop: 8, background: 'none', border: 'none', color: '#2e7d32', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              ← Change Email
            </button>
          </>
        )}

        {msg && <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: msg.includes('success') ? '#e8f5e9' : '#fce4ec', color: msg.includes('success') ? '#2e7d32' : '#c62828', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{msg}</div>}

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          <a href="/login" style={{ color: '#2e7d32', fontWeight: 700 }}>← Back to Login</a>
        </div>
      </div>
    </div>
  );
}
