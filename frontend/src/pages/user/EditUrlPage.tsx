import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { urlApi } from '../../api/urlApi';
import { toast } from '../../store/useToastStore';

export default function EditUrlPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', expiryDate: '', active: true, password: '', removeExpiry: false, removePassword: false });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    urlApi.getById(Number(id))
      .then((res) => {
        const d = res.data.data;
        setForm({
          title: d.title || '',
          expiryDate: d.expiryDate ? new Date(d.expiryDate).toISOString().slice(0, 16) : '',
          active: d.active,
          password: '',
          removeExpiry: false,
          removePassword: false,
        });
      })
      .catch(() => toast.error('Failed to load URL'))
      .finally(() => setFetchLoading(false));
  }, [id]);

  const update = (key: string, val: string | boolean) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await urlApi.update(Number(id), {
        title: form.title || undefined,
        expiryDate: form.removeExpiry ? null : form.expiryDate || undefined,
        active: form.active,
        password: form.removePassword ? null : form.password || undefined,
        removeExpiry: form.removeExpiry,
        removePassword: form.removePassword,
      });
      toast.success('URL updated successfully!');
      navigate('/urls');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  if (fetchLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div style={{ width: 32, height: 32, border: '3px solid rgba(108,99,255,0.2)', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;

  return (
    <div style={{ maxWidth: '600px', animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate('/urls')} style={{ background: 'none', border: 'none', color: '#8888aa', cursor: 'pointer', fontSize: '14px', marginBottom: '12px' }}>← Back to My URLs</button>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f0f0f5' }}>Edit URL</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8888aa', fontWeight: 500 }}>Title</label>
          <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Link title" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none' }} />
        </div>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px 20px' }}>
          <div>
            <p style={{ color: '#f0f0f5', fontWeight: 500, fontSize: '14px' }}>URL Status</p>
            <p style={{ color: '#8888aa', fontSize: '12px' }}>{form.active ? 'This URL is accepting clicks' : 'This URL is disabled'}</p>
          </div>
          <button type="button" onClick={() => update('active', !form.active)} style={{ padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', background: form.active ? 'rgba(0,212,170,0.15)' : 'rgba(255,107,107,0.15)', color: form.active ? '#00d4aa' : '#ff6b6b' }}>{form.active ? 'Active' : 'Inactive'}</button>
        </div>

        {/* Expiry */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8888aa', fontWeight: 500 }}>Expiry Date</label>
          <input type="datetime-local" value={form.expiryDate} onChange={(e) => update('expiryDate', e.target.value)} disabled={form.removeExpiry} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none', colorScheme: 'dark', opacity: form.removeExpiry ? 0.5 : 1 }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer', color: '#8888aa', fontSize: '13px' }}>
            <input type="checkbox" checked={form.removeExpiry} onChange={(e) => update('removeExpiry', e.target.checked)} style={{ accentColor: '#ff6b6b' }} />
            Remove expiry (make permanent)
          </label>
        </div>

        {/* Password */}
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8888aa', fontWeight: 500 }}>New Password <span style={{ color: '#555566' }}>(leave empty to keep current)</span></label>
          <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} disabled={form.removePassword} placeholder="••••••••" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none', opacity: form.removePassword ? 0.5 : 1 }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer', color: '#8888aa', fontSize: '13px' }}>
            <input type="checkbox" checked={form.removePassword} onChange={(e) => update('removePassword', e.target.checked)} style={{ accentColor: '#ff6b6b' }} />
            Remove password protection
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" disabled={loading} style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate('/urls')} style={{ padding: '14px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#8888aa', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
