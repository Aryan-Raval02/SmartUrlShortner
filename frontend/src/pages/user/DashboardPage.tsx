import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsApi } from '../../api/analyticsApi';
import { urlApi } from '../../api/urlApi';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from '../../store/useToastStore';

interface DashboardStats { totalUrls: number; activeUrls: number; totalClicks: number; uniqueClicks: number; }
interface RecentUrl { id: number; shortCode: string; shortUrl: string; originalUrl: string; title: string; totalClicks: number; active: boolean; createdAt: string; }

const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>{icon}</div>
    <div>
      <div style={{ color: '#8888aa', fontSize: '13px', marginBottom: '4px' }}>{title}</div>
      <div style={{ color: '#f0f0f5', fontSize: '24px', fontWeight: 700 }}>{value.toLocaleString()}</div>
    </div>
  </div>
);

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUrls, setRecentUrls] = useState<RecentUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([analyticsApi.getDashboard(), urlApi.list({ size: 5 })])
      .then(([dashRes, urlRes]) => {
        setStats(dashRes.data.data);
        setRecentUrls(urlRes.data.data?.content || []);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div style={{ width: 36, height: 36, border: '3px solid rgba(108,99,255,0.2)', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#f0f0f5', marginBottom: '6px' }}>Welcome back, {user?.fullName?.split(' ')[0]} 👋</h1>
        <p style={{ color: '#8888aa' }}>Here's what's happening with your links today.</p>
      </div>

      {!user?.emailVerified && (
        <div style={{ background: 'rgba(255,179,71,0.1)', border: '1px solid rgba(255,179,71,0.25)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <p style={{ color: '#ffb347', fontWeight: 600, fontSize: '14px' }}>Email not verified</p>
            <p style={{ color: '#8888aa', fontSize: '13px' }}>Please verify your email to unlock all features.</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard title="Total URLs" value={stats?.totalUrls || 0} icon="🔗" color="#6c63ff" />
        <StatCard title="Active URLs" value={stats?.activeUrls || 0} icon="✅" color="#00d4aa" />
        <StatCard title="Total Clicks" value={stats?.totalClicks || 0} icon="👆" color="#7d75ff" />
        <StatCard title="Unique Clicks" value={stats?.uniqueClicks || 0} icon="👥" color="#ff6b6b" />
      </div>

      {/* Quick Create */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/urls/new')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
        >
          ✚ Create Short URL
        </button>
        <button
          onClick={() => navigate('/urls')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#f0f0f5', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}
        >
          🔗 View All URLs
        </button>
      </div>

      {/* Recent URLs */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f0f0f5', marginBottom: '16px' }}>Recent URLs</h2>
        {recentUrls.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔗</div>
            <p style={{ color: '#8888aa' }}>No URLs yet. Create your first one!</p>
            <button onClick={() => navigate('/urls/new')} style={{ marginTop: '16px', padding: '10px 20px', background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>Create URL</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentUrls.map((url) => (
              <div key={url.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <p style={{ color: '#f0f0f5', fontWeight: 500, marginBottom: '2px', fontSize: '14px' }}>{url.title || url.shortCode}</p>
                  <p style={{ color: '#6c63ff', fontSize: '13px' }}>{url.shortUrl}</p>
                  <p style={{ color: '#555566', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>{url.originalUrl}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#8888aa', fontSize: '13px' }}>👆 {url.totalClicks}</span>
                  <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '12px', background: url.active ? 'rgba(0,212,170,0.1)' : 'rgba(255,107,107,0.1)', color: url.active ? '#00d4aa' : '#ff6b6b', border: `1px solid ${url.active ? 'rgba(0,212,170,0.2)' : 'rgba(255,107,107,0.2)'}` }}>{url.active ? 'Active' : 'Inactive'}</span>
                  <button onClick={() => copyToClipboard(url.shortUrl)} style={{ padding: '6px 12px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '6px', color: '#7d75ff', fontSize: '12px', cursor: 'pointer' }}>Copy</button>
                  <button onClick={() => navigate(`/urls/${url.id}/analytics`)} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#8888aa', fontSize: '12px', cursor: 'pointer' }}>Stats</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
