import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from '../../store/useToastStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      const { data: { data } } = res;
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Welcome back!');
      navigate(data.user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)', padding: '24px',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)',
        borderRadius: '20px', padding: '40px', backdropFilter: 'blur(12px)',
        animation: 'fadeIn 0.4s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #6c63ff, #00d4aa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: 700, color: '#fff', margin: '0 auto 16px',
          }}>S</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f0f0f5', marginBottom: '6px' }}>Welcome back</h1>
          <p style={{ color: '#8888aa', fontSize: '14px' }}>Sign in to your Shortly account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8888aa' }}>Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px', padding: '10px 14px', color: '#f0f0f5', fontSize: '14px',
                outline: 'none', transition: 'border-color 200ms',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8888aa' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', padding: '10px 40px 10px 14px', color: '#f0f0f5', fontSize: '14px',
                  outline: 'none', transition: 'border-color 200ms',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#555566', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <a href="/forgot-password" style={{ fontSize: '13px', color: '#6c63ff' }}>Forgot password?</a>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', color: '#fff', fontSize: '15px', fontWeight: 600,
              opacity: loading ? 0.7 : 1, transition: 'all 250ms', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {loading && <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#8888aa' }}>
          Don't have an account?{' '}
          <a href="/register" style={{ color: '#6c63ff', fontWeight: 500 }}>Sign up for free</a>
        </p>
      </div>
    </div>
  );
}
