import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Search, MapPin, Briefcase, DollarSign, Clock, Bookmark, BookmarkCheck, Zap, Filter, ChevronRight, Star } from 'lucide-react';

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requiredSkills: string[];
  salaryMin?: number;
  salaryMax?: number;
  applicationsCount: number;
  createdAt: string;
  recruiterId: { name: string; company: string };
}

interface MatchResult {
  scores: { overall: number; skills: number; experience: number; education: number; similarity: number };
  matchedSkills: string[];
  missingSkills: string[];
  recommendation: string;
  skillGap: { skill: string; priority: string; reason: string; learningDirection: string }[];
}

export const JobsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [matching, setMatching] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [resumes, setResumes] = useState<{ _id: string; originalName: string }[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (search) params.append('search', search);
      if (locationFilter) params.append('location', locationFilter);
      if (typeFilter) params.append('type', typeFilter);
      const res = await api.get(`/jobs?${params}`);
      setJobs(res.data.jobs);
      setTotalPages(res.data.pages);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  }, [page, search, locationFilter, typeFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    api.get('/saved-jobs').then(r => {
      const ids = new Set<string>(r.data.savedJobs?.map((s: { jobId: { _id: string } }) => s.jobId?._id) || []);
      setSavedIds(ids);
    }).catch(() => {});
    api.get('/resumes').then(r => setResumes(r.data.resumes || [])).catch(() => {});
  }, []);

  const handleMatch = async (job: Job) => {
    if (resumes.length === 0) { toast.error('Upload a resume first to get match scores'); return; }
    setMatching(true);
    setMatchResult(null);
    try {
      const res = await api.post('/matches/analyze', { jobId: job._id, resumeId: resumes[0]._id });
      setMatchResult(res.data.match);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Match analysis failed');
    } finally { setMatching(false); }
  };

  const handleSave = async (jobId: string) => {
    const isSaved = savedIds.has(jobId);
    try {
      if (isSaved) {
        await api.delete(`/saved-jobs/${jobId}`);
        setSavedIds(prev => { const s = new Set(prev); s.delete(jobId); return s; });
        toast.success('Removed from saved');
      } else {
        await api.post(`/saved-jobs/${jobId}`);
        setSavedIds(prev => new Set([...prev, jobId]));
        toast.success('Job saved!');
      }
    } catch { toast.error('Failed to update saved jobs'); }
  };

  const fmtSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not listed';
    if (min && max) return `$${(min / 1000).toFixed(0)}K – $${(max / 1000).toFixed(0)}K`;
    return min ? `From $${(min / 1000).toFixed(0)}K` : `Up to $${(max! / 1000).toFixed(0)}K`;
  };

  const scoreColor = (s: number) => s >= 75 ? '#34D399' : s >= 55 ? '#FCD34D' : '#FB7185';

  return (
    <DashboardLayout title="Browse Jobs" subtitle="Discover opportunities matching your profile">
      {/* Search + Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text" value={search} placeholder="Search jobs, companies, skills..."
              className="form-input" style={{ paddingLeft: '2.5rem' }}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div style={{ position: 'relative', minWidth: 180 }}>
            <MapPin size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" value={locationFilter} placeholder="Location..." className="form-input" style={{ paddingLeft: '2.5rem' }} onChange={e => { setLocationFilter(e.target.value); setPage(1); }} />
          </div>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="form-input" style={{ width: 'auto', minWidth: 150 }}>
            <option value="">All Types</option>
            {['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedJob ? '1fr 420px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Job list */}
        <div>
          {loading ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)', marginBottom: '0.75rem' }} />)
          ) : jobs.length === 0 ? (
            <div className="empty-state card"><div className="empty-state-icon"><Briefcase size={24} /></div><p>No jobs found matching your filters</p></div>
          ) : (
            <>
              {jobs.map(job => (
                <div
                  key={job._id}
                  className="card"
                  style={{
                    marginBottom: '0.75rem', cursor: 'pointer',
                    border: selectedJob?._id === job._id ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                    background: selectedJob?._id === job._id ? 'rgba(59,130,246,0.04)' : 'var(--bg-card)',
                    padding: '1.25rem',
                    transition: 'var(--transition)',
                  }}
                  onClick={() => { setSelectedJob(job); setMatchResult(null); }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>{job.title}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        {job.recruiterId?.company || job.company}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} /> {job.location}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Briefcase size={13} /> {job.type}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><DollarSign size={13} /> {fmtSalary(job.salaryMin, job.salaryMax)}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.75rem' }}>
                        {job.requiredSkills.slice(0, 4).map(s => <span key={s} className="skill-tag">{s}</span>)}
                        {job.requiredSkills.length > 4 && <span className="badge badge-gray">+{job.requiredSkills.length - 4}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={e => { e.stopPropagation(); handleSave(job._id); }}
                      >
                        {savedIds.has(job._id) ? <BookmarkCheck size={18} color="var(--accent-blue)" /> : <Bookmark size={18} />}
                      </button>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.applicationsCount} applicants</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                <span style={{ padding: '0.4rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Page {page} of {totalPages}</span>
                <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            </>
          )}
        </div>

        {/* Job Detail Panel */}
        {selectedJob && (
          <div className="card" style={{ position: 'sticky', top: '5rem', maxHeight: 'calc(100vh - 7rem)', overflowY: 'auto' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: '0.25rem' }}>{selectedJob.title}</div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{selectedJob.recruiterId?.company || selectedJob.company}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} /> {selectedJob.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Briefcase size={13} /> {selectedJob.type}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><DollarSign size={13} /> {fmtSalary(selectedJob.salaryMin, selectedJob.salaryMax)}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleMatch(selectedJob)} disabled={matching}>
                  {matching ? '...' : <><Zap size={15} /> Analyze Match</>}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handleSave(selectedJob._id)}>
                  {savedIds.has(selectedJob._id) ? <BookmarkCheck size={16} color="var(--accent-blue)" /> : <Bookmark size={16} />}
                </button>
              </div>
            </div>

            {/* Match Result */}
            {matchResult && (
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 700 }}>Match Analysis</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: scoreColor(matchResult.scores.overall) }}>{matchResult.scores.overall}%</span>
                </div>
                <span className={`badge ${matchResult.scores.overall >= 80 ? 'badge-emerald' : matchResult.scores.overall >= 60 ? 'badge-blue' : 'badge-amber'}`} style={{ marginBottom: '1rem', display: 'inline-flex' }}>
                  <Star size={11} /> {matchResult.recommendation}
                </span>
                {Object.entries(matchResult.scores).filter(([k]) => k !== 'overall').map(([key, val]) => (
                  <div key={key} style={{ marginBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'capitalize' }}>
                      <span>{key}</span><span style={{ color: 'white', fontWeight: 600 }}>{val}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: 5 }}>
                      <div className="progress-fill" style={{ width: `${val}%`, background: scoreColor(Number(val)) }} />
                    </div>
                  </div>
                ))}
                {matchResult.matchedSkills?.length > 0 && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>MATCHED SKILLS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {matchResult.matchedSkills.map(s => <span key={s} className="skill-tag matched">✓ {s}</span>)}
                    </div>
                  </div>
                )}
                {matchResult.missingSkills?.length > 0 && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>MISSING SKILLS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {matchResult.missingSkills.map(s => <span key={s} className="skill-tag missing">✗ {s}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="divider" />

            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>
              {selectedJob.description}
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Required Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {selectedJob.requiredSkills.map(s => <span key={s} className="skill-tag">{s}</span>)}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
