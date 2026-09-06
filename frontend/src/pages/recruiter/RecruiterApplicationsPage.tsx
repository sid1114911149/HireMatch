import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { ChevronDown, CheckCircle, AlertCircle, Clock, User } from 'lucide-react';

interface Application {
  _id: string;
  candidateId: { _id: string; name: string; email: string; profile?: { skills?: string[] } };
  jobId: { _id: string; title: string; company: string };
  resumeId: { score?: { overall: number } };
  status: string;
  matchScore: number;
  createdAt: string;
  timeline: { status: string; note: string; updatedAt: string }[];
}

const STATUS_OPTIONS = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

export const RecruiterApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    api.get('/applications').then(r => setApplications(r.data.applications || [])).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (appId: string, status: string) => {
    setUpdating(appId);
    try {
      const res = await api.put(`/applications/${appId}/status`, { status });
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
      if (selected?._id === appId) setSelected(prev => prev ? { ...prev, status } : null);
      toast.success(`Status updated to ${status}`);
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(null); }
  };

  const filtered = statusFilter ? applications.filter(a => a.status === statusFilter) : applications;
  const scoreColor = (s: number) => s >= 75 ? '#34D399' : s >= 50 ? '#FCD34D' : '#FB7185';

  return (
    <DashboardLayout title="Applications" subtitle="Review and manage candidate applications">
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {['', ...STATUS_OPTIONS].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-secondary'} btn-sm`}>{s || 'All'}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* List */}
        <div>
          {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 'var(--radius-lg)', marginBottom: '0.75rem' }} />) :
            filtered.length === 0 ? (
              <div className="empty-state card"><div className="empty-state-icon"><User size={24} /></div><p>No applications found</p></div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Candidate</th><th>Job</th><th>Match Score</th><th>Status</th><th>Applied</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filtered.map(app => (
                      <tr key={app._id} onClick={() => setSelected(app)} style={{ cursor: 'pointer', background: selected?._id === app._id ? 'rgba(59,130,246,0.05)' : '' }}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.candidateId?.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.candidateId?.email}</div>
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>{app.jobId?.title}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: scoreColor(app.matchScore) }}>{app.matchScore}%</span>
                        </td>
                        <td><span className={`status-badge status-${app.status.replace(' ', '-')}`}>{app.status}</span></td>
                        <td style={{ fontSize: '0.78rem' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td>
                          <select
                            value={app.status}
                            className="form-input"
                            style={{ width: 'auto', fontSize: '0.78rem', padding: '0.35rem 0.5rem' }}
                            onChange={e => { e.stopPropagation(); updateStatus(app._id, e.target.value); }}
                            onClick={e => e.stopPropagation()}
                            disabled={updating === app._id}
                          >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>

        {/* Candidate Detail */}
        {selected && (
          <div className="card" style={{ position: 'sticky', top: '5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', fontSize: '1.25rem', fontWeight: 800 }}>
                {selected.candidateId?.name?.charAt(0)}
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selected.candidateId?.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{selected.candidateId?.email}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>For: {selected.jobId?.title}</span>
              <span style={{ fontWeight: 800, color: scoreColor(selected.matchScore) }}>{selected.matchScore}% Match</span>
            </div>

            {selected.candidateId?.profile?.skills?.length ? (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>SKILLS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {selected.candidateId.profile.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
                </div>
              </div>
            ) : null}

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>CHANGE STATUS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                {STATUS_OPTIONS.map(s => (
                  <button key={s} onClick={() => updateStatus(selected._id, s)}
                    className={`btn btn-sm ${selected.status === s ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ justifyContent: 'center', fontSize: '0.78rem' }}
                    disabled={updating === selected._id}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
