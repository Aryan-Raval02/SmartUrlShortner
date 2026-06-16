import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { urlApi } from '../../api/urlApi';
import { toast } from '../../store/useToastStore';

export default function CreateUrlPage() {
  const [form, setForm] = useState({ originalUrl: '', customAlias: '', title: '', expiryDate: '', password: '', generateQR: false });
  const [aliasAvailable, setAliasAvailable] = useState<boolean | null>(null);
  const [aliasChecking, setAliasChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ shortUrl: string; id: number } | null>(null);
  const navigate = useNavigate();
  const aliasTimeout = useRef<ReturnType<typeof setTimeout>>();

  const update = (key: string, val: string | boolean) => setForm((f) => ({ ...f, [key]: val }));

  // Debounced alias check
  useEffect(() => {
    if (!form.customAlias) { setAliasAvailable(null); return; }
    clearTimeout(aliasTimeout.current);
    setAliasChecking(true);
    aliasTimeout.current = setTimeout(async () => {
      try {
        const res = await urlApi.checkAlias(form.customAlias);
        setAliasAvailable(res.data.data?.available);
      } catch { setAliasAvailable(false); }
      finally { setAliasChecking(false); }
    }, 500);
  }, [form.customAlias]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.originalUrl) { toast.error('Original URL is required'); return; }
    if (form.customAlias && aliasAvailable === false) { toast.error('Alias is not available'); return; }
    setLoading(true);
    try {
      const res = await urlApi.create({
        originalUrl: form.originalUrl,
        customAlias: form.customAlias || undefined,
        title: form.title || undefined,
        expiryDate: form.expiryDate || undefined,
        password: form.password || undefined,
        generateQR: form.generateQR,
      });
      const data = res.data.data;
      setResult({ shortUrl: data.shortUrl, id: data.id });
      toast.success('Short URL created!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create URL');
    } finally { setLoading(false); }
  };

  const copyUrl = (url: string) => { navigator.clipboard.writeText(url); toast.success('Copied!'); };

  if (result) return (
    <div style={{ maxWidth: '500px', margin: '0 auto', animation: 'fadeIn 0.4s ease' }}>
      <div style={{ background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{ color: '#00d4aa', fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>URL Created Successfully!</h2>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <p style={{ color: '#f0f0f5', fontSize: '18px', fontWeight: 600, wordBreak: 'break-all' }}>{result.shortUrl}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => copyUrl(result.shortUrl)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Copy URL</button>
          <button onClick={() => navigate(`/urls/${result.id}/analytics`)} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f0f0f5', fontWeight: 500, cursor: 'pointer' }}>View Stats</button>
          <button onClick={() => { setResult(null); setForm({ originalUrl: '', customAlias: '', title: '', expiryDate: '', password: '', generateQR: false }); }} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#8888aa', cursor: 'pointer' }}>Create Another</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '600px', animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f0f0f5', marginBottom: '6px' }}>Create Short URL</h1>
        <p style={{ color: '#8888aa', fontSize: '14px' }}>Shorten any long URL into a memorable short link</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Original URL */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8888aa', fontWeight: 500 }}>Original URL *</label>
          <input id="create-original-url" type="url" value={form.originalUrl} onChange={(e) => update('originalUrl', e.target.value)} placeholder="https://example.com/very/long/url" required style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none' }} />
        </div>

        {/* Custom Alias */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8888aa', fontWeight: 500 }}>Custom Alias <span style={{ color: '#555566' }}>(optional)</span></label>
          <div style={{ position: 'relative' }}>
            <input id="create-alias" type="text" value={form.customAlias} onChange={(e) => update('customAlias', e.target.value)} placeholder="my-cool-link" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${aliasAvailable === true ? 'rgba(0,212,170,0.4)' : aliasAvailable === false ? 'rgba(255,107,107,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', padding: '12px 40px 12px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none' }} />
            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>
              {aliasChecking ? '⌛' : aliasAvailable === true ? '✅' : aliasAvailable === false ? '❌' : ''}
            </span>
          </div>
          {form.customAlias && <p style={{ fontSize: '12px', marginTop: '4px', color: aliasAvailable ? '#00d4aa' : aliasAvailable === false ? '#ff6b6b' : '#555566' }}>{aliasAvailable === true ? 'Alias is available!' : aliasAvailable === false ? 'Alias is taken or reserved' : ''}</p>}
        </div>

        {/* Title */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8888aa', fontWeight: 500 }}>Title <span style={{ color: '#555566' }}>(optional)</span></label>
          <input id="create-title" type="text" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="My awesome link" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Expiry */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8888aa', fontWeight: 500 }}>Expiry Date <span style={{ color: '#555566' }}>(optional)</span></label>
            <input id="create-expiry" type="datetime-local" value={form.expiryDate} onChange={(e) => update('expiryDate', e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none', colorScheme: 'dark' }} />
          </div>
          {/* Password */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8888aa', fontWeight: 500 }}>Password <span style={{ color: '#555566' }}>(optional)</span></label>
            <input id="create-password" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="Protect with password" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none' }} />
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#8888aa', fontSize: '14px' }}>
          <input type="checkbox" id="create-qr" checked={form.generateQR} onChange={(e) => update('generateQR', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#6c63ff' }} />
          Generate QR Code
        </label>

        <button
          id="create-submit"
          type="submit"
          disabled={loading || (!!form.customAlias && aliasAvailable === false)}
          style={{ padding: '14px', background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '16px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {loading && <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
          {loading ? 'Creating...' : '🔗 Create Short URL'}
        </button>
      </form>
    </div>
  );
}
