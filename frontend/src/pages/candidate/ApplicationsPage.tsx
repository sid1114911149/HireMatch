import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { ClipboardList, Clock, CheckCircle, AlertCircle, ChevronRight, Briefcase } from 'lucide-react';

interface Application {
  _id: string;
  jobId: { _id: string; title: string; company: string; location: string; type: string };
  status: string;
  matchScore: number;
  timeline: { status: string; note: string; updatedAt: string }[];
  appliedAt: string;
  createdAt: string;
}

const STATUS_STEPS = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected'];

export const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get('/applications').then(r => {
      setApplications(r.data.applications || []);
    }).catch(() => toast.error('Failed to load applications')).finally(() => setLoading(false));
  }, []);

  const filtered = filter ? applications.filter(a => a.status === filter) : applications;

  const statusIcon = (status: string) => {
    if (status === 'Selected') return <CheckCircle size={14} color="#34D399" />;
    if (status === 'Rejected') return <AlertCircle size={14} color="#FB7185" />;
    return <Clock size={14} color="#FCD34D" />;
  };

  const stepIndex = (status: string) => STATUS_STEPS.indexOf(status);

  return (
    <DashboardLayout title="My Applications" subtitle="Track all your job applications">
      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {['', 'Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`btn ${filter === s ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Application list */}
        <div>
          {loading ? (
            Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)', marginBottom: '0.75rem' }} />)
          ) : filtered.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-state-icon"><ClipboardList size={28} /></div>
              <p>No applications {filter ? `with status "${filter}"` : 'yet'}</p>
              {!filter && <a href="/candidate/jobs" className="btn btn-primary btn-sm">Browse Jobs</a>}
            </div>
          ) : filtered.map(app => (
            <div
              key={app._id}
              className="card"
              style={{
                marginBottom: '0.75rem', cursor: 'pointer', padding: '1.25rem',
                border: selected?._id === app._id ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                background: selected?._id === app._id ? 'rgba(59,130,246,0.04)' : 'var(--bg-card)',
              }}
              onClick={() => setSelected(app)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{app.jobId?.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>{app.jobId?.company} · {app.jobId?.location}</div>

                  {/* Mini progress tracker */}
                  {app.status !== 'Rejected' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {STATUS_STEPS.map((step, i) => (
                        <React.Fragment key={step}>
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                            background: i <= stepIndex(app.status) ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)',
                            transition: 'background 0.3s',
                          }} />
                          {i < STATUS_STEPS.length - 1 && (
                            <div style={{ flex: 1, height: 2, background: i < stepIndex(app.status) ? 'var(--accent-blue)' : 'rgba(255,255,255,0.08)', minWidth: 12 }} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                  <span className={`status-badge status-${app.status.replace(' ', '-')}`}>
                    {statusIcon(app.status)} {app.status}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="card" style={{ position: 'sticky', top: '5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>{selected.jobId?.title}</h3>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{selected.jobId?.company}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span className={`status-badge status-${selected.status.replace(' ', '-')}`}>
                {statusIcon(selected.status)} {selected.status}
              </span>
              {selected.matchScore > 0 && (
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#34D399' }}>{selected.matchScore}% Match</span>
              )}
            </div>

            {/* Full Status Timeline */}
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem' }}>Application Timeline</div>
              <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                <div style={{ position: 'absolute', left: '7px', top: 0, bottom: 0, width: 2, background: 'var(--border-color)' }} />
                {selected.timeline?.map((event, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: '1.25rem' }}>
                    <div style={{
                      position: 'absolute', left: '-1.5rem',
                      width: 16, height: 16, borderRadius: '50%',
                      background: i === 0 ? 'var(--accent-blue)' : 'var(--bg-secondary)',
                      border: '2px solid',
                      borderColor: i === 0 ? 'var(--accent-blue)' : 'var(--border-color)',
                    }} />
                    <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{event.status}</div>
                    {event.note && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{event.note}</div>}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {new Date(event.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
