export default function ExpiredPage() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '96px' }}>⏰</div>
      <h1 style={{ fontSize: '52px', fontWeight: 900, color: '#ffb347' }}>Link Expired</h1>
      <p style={{ fontSize: '18px', color: '#f0f0f5' }}>This short URL has passed its expiry date</p>
      <p style={{ color: '#8888aa', maxWidth: '400px' }}>The owner set an expiration time on this link and it is no longer active.</p>
      <a href="/" style={{ marginTop: '8px', padding: '12px 28px', background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', borderRadius: 12, color: '#fff', fontWeight: 600 }}>Create your own short URLs</a>
    </div>
  );
}
