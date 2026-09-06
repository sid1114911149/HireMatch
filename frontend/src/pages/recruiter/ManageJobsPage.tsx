import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Briefcase, Eye, PauseCircle, PlayCircle, Trash2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Job { _id: string; title: string; company: string; location: string; type: string; status: string; applicationsCount: number; views: number; createdAt: string }

export const ManageJobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/recruiter/my-jobs').then(r => setJobs(r.data.jobs || [])).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (job: Job) => {
    const newStatus = job.status === 'active' ? 'paused' : 'active';
    try {
      await api.put(`/jobs/${job._id}`, { status: newStatus });
      setJobs(prev => prev.map(j => j._id === job._id ? { ...j, status: newStatus } : j));
      toast.success(`Job ${newStatus}`);
    } catch { toast.error('Failed'); }
  };

  const deleteJob = async (id: string) => {
    if (!confirm('Delete this job posting?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs(prev => prev.filter(j => j._id !== id));
      toast.success('Job deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <DashboardLayout title="Manage Jobs" subtitle="View and manage all your job postings">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
        <Link to="/recruiter/create-job" className="btn btn-primary">+ Post New Job</Link>
      </div>

      {loading ? (
        Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-lg)', marginBottom: '0.75rem' }} />)
      ) : jobs.length === 0 ? (
        <div className="empty-state card" style={{ padding: '4rem 2rem' }}>
          <div className="empty-state-icon"><Briefcase size={28} /></div>
          <p>No jobs posted yet</p>
          <Link to="/recruiter/create-job" className="btn btn-primary btn-sm">Post First Job</Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Location</th>
                <th>Type</th>
                <th>Applicants</th>
                <th>Views</th>
                <th>Status</th>
                <th>Posted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job._id}>
                  <td><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.title}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.company}</div></td>
                  <td>{job.location}</td>
                  <td><span className="badge badge-blue">{job.type}</span></td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={13} />{job.applicationsCount}</div></td>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Eye size={13} />{job.views}</div></td>
                  <td><span className={`badge ${job.status === 'active' ? 'badge-emerald' : job.status === 'paused' ? 'badge-amber' : 'badge-gray'}`}>{job.status}</span></td>
                  <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleStatus(job)} title={job.status === 'active' ? 'Pause' : 'Activate'}>
                        {job.status === 'active' ? <PauseCircle size={15} /> : <PlayCircle size={15} />}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteJob(job._id)} title="Delete">
                        <Trash2 size={15} color="var(--accent-rose)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
};
