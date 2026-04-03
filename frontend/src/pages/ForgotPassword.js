import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [input, setInput] = useState('');   // email or phone
  const [email, setEmail] = useState('');   // resolved email from backend
  const [otp, setOtp] = useState('');
  const [shownOtp, setShownOtp] = useState(''); // if email not configured
  const [newPassword, setNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', ok: false });
  const navigate = useNavigate();

  const isPhone = (v) => /^[6-9]\d{9}$/.test(v.trim());

  const sendOtp = async () => {
    if (!input.trim()) return setMsg({ text: 'Please enter email or phone number', ok: false });
    setLoading(true); setMsg({ text: '', ok: false });
    try {
      const payload = isPhone(input) ? { phone: input.trim() } : { email: input.trim() };
      const { data } = await api.post('/auth/forgot-password', payload);
      setEmail(data.email);
      if (data.otp) {
        // Email not configured — show OTP directly on screen
        setShownOtp(data.otp);
        setMsg({ text: `Email service not set up. Use the OTP shown below.`, ok: false });
      } else {
        setMsg({ text: `OTP sent to ${data.email}. Check inbox & spam folder.`, ok: true });
      }
      setStep(2);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'No account found', ok: false });
    }
    setLoading(false);
  };

  const resetPassword = async () => {
    if (!otp || !newPassword) return setMsg({ text: 'Please fill all fields', ok: false });
    if (newPassword.length < 6) return setMsg({ text: 'Password must be at least 6 characters', ok: false });
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      setMsg({ text: '✅ Password reset successfully! Redirecting...', ok: true });
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Invalid OTP', ok: false });
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: 48 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/logo.jpeg" alt="Milqon" style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover' }} />
          <h2 style={{ margin: '12px 0 4px', color: '#1b5e20' }}>Forgot Password</h2>
          <p style={{ color: '#888', fontSize: 13, margin: 0 }}>
            {step === 1 ? 'Enter your email or phone number' : `OTP sent to ${email}`}
          </p>
        </div>

        {step === 1 ? (
          <>
            <div className="form-group">
              <label>Email or Phone Number</label>
              <input
                placeholder="email@example.com or 9876543210"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendOtp()}
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: 13 }} onClick={sendOtp} disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            {/* Show OTP on screen if email not configured */}
            {shownOtp && (
              <div style={{ background: '#fff3e0', border: '2px dashed #ff9800', borderRadius: 12, padding: '14px 16px', marginBottom: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: '#e65100', fontWeight: 700, marginBottom: 6 }}>⚠️ Email not configured — Your OTP is:</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#1b5e20', letterSpacing: 8 }}>{shownOtp}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Valid for 10 minutes</div>
              </div>
            )}

            <div className="form-group">
              <label>Enter OTP</label>
              <input
                placeholder="6-digit OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                style={{ letterSpacing: 6, fontSize: 22, textAlign: 'center', fontWeight: 700 }}
                maxLength={6}
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && resetPassword()}
                  style={{ paddingRight: 44 }}
                />
                <button onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#888' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: 13 }} onClick={resetPassword} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button onClick={() => { setStep(1); setMsg({ text: '', ok: false }); setShownOtp(''); }}
              style={{ width: '100%', marginTop: 8, background: 'none', border: 'none', color: '#2e7d32', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
              ← Try different email/phone
            </button>
          </>
        )}

        {msg.text && (
          <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: msg.ok ? '#e8f5e9' : '#fce4ec', color: msg.ok ? '#2e7d32' : '#c62828', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
            {msg.text}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          <a href="/login" style={{ color: '#2e7d32', fontWeight: 700 }}>← Back to Login</a>
        </div>
      </div>
    </div>
  );
}
