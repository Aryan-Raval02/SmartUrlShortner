import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/authApi';
import { toast } from '../../store/useToastStore';
import { useState } from 'react';

interface LayoutProps {
  showSidebar?: boolean;
  isAdmin?: boolean;
}

const userNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '◉' },
  { path: '/urls', label: 'My URLs', icon: '🔗' },
  { path: '/urls/new', label: 'Create URL', icon: '✚' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

const adminNavItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '◉' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/admin/urls', label: 'All URLs', icon: '🔗' },
];

const Layout = ({ showSidebar = false, isAdmin = false }: LayoutProps) => {
  const { user, refreshToken, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const handleLogout = async () => {
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch (_) {}
    clearAuth();
    toast.info('Logged out successfully');
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 24px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6c63ff, #00d4aa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 700, color: '#fff',
          }}>S</div>
          <span style={{ fontWeight: 700, fontSize: '18px', color: '#f0f0f5' }}>Shortly</span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <>
              <span style={{ fontSize: '14px', color: '#8888aa' }}>Hi, {user.fullName || user.username}</span>
              {user.role === 'ADMIN' && (
                <a href="/admin/dashboard" style={{ fontSize: '13px', color: '#ffb347', fontWeight: 500, padding: '4px 10px', border: '1px solid rgba(255,179,71,0.3)', borderRadius: 6 }}>Admin Panel</a>
              )}
              <button
                onClick={handleLogout}
                style={{ fontSize: '13px', color: '#ff6b6b', padding: '6px 14px', border: '1px solid rgba(255,107,107,0.25)', borderRadius: 8, background: 'rgba(255,107,107,0.1)', cursor: 'pointer' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" style={{ fontSize: '14px', color: '#8888aa' }}>Log in</a>
              <a href="/register" style={{
                fontSize: '14px', fontWeight: 600, color: '#fff', padding: '8px 20px',
                background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', borderRadius: 10,
              }}>Get started</a>
            </>
          )}
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        {showSidebar && (
          <aside style={{
            width: 240, minHeight: 'calc(100vh - 64px)',
            background: 'var(--color-surface)',
            borderRight: '1px solid var(--color-border)',
            padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '4px',
            position: 'sticky', top: 64, height: 'calc(100vh - 64px)', overflowY: 'auto',
          }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px', borderRadius: 10,
                    color: isActive ? '#6c63ff' : '#8888aa',
                    background: isActive ? 'rgba(108,99,255,0.1)' : 'transparent',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '14px',
                    textDecoration: 'none',
                    transition: 'all 200ms ease',
                    border: isActive ? '1px solid rgba(108,99,255,0.2)' : '1px solid transparent',
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </NavLink>
              );
            })}
          </aside>
        )}

        {/* Main Content */}
        <main style={{ flex: 1, padding: showSidebar ? '32px 40px' : '0', maxWidth: showSidebar ? 'calc(100% - 240px)' : '100%', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>

      {/* Footer — only on public pages */}
      {!showSidebar && (
        <footer style={{
          borderTop: '1px solid var(--color-border)', padding: '24px',
          textAlign: 'center', color: '#555566', fontSize: '14px',
        }}>
          © {new Date().getFullYear()} Shortly. All rights reserved.
        </footer>
      )}
    </div>
  );
};

export default Layout;
