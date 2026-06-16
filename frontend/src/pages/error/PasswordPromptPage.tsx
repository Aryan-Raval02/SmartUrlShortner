import { useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toast } from '../../store/useToastStore';

export default function PasswordPromptPage() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.post(`/${shortCode}/verify`, { password });
      // Redirect to the original URL
      if (res.data?.originalUrl) {
        window.location.href = res.data.originalUrl;
      }
    } catch (err: any) {
      setError('Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: '380px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '40px', textAlign: 'center', backdropFilter: 'blur(12px)' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔒</div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#f0f0f5', marginBottom: '8px' }}>Password Protected</h1>
        <p style={{ color: '#8888aa', fontSize: '14px', marginBottom: '24px' }}>
          This link requires a password to access. Enter it below.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${error ? 'rgba(255,107,107,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', padding: '12px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none', textAlign: 'center', letterSpacing: '2px' }}
          />
          {error && <p style={{ color: '#ff6b6b', fontSize: '13px' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            style={{ padding: '12px', background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: loading || !password ? 'not-allowed' : 'pointer', opacity: loading || !password ? 0.7 : 1 }}
          >
            {loading ? 'Unlocking...' : '🔓 Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}
