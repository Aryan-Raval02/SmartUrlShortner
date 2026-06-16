import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from '../../store/useToastStore';

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.username || !form.email || !form.password) {
      toast.error('All fields are required');
      return;
    }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await authApi.register(form);
      toast.success('Account created! Please verify your email.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '40px', backdropFilter: 'blur(12px)', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #6c63ff, #00d4aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, color: '#fff', margin: '0 auto 16px' }}>S</div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#f0f0f5', marginBottom: '6px' }}>Create your account</h1>
          <p style={{ color: '#8888aa', fontSize: '14px' }}>Start shortening URLs for free</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {(['fullName', 'username', 'email'] as const).map((key) => (
            <div key={key}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8888aa' }}>
                {key === 'fullName' ? 'Full Name' : key === 'username' ? 'Username' : 'Email'}
              </label>
              <input
                id={`register-${key}`}
                type={key === 'email' ? 'email' : 'text'}
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                placeholder={key === 'email' ? 'you@example.com' : key === 'username' ? 'cooluser123' : 'John Doe'}
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none' }}
              />
            </div>
          ))}

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8888aa' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="register-password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="Min 8 chars, uppercase, lowercase, digit"
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 40px 10px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none' }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555566', fontSize: '14px' }}>{showPass ? '🙈' : '👁'}</button>
            </div>
          </div>

          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', color: '#fff', fontSize: '15px', fontWeight: 600, opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}
          >
            {loading && <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#8888aa' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#6c63ff', fontWeight: 500 }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}
