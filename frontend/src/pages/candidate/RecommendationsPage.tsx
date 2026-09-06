import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Zap, MapPin, Briefcase, DollarSign, Star, RefreshCw, Send } from 'lucide-react';

interface Rec {
  job: { _id: string; title: string; company: string; location: string; type: string; requiredSkills: string[]; salaryMin?: number; salaryMax?: number };
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendation: string;
}

export const RecommendationsPage: React.FC = () => {
  const [recs, setRecs] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [resumeId, setResumeId] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const [recsRes, resumesRes] = await Promise.all([
          api.get('/matches/recommendations'),
          api.get('/resumes'),
        ]);
        setRecs(recsRes.data.recommendations || []);
        if (resumesRes.data.resumes?.length > 0) setResumeId(resumesRes.data.resumes[0]._id);
      } catch { toast.error('Failed to load recommendations'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleApply = async (jobId: string) => {
    if (!resumeId) { toast.error('Upload a resume first'); return; }
    setApplying(jobId);
    try {
      await api.post('/applications', { jobId, resumeId });
      toast.success('Application submitted!');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to apply');
    } finally { setApplying(null); }
  };

  const scoreColor = (s: number) => s >= 80 ? '#34D399' : s >= 60 ? '#FB923C' : s >= 40 ? '#FCD34D' : '#FB7185';
  const scoreGradient = (s: number) => s >= 80 ? 'linear-gradient(135deg, #10B981, #059669)' : s >= 60 ? 'linear-gradient(135deg, #F97316, #EA6C10)' : s >= 40 ? 'linear-gradient(135deg, #FBBF24, #F59E0B)' : 'linear-gradient(135deg, #F43F5E, #DC2626)';

  const Skeleton = () => (
    <div className="card" style={{ padding: '1.5rem' }}>
      {[90, 60, 40, 80].map((w, i) => (
        <div key={i} className="skeleton" style={{ height: 16, width: `${w}%`, borderRadius: 4, marginBottom: 10 }} />
      ))}
    </div>
  );

  return (
    <DashboardLayout title="Job Recommendations" subtitle="AI-powered job matches based on your resume">
      {!loading && recs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: 72, height: 72, background: 'rgba(249,115,22,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Zap size={32} color="#F97316" />
          </div>
          <h3 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>No recommendations yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Upload and analyze your resume to get personalized job recommendations powered by AI.</p>
          <a href="/candidate/resume" className="btn btn-primary">Upload Resume</a>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {!loading && <span>Found <strong style={{ color: 'white' }}>{recs.length}</strong> matching opportunities</span>}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => { setLoading(true); api.get('/matches/recommendations').then(r => { setRecs(r.data.recommendations || []); setLoading(false); }); }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {loading ? Array(5).fill(0).map((_, i) => <Skeleton key={i} />) :
              recs.map((rec, idx) => (
                <div key={rec.job._id} className="card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                  {/* Rank badge */}
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    background: scoreGradient(rec.matchScore),
                    padding: '0.4rem 1rem 0.5rem 1.5rem',
                    borderBottomLeftRadius: 'var(--radius-lg)',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    fontSize: '0.75rem', fontWeight: 700, color: 'white',
                  }}>
                    #{idx + 1} · {rec.matchScore}% {rec.recommendation}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', paddingRight: '8rem' }}>
                    {/* Score circle */}
                    <div style={{ flexShrink: 0, position: 'relative', width: 64, height: 64 }}>
                      <svg width="64" height="64" viewBox="0 0 64 64">
                        <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                        <circle cx="32" cy="32" r="26" fill="none" stroke={scoreColor(rec.matchScore)} strokeWidth="6"
                          strokeDasharray={`${2 * Math.PI * 26}`}
                          strokeDashoffset={`${2 * Math.PI * 26 * (1 - rec.matchScore / 100)}`}
                          strokeLinecap="round"
                          style={{ transform: 'rotate(-90deg)', transformOrigin: '32px 32px' }}
                        />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: scoreColor(rec.matchScore) }}>
                        {rec.matchScore}
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.2rem' }}>{rec.job.title}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{rec.job.company}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} />{rec.job.location}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Briefcase size={13} />{rec.job.type}</span>
                        {(rec.job.salaryMin || rec.job.salaryMax) && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <DollarSign size={13} />${((rec.job.salaryMin || 0) / 1000).toFixed(0)}K – ${((rec.job.salaryMax || 0) / 1000).toFixed(0)}K
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {rec.matchedSkills?.length > 0 && (
                          <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>MATCHED</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                              {rec.matchedSkills.slice(0, 4).map(s => <span key={s} className="skill-tag matched">✓ {s}</span>)}
                            </div>
                          </div>
                        )}
                        {rec.missingSkills?.length > 0 && (
                          <div>
                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>MISSING</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                              {rec.missingSkills.slice(0, 3).map(s => <span key={s} className="skill-tag missing">✗ {s}</span>)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end', marginLeft: 'auto', marginTop: '2rem' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleApply(rec.job._id)}
                        disabled={applying === rec.job._id}
                      >
                        {applying === rec.job._id ? '...' : <><Send size={13} /> Apply</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </>
      )}
    </DashboardLayout>
  );
};
