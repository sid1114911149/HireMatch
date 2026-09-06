import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../lib/api';
import { Briefcase, Users, ClipboardList, TrendingUp, Plus, Eye, PauseCircle, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Job { _id: string; title: string; status: string; applicationsCount: number; views: number; createdAt: string }
interface Application { _id: string; candidateId: { name: string; email: string }; jobId: { title: string }; status: string; createdAt: string }

export const RecruiterDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/jobs/recruiter/my-jobs'), api.get('/applications?limit=5')]).then(([jRes, aRes]) => {
      setJobs(jRes.data.jobs || []);
      setApps(aRes.data.applications || []);
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (job: Job) => {
    const newStatus = job.status === 'active' ? 'paused' : 'active';
    try {
      await api.put(`/jobs/${job._id}`, { status: newStatus });
      setJobs(prev => prev.map(j => j._id === job._id ? { ...j, status: newStatus } : j));
      toast.success(`Job ${newStatus}`);
    } catch { toast.error('Failed to update status'); }
  };

  const totalApps = jobs.reduce((sum, j) => sum + (j.applicationsCount || 0), 0);
  const activeJobs = jobs.filter(j => j.status === 'active').length;

  return (
    <DashboardLayout title="Recruiter Dashboard" subtitle="Manage your jobs and applications">
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total Jobs', value: jobs.length, icon: Briefcase, color: '#F97316' },
          { label: 'Active Jobs', value: activeJobs, icon: PlayCircle, color: '#10B981' },
          { label: 'Total Applications', value: totalApps, icon: ClipboardList, color: '#FB923C' },
          { label: 'Recent Apps', value: apps.length, icon: TrendingUp, color: '#FBBF24' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: `${s.color}18` }}><s.icon size={22} color={s.color} /></div>
            <div><div className="stat-value">{loading ? '...' : s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '1.5rem' }}>
        {/* My Jobs */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700 }}>My Job Postings</h3>
            <Link to="/recruiter/create-job" className="btn btn-primary btn-sm"><Plus size={14} />Post Job</Link>
          </div>
          {jobs.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-icon"><Briefcase size={24} /></div>
              <p>No jobs posted yet</p>
              <Link to="/recruiter/create-job" className="btn btn-primary btn-sm">Post First Job</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {jobs.slice(0, 6).map(job => (
                <div key={job._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.85rem 1rem', background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{job.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {job.applicationsCount} apps · {job.views} views
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge ${job.status === 'active' ? 'badge-emerald' : 'badge-gray'}`}>{job.status}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => toggleStatus(job)} title={job.status === 'active' ? 'Pause' : 'Activate'}>
                      {job.status === 'active' ? <PauseCircle size={16} /> : <PlayCircle size={16} />}
                    </button>
                  </div>
                </div>
              ))}
              <Link to="/recruiter/jobs" style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--accent-blue)', padding: '0.5rem' }}>View all jobs →</Link>
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700 }}>Recent Applications</h3>
            <Link to="/recruiter/applications" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)' }}>View all →</Link>
          </div>
          {apps.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-icon"><Users size={24} /></div>
              <p>No applications received yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {apps.map(app => (
                <div key={app._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.85rem 1rem', background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{app.candidateId?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>for {app.jobId?.title}</div>
                  </div>
                  <span className={`status-badge status-${app.status.replace(' ', '-')}`}>{app.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
