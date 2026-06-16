import { useState, useEffect } from 'react';
import { urlApi } from '../api/urlApi';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from '../store/useToastStore';

interface PublicStats { totalUrls: number; totalClicks: number; totalUsers: number; }

export default function LandingPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ shortUrl: string } | null>(null);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    authApi.getPublicStats()
      .then((res) => setStats(res.data.data))
      .catch(() => {});
  }, []);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) { toast.error('Please enter a URL'); return; }
    if (!url.startsWith('http://') && !url.startsWith('https://')) { toast.error('URL must start with http:// or https://'); return; }
    setLoading(true);
    try {
      const res = await urlApi.create({ originalUrl: url });
      setResult({ shortUrl: res.data.data?.shortUrl });
      toast.success('Short URL created!');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to shorten URL';
      toast.error(msg.includes('rate limit') ? '5 URLs/day limit reached. Sign up for unlimited!' : msg);
    } finally { setLoading(false); }
  };

  const copyResult = () => { if (result) { navigator.clipboard.writeText(result.shortUrl); toast.success('Copied!'); } };

  return (
    <div>
      {/* Hero */}
      <section style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        {/* Background blur orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(108, 99, 255, 0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(0, 212, 170, 0.06)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: '800px', width: '100%', animation: 'fadeIn 0.6s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '20px', padding: '6px 16px', marginBottom: '32px', color: '#7d75ff', fontSize: '13px', fontWeight: 500 }}>
            ✨ Smart URL Shortener
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px', color: '#f0f0f5' }}>
            Shorten. Share.{' '}
            <span style={{ background: 'linear-gradient(135deg, #6c63ff, #00d4aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Analyze.
            </span>
          </h1>

          <p style={{ fontSize: '18px', color: '#8888aa', maxWidth: '560px', margin: '0 auto 48px', lineHeight: 1.7 }}>
            Create powerful short links with analytics, QR codes, expiry dates, and password protection — all in seconds.
          </p>

          {/* URL Shortener Input */}
          {!result ? (
            <form onSubmit={handleShorten} style={{ display: 'flex', gap: '10px', maxWidth: '640px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input
                id="hero-url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your long URL here..."
                style={{
                  flex: 1, minWidth: '280px', padding: '16px 20px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px', color: '#f0f0f5', fontSize: '16px',
                  outline: 'none', transition: 'border-color 200ms',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#6c63ff'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              />
              <button
                id="hero-shorten-btn"
                type="submit"
                disabled={loading}
                style={{
                  padding: '16px 32px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #6c63ff, #7d75ff)',
                  color: '#fff', fontSize: '16px', fontWeight: 700, opacity: loading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 0 30px rgba(108,99,255,0.3)',
                  whiteSpace: 'nowrap',
                }}
              >
                {loading && <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
                {loading ? 'Shortening...' : '🔗 Shorten URL'}
              </button>
            </form>
          ) : (
            <div style={{ maxWidth: '640px', margin: '0 auto', background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '16px', padding: '24px', animation: 'fadeIn 0.4s ease' }}>
              <p style={{ color: '#8888aa', fontSize: '13px', marginBottom: '8px' }}>Your short URL:</p>
              <p style={{ color: '#00d4aa', fontSize: '22px', fontWeight: 700, marginBottom: '16px', wordBreak: 'break-all' }}>{result.shortUrl}</p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={copyResult} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>📋 Copy</button>
                <a href={result.shortUrl} target="_blank" rel="noreferrer" style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#f0f0f5', fontWeight: 500 }}>🔗 Test Link</a>
                <button onClick={() => { setResult(null); setUrl(''); }} style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#8888aa', cursor: 'pointer' }}>Shorten Another</button>
              </div>
              {!isAuthenticated && (
                <p style={{ marginTop: '16px', color: '#555566', fontSize: '13px' }}>
                  <a href="/register" style={{ color: '#6c63ff' }}>Sign up for free</a> to track clicks, add expiry dates, and more!
                </p>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <p style={{ marginTop: '20px', color: '#555566', fontSize: '14px' }}>
              No account needed to shorten · 5 URLs/day for guests · <a href="/register" style={{ color: '#6c63ff' }}>Sign up for unlimited</a>
            </p>
          )}
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section style={{ padding: '48px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', textAlign: 'center' }}>
            {[
              { label: 'Short URLs Created', value: stats.totalUrls.toLocaleString(), color: '#6c63ff' },
              { label: 'Total Clicks Tracked', value: stats.totalClicks.toLocaleString(), color: '#00d4aa' },
              { label: 'Happy Users', value: stats.totalUsers.toLocaleString(), color: '#7d75ff' },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: '36px', fontWeight: 800, color: s.color, marginBottom: '6px' }}>{s.value}</div>
                <div style={{ color: '#555566', fontSize: '14px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#f0f0f5', marginBottom: '16px' }}>Everything you need</h2>
          <p style={{ textAlign: 'center', color: '#8888aa', marginBottom: '56px', maxWidth: '500px', margin: '0 auto 56px' }}>A complete link management platform with analytics, security, and more.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              { icon: '📊', title: 'Click Analytics', desc: 'Track clicks, browsers, devices, countries, and referrers in real-time with beautiful charts.' },
              { icon: '🔒', title: 'Password Protection', desc: 'Add a password to your links so only authorized people can access them.' },
              { icon: '⏰', title: 'Link Expiry', desc: 'Set expiration dates on your links. They automatically deactivate when the time comes.' },
              { icon: '🎨', title: 'Custom Aliases', desc: 'Choose your own short code like /my-promo instead of a random string.' },
              { icon: '📱', title: 'QR Code Generation', desc: 'Instantly generate scannable QR codes for any of your short links.' },
              { icon: '🛡', title: 'Admin Controls', desc: 'Full admin panel to manage all users and URLs across the platform.' },
            ].map((f) => (
              <div key={f.title} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '28px', transition: 'border-color 300ms, transform 300ms' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108,99,255,0.3)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ color: '#f0f0f5', fontWeight: 600, marginBottom: '8px', fontSize: '17px' }}>{f.title}</h3>
                <p style={{ color: '#8888aa', fontSize: '14px', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,212,170,0.08))', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '24px', padding: '56px 40px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#f0f0f5', marginBottom: '16px' }}>Start for free today</h2>
            <p style={{ color: '#8888aa', marginBottom: '32px', fontSize: '16px' }}>No credit card required. Unlimited links, full analytics.</p>
            <a href="/register" style={{ display: 'inline-block', padding: '16px 40px', background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', borderRadius: '12px', color: '#fff', fontSize: '17px', fontWeight: 700, boxShadow: '0 0 30px rgba(108,99,255,0.3)', textDecoration: 'none' }}>Create free account →</a>
          </div>
        </section>
      )}
    </div>
  );
}
