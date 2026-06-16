import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { urlApi } from '../../api/urlApi';
import { toast } from '../../store/useToastStore';

interface UrlItem { id: number; shortCode: string; shortUrl: string; originalUrl: string; title: string; totalClicks: number; uniqueClicks: number; active: boolean; passwordProtected: boolean; expiryDate: string | null; createdAt: string; }

export default function MyUrlsPage() {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const navigate = useNavigate();
  const size = 10;

  const loadUrls = () => {
    setLoading(true);
    urlApi.list({ page, size, search: search || undefined, status: status || undefined })
      .then((res) => {
        setUrls(res.data.data?.content || []);
        setTotal(res.data.data?.totalElements || 0);
      })
      .catch(() => toast.error('Failed to load URLs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUrls(); }, [page, status]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(0); loadUrls(); };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this URL?')) return;
    setDeletingId(id);
    try {
      await urlApi.delete(id);
      toast.success('URL deleted');
      loadUrls();
    } catch { toast.error('Failed to delete URL'); }
    finally { setDeletingId(null); }
  };

  const copyUrl = (url: string) => { navigator.clipboard.writeText(url); toast.success('Copied!'); };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f0f0f5' }}>My URLs</h1>
          <p style={{ color: '#8888aa', fontSize: '14px' }}>{total} URLs total</p>
        </div>
        <button onClick={() => navigate('/urls/new')} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>✚ Create URL</button>
      </div>

      {/* Search + Filter */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or URL..."
          style={{ flex: 1, minWidth: '200px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none' }}
        />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none' }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="submit" style={{ padding: '10px 20px', background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.25)', borderRadius: '10px', color: '#7d75ff', fontSize: '14px', cursor: 'pointer' }}>Search</button>
      </form>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div style={{ width: 32, height: 32, border: '3px solid rgba(108,99,255,0.2)', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>
      ) : urls.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '16px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔗</div>
          <p style={{ color: '#8888aa' }}>No URLs found. Create your first one!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {urls.map((url) => (
            <div key={url.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ color: '#f0f0f5', fontWeight: 600, fontSize: '15px' }}>{url.title || url.shortCode}</span>
                    {url.passwordProtected && <span title="Password protected" style={{ fontSize: '12px' }}>🔒</span>}
                    {url.expiryDate && new Date(url.expiryDate) < new Date() && <span style={{ padding: '1px 6px', background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', borderRadius: 4, fontSize: '11px' }}>EXPIRED</span>}
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: '11px', background: url.active ? 'rgba(0,212,170,0.1)' : 'rgba(255,107,107,0.1)', color: url.active ? '#00d4aa' : '#ff6b6b', border: `1px solid ${url.active ? 'rgba(0,212,170,0.2)' : 'rgba(255,107,107,0.2)'}` }}>{url.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p style={{ color: '#6c63ff', fontSize: '13px', marginBottom: '2px' }}>{url.shortUrl}</p>
                  <p style={{ color: '#555566', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '400px' }}>{url.originalUrl}</p>
                  <p style={{ color: '#555566', fontSize: '11px', marginTop: '4px' }}>👆 {url.totalClicks} clicks · 👥 {url.uniqueClicks} unique · {new Date(url.createdAt).toLocaleDateString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button onClick={() => copyUrl(url.shortUrl)} style={{ padding: '6px 12px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '7px', color: '#7d75ff', fontSize: '12px', cursor: 'pointer' }}>Copy</button>
                  <button onClick={() => navigate(`/urls/${url.id}/analytics`)} style={{ padding: '6px 12px', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '7px', color: '#00d4aa', fontSize: '12px', cursor: 'pointer' }}>Stats</button>
                  <button onClick={() => navigate(`/urls/${url.id}/edit`)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '7px', color: '#8888aa', fontSize: '12px', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(url.id)} disabled={deletingId === url.id} style={{ padding: '6px 12px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: '7px', color: '#ff6b6b', fontSize: '12px', cursor: 'pointer', opacity: deletingId === url.id ? 0.7 : 1 }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
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
