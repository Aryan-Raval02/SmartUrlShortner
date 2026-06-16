import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { toast } from '../../store/useToastStore';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard()
      .then((res) => setStats(res.data.data))
      .catch(() => toast.error('Failed to load admin stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div style={{ width: 36, height: 36, border: '3px solid rgba(255,179,71,0.2)', borderTopColor: '#ffb347', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f0f0f5', marginBottom: '6px' }}>🛡 Admin Dashboard</h1>
        <p style={{ color: '#8888aa' }}>Platform-wide statistics and management</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: '#6c63ff' },
          { label: 'Total URLs', value: stats?.totalUrls || 0, icon: '🔗', color: '#00d4aa' },
          { label: 'Total Clicks', value: stats?.totalClicks || 0, icon: '👆', color: '#ffb347' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px', display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
            <div><div style={{ color: '#8888aa', fontSize: 12 }}>{s.label}</div><div style={{ color: '#f0f0f5', fontSize: 24, fontWeight: 700 }}>{s.value.toLocaleString()}</div></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {[
          { label: 'Manage Users', desc: 'View, block, and manage user accounts', path: '/admin/users', icon: '👥', color: '#6c63ff' },
          { label: 'Manage URLs', desc: 'View, disable, and delete all URLs', path: '/admin/urls', icon: '🔗', color: '#00d4aa' },
        ].map((card) => (
          <a key={card.path} href={card.path} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px', textDecoration: 'none', display: 'flex', gap: '16px', alignItems: 'center', transition: 'border-color 200ms' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: `${card.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{card.icon}</div>
            <div>
              <p style={{ color: '#f0f0f5', fontWeight: 600, marginBottom: '4px' }}>{card.label}</p>
              <p style={{ color: '#8888aa', fontSize: '13px' }}>{card.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
