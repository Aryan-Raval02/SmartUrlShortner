import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { toast } from '../../store/useToastStore';

export default function AdminUrlsPage() {
  const [urls, setUrls] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const size = 20;

  const loadUrls = () => {
    setLoading(true);
    adminApi.listAllUrls(page, size)
      .then((res) => { setUrls(res.data.data?.content || []); setTotal(res.data.data?.totalElements || 0); })
      .catch(() => toast.error('Failed to load URLs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUrls(); }, [page]);

  const handleToggle = async (id: number) => {
    try {
      const res = await adminApi.toggleDisableUrl(id);
      setUrls((prev) => prev.map((u) => u.id === id ? { ...u, active: res.data.data?.active } : u));
    } catch { toast.error('Failed to toggle URL'); }
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Permanently delete /${code}?`)) return;
    try {
      await adminApi.deleteUrl(id);
      setUrls((prev) => prev.filter((u) => u.id !== id));
      toast.success('URL deleted');
    } catch { toast.error('Failed to delete URL'); }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f0f0f5' }}>URL Management</h1>
        <p style={{ color: '#8888aa', fontSize: '14px' }}>{total} URLs total</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div style={{ width: 32, height: 32, border: '3px solid rgba(108,99,255,0.2)', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {urls.map((url) => (
            <div key={url.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${url.suspicious ? 'rgba(255,107,107,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ color: '#f0f0f5', fontWeight: 600, fontSize: '14px' }}>/{url.shortCode}</span>
                  {url.suspicious && <span style={{ padding: '1px 6px', background: 'rgba(255,107,107,0.15)', color: '#ff6b6b', borderRadius: 4, fontSize: '11px' }}>⚠ Suspicious</span>}
                  <span style={{ padding: '2px 7px', borderRadius: 20, fontSize: '11px', background: url.active ? 'rgba(0,212,170,0.1)' : 'rgba(255,107,107,0.1)', color: url.active ? '#00d4aa' : '#ff6b6b' }}>{url.active ? 'Active' : 'Disabled'}</span>
                </div>
                <p style={{ color: '#555566', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '350px' }}>{url.originalUrl}</p>
                <p style={{ color: '#555566', fontSize: '11px' }}>User ID: {url.userId || 'Guest'} · 👆 {url.totalClicks} · {new Date(url.createdAt).toLocaleDateString()}</p>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleToggle(url.id)} style={{ padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: '12px', background: url.active ? 'rgba(255,107,107,0.1)' : 'rgba(0,212,170,0.1)', color: url.active ? '#ff6b6b' : '#00d4aa' }}>{url.active ? 'Disable' : 'Enable'}</button>
                <button onClick={() => handleDelete(url.id, url.shortCode)} style={{ padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: '12px', background: 'rgba(255,107,107,0.1)', color: '#ff6b6b' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > size && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
          <button disabled={page === 0} onClick={() => setPage(page - 1)} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: page === 0 ? '#555566' : '#f0f0f5', cursor: page === 0 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>← Prev</button>
          <span style={{ padding: '8px 16px', color: '#8888aa', fontSize: '14px' }}>{page + 1} / {Math.ceil(total / size)}</span>
          <button disabled={(page + 1) * size >= total} onClick={() => setPage(page + 1)} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: (page + 1) * size >= total ? '#555566' : '#f0f0f5', cursor: (page + 1) * size >= total ? 'not-allowed' : 'pointer', fontSize: '14px' }}>Next →</button>
        </div>
      )}
    </div>
  );
}
