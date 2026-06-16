import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyticsApi } from '../../api/analyticsApi';
import { urlApi } from '../../api/urlApi';
import { toast } from '../../store/useToastStore';

interface StatItem { name: string; count: number; percentage: number; }
interface Analytics { totalClicks: number; uniqueClicks: number; topBrowsers: StatItem[]; topDevices: StatItem[]; topCountries: { country: string; city: string; count: number }[]; referrers: StatItem[]; dailyClicks: { date: string; clicks: number }[]; }
interface UrlInfo { shortUrl: string; title: string; shortCode: string; }

const StatBar = ({ name, count, percentage }: StatItem) => (
  <div style={{ marginBottom: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
      <span style={{ color: '#f0f0f5', fontSize: '13px' }}>{name || 'Unknown'}</span>
      <span style={{ color: '#8888aa', fontSize: '13px' }}>{count} ({percentage}%)</span>
    </div>
    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${percentage}%`, background: 'linear-gradient(90deg, #6c63ff, #00d4aa)', borderRadius: 3, transition: 'width 0.6s ease' }} />
    </div>
  </div>
);

export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [urlInfo, setUrlInfo] = useState<UrlInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.getAnalytics(Number(id)), urlApi.getById(Number(id))])
      .then(([analyticsRes, urlRes]) => {
        setAnalytics(analyticsRes.data.data);
        const d = urlRes.data.data;
        setUrlInfo({ shortUrl: d.shortUrl, title: d.title || d.shortCode, shortCode: d.shortCode });
      })
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div style={{ width: 36, height: 36, border: '3px solid rgba(108,99,255,0.2)', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>;
  if (!analytics) return <div style={{ color: '#ff6b6b', textAlign: 'center', padding: '40px' }}>Failed to load analytics</div>;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: '28px' }}>
        <button onClick={() => navigate('/urls')} style={{ background: 'none', border: 'none', color: '#8888aa', cursor: 'pointer', fontSize: '14px', marginBottom: '8px' }}>← Back to My URLs</button>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f0f0f5', marginBottom: '4px' }}>Analytics</h1>
        {urlInfo && <p style={{ color: '#6c63ff', fontSize: '14px' }}>{urlInfo.shortUrl} · {urlInfo.title}</p>}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Clicks', value: analytics.totalClicks, icon: '👆', color: '#6c63ff' },
          { label: 'Unique Clicks', value: analytics.uniqueClicks, icon: '👥', color: '#00d4aa' },
        ].map((s) => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px', display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${s.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
            <div><div style={{ color: '#8888aa', fontSize: 12 }}>{s.label}</div><div style={{ color: '#f0f0f5', fontSize: 24, fontWeight: 700 }}>{s.value.toLocaleString()}</div></div>
          </div>
        ))}
      </div>

      {/* Daily clicks chart (simple bar) */}
      {analytics.dailyClicks.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ color: '#f0f0f5', fontWeight: 600, marginBottom: '20px' }}>Daily Clicks (Last 30 Days)</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100px', overflowX: 'auto' }}>
            {analytics.dailyClicks.map((d) => {
              const maxClicks = Math.max(...analytics.dailyClicks.map((x) => x.clicks));
              const height = maxClicks > 0 ? (d.clicks / maxClicks) * 100 : 0;
              return (
                <div key={d.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '24px' }} title={`${d.date}: ${d.clicks} clicks`}>
                  <div style={{ width: '20px', height: `${height}%`, minHeight: d.clicks > 0 ? '4px' : '1px', background: 'linear-gradient(180deg, #6c63ff, #00d4aa)', borderRadius: '3px 3px 0 0' }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Breakdown grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {[
          { title: '🌐 Browsers', data: analytics.topBrowsers },
          { title: '📱 Devices', data: analytics.topDevices },
          { title: '🔗 Referrers', data: analytics.referrers },
        ].map(({ title, data }) => (
          <div key={title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px' }}>
            <h3 style={{ color: '#f0f0f5', fontWeight: 600, marginBottom: '16px' }}>{title}</h3>
            {data.length === 0 ? <p style={{ color: '#555566', fontSize: 13 }}>No data yet</p> : data.slice(0, 5).map((s) => <StatBar key={s.name} {...s} />)}
          </div>
        ))}

        {/* Countries */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px' }}>
          <h3 style={{ color: '#f0f0f5', fontWeight: 600, marginBottom: '16px' }}>🌍 Top Countries</h3>
          {analytics.topCountries.length === 0 ? <p style={{ color: '#555566', fontSize: 13 }}>No data yet</p> : analytics.topCountries.slice(0, 5).map((c) => (
            <div key={`${c.country}-${c.city}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#f0f0f5', fontSize: 13 }}>{c.country} {c.city ? `· ${c.city}` : ''}</span>
              <span style={{ color: '#8888aa', fontSize: 13 }}>{c.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
