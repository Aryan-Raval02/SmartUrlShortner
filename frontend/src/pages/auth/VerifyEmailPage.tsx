import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authApi.verifyEmail(token)
      .then(() => { setStatus('success'); setTimeout(() => navigate('/login'), 3000); })
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        {status === 'loading' && (
          <><div style={{ width: 40, height: 40, border: '3px solid rgba(108,99,255,0.2)', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} /><p style={{ color: '#8888aa' }}>Verifying your email...</p></>
        )}
        {status === 'success' && (
          <><div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div><h2 style={{ color: '#00d4aa', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Email Verified!</h2><p style={{ color: '#8888aa' }}>Redirecting to login in 3 seconds...</p></>
        )}
        {status === 'error' && (
          <><div style={{ fontSize: '64px', marginBottom: '16px' }}>❌</div><h2 style={{ color: '#ff6b6b', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Verification Failed</h2><p style={{ color: '#8888aa', marginBottom: '24px' }}>The token is invalid or has expired.</p><a href="/login" style={{ color: '#6c63ff', fontWeight: 500 }}>← Back to login</a></>
        )}
      </div>
    </div>
  );
}
