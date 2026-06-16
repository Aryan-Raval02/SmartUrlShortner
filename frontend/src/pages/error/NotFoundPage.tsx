export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '96px', lineHeight: 1 }}>🔍</div>
      <h1 style={{ fontSize: '72px', fontWeight: 900, background: 'linear-gradient(135deg, #6c63ff, #00d4aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1>
      <p style={{ fontSize: '22px', fontWeight: 600, color: '#f0f0f5' }}>Link not found</p>
      <p style={{ color: '#8888aa', maxWidth: '400px' }}>This short URL doesn't exist or may have been removed. Double-check the link and try again.</p>
      <a href="/" style={{ marginTop: '8px', padding: '12px 28px', background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: '15px' }}>Go to Homepage</a>
    </div>
  );
}
