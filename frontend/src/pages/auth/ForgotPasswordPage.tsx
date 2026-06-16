import { useState } from 'react';
import { authApi } from '../../api/authApi';
import { toast } from '../../store/useToastStore';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (_) {
      setSent(true); // Always show success to prevent enumeration
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '40px', backdropFilter: 'blur(12px)' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f0f0f5', marginBottom: '8px' }}>Forgot password</h1>
        {!sent ? (
          <>
            <p style={{ color: '#8888aa', fontSize: '14px', marginBottom: '24px' }}>Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none' }}
              />
              <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', color: '#fff', fontSize: '15px', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
            <p style={{ color: '#00d4aa', fontWeight: 600, marginBottom: '8px' }}>Check your inbox!</p>
            <p style={{ color: '#8888aa', fontSize: '14px' }}>If an account with that email exists, a reset link has been sent. It expires in 30 minutes.</p>
          </div>
        )}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
          <a href="/login" style={{ color: '#6c63ff' }}>← Back to sign in</a>
        </p>
      </div>
    </div>
  );
}
