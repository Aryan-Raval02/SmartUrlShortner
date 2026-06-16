import { useState, useRef } from 'react';
import { userApi } from '../../api/userApi';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from '../../store/useToastStore';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'sessions' | 'danger'>('profile');
  const [profileForm, setProfileForm] = useState({ fullName: user?.fullName || '', username: user?.username || '', phoneNumber: user?.phoneNumber || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await userApi.updateProfile(profileForm);
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await userApi.changePassword(pwForm);
      toast.success('Password changed! Please log in again.');
      setTimeout(() => { clearAuth(); window.location.href = '/login'; }, 2000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Password change failed');
    } finally { setLoading(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await userApi.uploadAvatar(file);
      updateUser({ avatarUrl: res.data.data?.avatarUrl });
      toast.success('Avatar updated!');
    } catch { toast.error('Avatar upload failed'); }
  };

  const loadSessions = async () => {
    setActiveTab('sessions');
    try {
      const res = await userApi.getSessions();
      setSessions(res.data.data || []);
    } catch { toast.error('Failed to load sessions'); }
  };

  const revokeSession = async (sessionId: number) => {
    try {
      await userApi.revokeSession(sessionId);
      setSessions((s) => s.filter((sess) => sess.id !== sessionId));
      toast.success('Session revoked');
    } catch { toast.error('Failed to revoke session'); }
  };

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'password', label: 'Password' },
    { key: 'sessions', label: 'Sessions' },
    { key: 'danger', label: 'Danger Zone' },
  ];

  return (
    <div style={{ maxWidth: '700px', animation: 'fadeIn 0.4s ease' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f0f0f5', marginBottom: '24px' }}>Account Settings</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '4px', marginBottom: '28px', width: 'fit-content' }}>
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => tab.key === 'sessions' ? loadSessions() : setActiveTab(tab.key as any)} style={{ padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 500, background: activeTab === tab.key ? (tab.key === 'danger' ? 'rgba(255,107,107,0.15)' : 'rgba(108,99,255,0.2)') : 'transparent', color: activeTab === tab.key ? (tab.key === 'danger' ? '#ff6b6b' : '#7d75ff') : '#8888aa', transition: 'all 200ms' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 }}>
            <div onClick={() => fileRef.current?.click()} style={{ width: 72, height: 72, borderRadius: '50%', background: user?.avatarUrl ? 'none' : 'linear-gradient(135deg, #6c63ff, #00d4aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#fff', cursor: 'pointer', overflow: 'hidden', border: '2px solid rgba(108,99,255,0.3)' }}>
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.fullName?.[0] || 'U')}
            </div>
            <div>
              <p style={{ color: '#f0f0f5', fontWeight: 600, marginBottom: '4px' }}>{user?.fullName}</p>
              <p style={{ color: '#8888aa', fontSize: '13px', marginBottom: '8px' }}>{user?.email}</p>
              <button onClick={() => fileRef.current?.click()} style={{ padding: '6px 14px', background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 8, color: '#7d75ff', fontSize: '13px', cursor: 'pointer' }}>Change avatar</button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            </div>
          </div>

          <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px' }}>
            {(['fullName', 'username', 'phoneNumber'] as const).map((key) => (
              <div key={key}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8888aa' }}>{key === 'fullName' ? 'Full Name' : key === 'username' ? 'Username' : 'Phone Number'}</label>
                <input value={profileForm[key]} onChange={(e) => setProfileForm((f) => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none' }} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8888aa' }}>Email</label>
              <input value={user?.email || ''} disabled style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 14px', color: '#555566', fontSize: '14px', outline: 'none', cursor: 'not-allowed' }} />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '12px', background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px' }}>
          {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((key) => (
            <div key={key}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#8888aa' }}>{key === 'currentPassword' ? 'Current Password' : key === 'newPassword' ? 'New Password' : 'Confirm Password'}</label>
              <input type="password" value={pwForm[key]} onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', color: '#f0f0f5', fontSize: '14px', outline: 'none' }} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ padding: '12px', background: 'linear-gradient(135deg, #6c63ff, #7d75ff)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ color: '#8888aa', fontSize: '14px', marginBottom: '8px' }}>These are the devices currently signed into your account.</p>
          {sessions.length === 0 ? <p style={{ color: '#555566' }}>No active sessions found.</p> : sessions.map((s) => (
            <div key={s.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <p style={{ color: '#f0f0f5', fontSize: '14px', fontWeight: 500 }}>{s.isCurrent ? '🟢 Current Session' : '💻 ' + (s.deviceInfo || 'Unknown device').substring(0, 40)}</p>
                <p style={{ color: '#555566', fontSize: '12px' }}>IP: {s.ipAddress || 'Unknown'} · {new Date(s.createdAt).toLocaleDateString()}</p>
              </div>
              {!s.isCurrent && <button onClick={() => revokeSession(s.id)} style={{ padding: '6px 14px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 8, color: '#ff6b6b', fontSize: '13px', cursor: 'pointer' }}>Revoke</button>}
            </div>
          ))}
        </div>
      )}

      {/* Danger Zone */}
      {activeTab === 'danger' && (
        <div style={{ background: 'rgba(255,107,107,0.05)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 16, padding: '24px' }}>
          <h3 style={{ color: '#ff6b6b', fontWeight: 700, marginBottom: '8px' }}>⚠ Danger Zone</h3>
          <p style={{ color: '#8888aa', fontSize: '14px', marginBottom: '20px' }}>These actions are irreversible. Please be careful.</p>
          <button
            onClick={() => {
              const pw = prompt('Enter your password to confirm account deletion:');
              if (pw) {
                userApi.deleteAccount(pw).then(() => { toast.success('Account deleted'); clearAuth(); window.location.href = '/'; }).catch(() => toast.error('Deletion failed. Check password.'));
              }
            }}
            style={{ padding: '12px 24px', background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: 10, color: '#ff6b6b', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
          >
            Delete My Account
          </button>
        </div>
      )}
    </div>
  );
}
