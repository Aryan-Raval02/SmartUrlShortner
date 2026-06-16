export default function DisabledPage() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '96px' }}>🚫</div>
      <h1 style={{ fontSize: '52px', fontWeight: 900, color: '#ff6b6b' }}>Link Disabled</h1>
      <p style={{ fontSize: '18px', color: '#f0f0f5' }}>This link has been disabled</p>
      <p style={{ color: '#8888aa', maxWidth: '400px' }}>The owner has temporarily disabled this short URL. Please contact them for more information.</p>
      <a href="/" style={{ marginTop: '8px', padding: '12px 28px', background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', borderRadius: 12, color: '#fff', fontWeight: 600 }}>Go to Homepage</a>
    </div>
  );
}
