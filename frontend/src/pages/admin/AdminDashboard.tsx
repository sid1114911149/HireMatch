import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Users, Briefcase, ClipboardList, TrendingUp, BarChart3, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface Stats { totalUsers: number; candidates: number; recruiters: number; totalJobs: number; activeJobs: number; totalApplications: number; selectedApps: number; placementRate: number }

const COLORS = ['#F97316', '#FB923C', '#10B981', '#FBBF24', '#F43F5E'];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthlyUsers, setMonthlyUsers] = useState<{ _id: { year: number; month: number }; count: number }[]>([]);
  const [recentUsers, setRecentUsers] = useState<{ _id: string; name: string; email: string; role: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => {
      setStats(r.data.stats);
      setMonthlyUsers(r.data.monthlyUsers || []);
      setRecentUsers(r.data.recentUsers || []);
    }).catch(() => toast.error('Failed to load stats')).finally(() => setLoading(false));
  }, []);

  const monthlyData = monthlyUsers.map(m => ({
    name: new Date(m._id.year, m._id.month - 1).toLocaleString('default', { month: 'short' }),
    users: m.count,
  }));

  const pieData = stats ? [
    { name: 'Candidates', value: stats.candidates },
    { name: 'Recruiters', value: stats.recruiters },
    { name: 'Selected', value: stats.selectedApps },
  ] : [];

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#F97316', sub: `${stats.candidates} candidates, ${stats.recruiters} recruiters` },
    { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: '#FB923C', sub: `${stats.activeJobs} active` },
    { label: 'Applications', value: stats.totalApplications, icon: ClipboardList, color: '#10B981', sub: `${stats.selectedApps} selected` },
    { label: 'Placement Rate', value: `${stats.placementRate}%`, icon: TrendingUp, color: '#FBBF24', sub: 'Of all applications' },
  ] : [];

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Platform overview and analytics">
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />) :
          statCards.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: `${s.color}18` }}><s.icon size={22} color={s.color} /></div>
              <div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.sub}</div>
              </div>
            </div>
          ))
        }
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Monthly Growth */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--accent-blue)" /> New Users (Monthly)
          </h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1A1208', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 8, color: 'white' }} />
                <Bar dataKey="users" fill="url(#colorGrad)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F97316" stopOpacity={1} />
                    <stop offset="100%" stopColor="#FBBF24" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '2rem', height: 200 }}>
              <BarChart3 size={32} color="var(--text-muted)" />
              <p>No data yet</p>
            </div>
          )}
        </div>

        {/* User distribution */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="var(--accent-violet)" /> Platform Distribution
          </h3>
          {pieData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <PieChart width={160} height={160}>
                <Pie data={pieData} cx={75} cy={75} innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
              </PieChart>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {pieData.map((item, i) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i] }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.name}</span>
                    <span style={{ fontWeight: 700, marginLeft: 'auto' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div className="empty-state" style={{ padding: '2rem', height: 160 }}><p>No data</p></div>}
        </div>
      </div>

      {/* Recent Users */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700 }}>Recent Registrations</h3>
          <a href="/admin/users" style={{ fontSize: '0.82rem', color: 'var(--accent-blue)' }}>View all →</a>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
            <tbody>
              {recentUsers.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${u.role === 'CANDIDATE' ? 'badge-blue' : u.role === 'RECRUITER' ? 'badge-violet' : 'badge-amber'}`}>{u.role}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};
