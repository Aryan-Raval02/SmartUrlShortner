import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { toast } from '../../store/useToastStore';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword, confirmPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Reset failed. Token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div style={{ textAlign: 'center', color: '#ff6b6b' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠</div>
        <p>Invalid or missing reset token. <a href="/forgot-password" style={{ color: '#6c63ff' }}>Request a new one</a></p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '40px', backdropFilter: 'blur(12px)' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f0f0f5', marginBottom: '8px' }}>Reset password</h1>
        <p style={{ color: '#8888aa', fontSize: '14px', marginBottom: '24px' }}>Enter your new password below.</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            id="reset-new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none' }}
          />
          <input
            id="reset-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none' }}
          />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', color: '#fff', fontSize: '15px', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
}
