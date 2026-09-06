import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Search, ToggleLeft, ToggleRight } from 'lucide-react';

interface User { _id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string; lastLogin?: string }

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (roleFilter) params.append('role', roleFilter);
    setLoading(true);
    api.get(`/admin/users?${params}`).then(r => setUsers(r.data.users || [])).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }, [search, roleFilter]);

  const toggleUser = async (user: User) => {
    try {
      await api.put(`/admin/users/${user._id}/toggle`);
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
    } catch { toast.error('Failed'); }
  };

  return (
    <DashboardLayout title="User Management" subtitle="Manage all platform users">
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" value={search} placeholder="Search by name or email..." className="form-input" style={{ paddingLeft: '2.5rem' }} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={roleFilter} className="form-input" style={{ width: 'auto', minWidth: 150 }} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="CANDIDATE">Candidates</option>
          <option value="RECRUITER">Recruiters</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {loading ? (
        Array(5).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }} />)
      ) : (
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Last Login</th><th>Toggle</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role === 'CANDIDATE' ? 'badge-blue' : u.role === 'RECRUITER' ? 'badge-violet' : 'badge-amber'}`}>{u.role}</span></td>
                  <td><span className={`badge ${u.isActive ? 'badge-emerald' : 'badge-rose'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ fontSize: '0.78rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ fontSize: '0.78rem' }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleUser(u)} title={u.isActive ? 'Deactivate' : 'Activate'}>
                      {u.isActive ? <ToggleRight size={20} color="#34D399" /> : <ToggleLeft size={20} color="var(--text-muted)" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="empty-state" style={{ padding: '2rem' }}><p>No users found</p></div>}
        </div>
      )}
    </DashboardLayout>
  );
};
