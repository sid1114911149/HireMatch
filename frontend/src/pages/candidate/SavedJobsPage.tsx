import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { BookmarkCheck, MapPin, Briefcase, DollarSign, X, Send } from 'lucide-react';

export const SavedJobsPage: React.FC = () => {
  const [savedJobs, setSavedJobs] = useState<{ _id: string; jobId: { _id: string; title: string; company: string; location: string; type: string; salaryMin?: number; salaryMax?: number; requiredSkills: string[] }; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumeId, setResumeId] = useState('');
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.get('/saved-jobs'), api.get('/resumes')]).then(([savedRes, resumesRes]) => {
      setSavedJobs(savedRes.data.savedJobs || []);
      if (resumesRes.data.resumes?.length > 0) setResumeId(resumesRes.data.resumes[0]._id);
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (jobId: string) => {
    try {
      await api.delete(`/saved-jobs/${jobId}`);
      setSavedJobs(prev => prev.filter(s => s.jobId._id !== jobId));
      toast.success('Removed from saved');
    } catch { toast.error('Failed to unsave'); }
  };

  const handleApply = async (jobId: string) => {
    if (!resumeId) { toast.error('Upload a resume first'); return; }
    setApplying(jobId);
    try {
      await api.post('/applications', { jobId, resumeId });
      toast.success('Applied successfully!');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed');
    } finally { setApplying(null); }
  };

  const fmtSalary = (min?: number, max?: number) =>
    !min && !max ? '' : `$${((min || 0) / 1000).toFixed(0)}K–$${((max || 0) / 1000).toFixed(0)}K`;

  return (
    <DashboardLayout title="Saved Jobs" subtitle="Jobs you've bookmarked">
      {loading ? (
        Array(4).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 'var(--radius-lg)', marginBottom: '0.75rem' }} />)
      ) : savedJobs.length === 0 ? (
        <div className="empty-state card" style={{ padding: '4rem 2rem' }}>
          <div className="empty-state-icon"><BookmarkCheck size={28} /></div>
          <p>No saved jobs yet</p>
          <a href="/candidate/jobs" className="btn btn-primary btn-sm">Browse Jobs</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {savedJobs.map(({ _id, jobId, createdAt }) => (
            <div key={_id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{jobId.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>{jobId.company}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={12} />{jobId.location}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Briefcase size={12} />{jobId.type}</span>
                    {fmtSalary(jobId.salaryMin, jobId.salaryMax) && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><DollarSign size={12} />{fmtSalary(jobId.salaryMin, jobId.salaryMax)}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {jobId.requiredSkills.slice(0, 5).map(s => <span key={s} className="skill-tag">{s}</span>)}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleUnsave(jobId._id)} title="Remove"><X size={15} color="var(--text-muted)" /></button>
                  <button className="btn btn-primary btn-sm" onClick={() => handleApply(jobId._id)} disabled={applying === jobId._id}>
                    {applying === jobId._id ? '...' : <><Send size={13} />Apply</>}
                  </button>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Saved {new Date(createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
