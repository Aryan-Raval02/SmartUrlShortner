import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { toast } from '../../store/useToastStore';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const size = 20;

  const loadUsers = () => {
    setLoading(true);
    adminApi.listUsers(page, size)
      .then((res) => { setUsers(res.data.data?.content || []); setTotal(res.data.data?.totalElements || 0); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, [page]);

  const handleToggleBlock = async (id: number) => {
    try {
      const res = await adminApi.toggleBlockUser(id);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: res.data.data?.status } : u));
      toast.success('User status updated');
    } catch { toast.error('Failed to update user'); }
  };

  const handleRoleChange = async (id: number, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`Change role to ${newRole}?`)) return;
    try {
      const res = await adminApi.changeUserRole(id, newRole);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: res.data.data?.role } : u));
      toast.success('Role updated');
    } catch { toast.error('Failed to change role'); }
  };

  const handleDelete = async (id: number, email: string) => {
    if (!confirm(`Permanently delete user ${email}? This cannot be undone.`)) return;
    try {
      await adminApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#f0f0f5' }}>User Management</h1>
        <p style={{ color: '#8888aa', fontSize: '14px' }}>{total} users total</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div style={{ width: 32, height: 32, border: '3px solid rgba(108,99,255,0.2)', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /></div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['User', 'Role', 'Status', 'Verified', 'Joined', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: '#8888aa', fontSize: '13px', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ color: '#f0f0f5', fontWeight: 500, fontSize: '14px' }}>{user.fullName || 'N/A'}</p>
                    <p style={{ color: '#8888aa', fontSize: '12px' }}>{user.email}</p>
                    <p style={{ color: '#555566', fontSize: '11px' }}>@{user.username}</p>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: '12px', background: user.role === 'ADMIN' ? 'rgba(255,179,71,0.15)' : 'rgba(108,99,255,0.1)', color: user.role === 'ADMIN' ? '#ffb347' : '#7d75ff', border: `1px solid ${user.role === 'ADMIN' ? 'rgba(255,179,71,0.2)' : 'rgba(108,99,255,0.2)'}` }}>{user.role}</span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: '12px', background: user.status === 'ACTIVE' ? 'rgba(0,212,170,0.1)' : 'rgba(255,107,107,0.1)', color: user.status === 'ACTIVE' ? '#00d4aa' : '#ff6b6b', border: `1px solid ${user.status === 'ACTIVE' ? 'rgba(0,212,170,0.2)' : 'rgba(255,107,107,0.2)'}` }}>{user.status}</span>
                  </td>
                  <td style={{ padding: '14px 16px', color: user.emailVerified ? '#00d4aa' : '#ff6b6b', fontSize: '14px' }}>{user.emailVerified ? '✓' : '✕'}</td>
                  <td style={{ padding: '14px 16px', color: '#8888aa', fontSize: '13px' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button onClick={() => handleToggleBlock(user.id)} style={{ padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: '12px', background: user.status === 'BLOCKED' ? 'rgba(0,212,170,0.1)' : 'rgba(255,107,107,0.1)', color: user.status === 'BLOCKED' ? '#00d4aa' : '#ff6b6b' }}>{user.status === 'BLOCKED' ? 'Unblock' : 'Block'}</button>
                      <button onClick={() => handleRoleChange(user.id, user.role)} style={{ padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: '12px', background: 'rgba(255,179,71,0.1)', color: '#ffb347' }}>{user.role === 'ADMIN' ? '→ User' : '→ Admin'}</button>
                      <button onClick={() => handleDelete(user.id, user.email)} style={{ padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: '12px', background: 'rgba(255,107,107,0.1)', color: '#ff6b6b' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
