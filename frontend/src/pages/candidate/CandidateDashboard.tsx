import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { Link } from 'react-router-dom';
import { Briefcase, FileText, ClipboardList, Star, TrendingUp, ArrowRight, Zap, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Stats {
  resumeCount: number;
  appliedJobs: number;
  savedJobs: number;
  recommendations: number;
}

interface RecentApplication {
  _id: string;
  jobId: { title: string; company: string };
  status: string;
  createdAt: string;
}

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ resumeCount: 0, appliedJobs: 0, savedJobs: 0, recommendations: 0 });
  const [recentApps, setRecentApps] = useState<RecentApplication[]>([]);
  const [recommendations, setRecommendations] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [resumesRes, appsRes, savedRes, recsRes] = await Promise.allSettled([
          api.get('/resumes'),
          api.get('/applications'),
          api.get('/saved-jobs'),
          api.get('/matches/recommendations'),
        ]);
        setStats({
          resumeCount: resumesRes.status === 'fulfilled' ? resumesRes.value.data.count : 0,
          appliedJobs: appsRes.status === 'fulfilled' ? appsRes.value.data.total : 0,
          savedJobs: savedRes.status === 'fulfilled' ? savedRes.value.data.count : 0,
          recommendations: recsRes.status === 'fulfilled' ? recsRes.value.data.count : 0,
        });
        if (appsRes.status === 'fulfilled') setRecentApps(appsRes.value.data.applications?.slice(0, 5) || []);
        if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value.data.recommendations?.slice(0, 3) || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const profileCompletion = user?.profileCompletion ?? 40;

  const statCards = [
    { label: 'Resumes Uploaded', value: stats.resumeCount, icon: FileText, color: '#F97316', link: '/candidate/resume' },
    { label: 'Jobs Applied', value: stats.appliedJobs, icon: ClipboardList, color: '#10B981', link: '/candidate/applications' },
    { label: 'Saved Jobs', value: stats.savedJobs, icon: Star, color: '#FBBF24', link: '/candidate/saved-jobs' },
    { label: 'Recommendations', value: stats.recommendations, icon: Zap, color: '#FB923C', link: '/candidate/recommendations' },
  ];

  const statusIcon = (status: string) => {
    if (status === 'Selected') return <CheckCircle size={14} color="#34D399" />;
    if (status === 'Rejected') return <AlertCircle size={14} color="#FB7185" />;
    return <Clock size={14} color="#FCD34D" />;
  };

  const Skeleton = () => <div className="skeleton" style={{ height: 100, borderRadius: 'var(--radius-lg)' }} />;

  return (
    <DashboardLayout>
      {/* Profile Completion Banner */}
      {profileCompletion < 80 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(124,58,237,0.12) 100%)',
          border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 700, marginBottom: '0.4rem' }}>
              Complete your profile — {profileCompletion}%
            </div>
            <div className="progress-bar" style={{ height: 6 }}>
              <div className="progress-fill" style={{ width: `${profileCompletion}%` }} />
            </div>
          </div>
          <Link to="/candidate/profile" className="btn btn-primary btn-sm">
            Complete Profile <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {loading ? Array(4).fill(0).map((_, i) => <Skeleton key={i} />) :
          statCards.map(card => (
            <Link to={card.link} key={card.label} style={{ textDecoration: 'none' }}>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: `${card.color}18` }}>
                  <card.icon size={22} color={card.color} />
                </div>
                <div>
                  <div className="stat-value">{card.value}</div>
                  <div className="stat-label">{card.label}</div>
                </div>
              </div>
            </Link>
          ))
        }
      </div>

      <div className="grid-2" style={{ gap: '1.5rem' }}>
        {/* Recent Applications */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700 }}>Recent Applications</h3>
            <Link to="/candidate/applications" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)' }}>View all →</Link>
          </div>
          {recentApps.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-icon"><ClipboardList size={24} /></div>
              <p style={{ fontSize: '0.875rem' }}>No applications yet</p>
              <Link to="/candidate/jobs" className="btn btn-primary btn-sm">Browse Jobs</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentApps.map(app => (
                <div key={app._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{app.jobId?.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{app.jobId?.company}</div>
                  </div>
                  <span className={`status-badge status-${app.status.replace(' ', '-')}`}>
                    {statusIcon(app.status)} {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Jobs */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700 }}>Top Recommendations</h3>
            <Link to="/candidate/recommendations" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)' }}>View all →</Link>
          </div>
          {recommendations.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-state-icon"><Zap size={24} /></div>
              <p style={{ fontSize: '0.875rem' }}>Upload a resume to get recommendations</p>
              <Link to="/candidate/resume" className="btn btn-primary btn-sm">Upload Resume</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(recommendations as { job: { _id: string; title: string; company: string; location: string }; matchScore: number; recommendation: string }[]).map(rec => (
                <div key={rec.job._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{rec.job.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{rec.job.company} · {rec.job.location}</div>
                  </div>
                  <div style={{
                    textAlign: 'center',
                    background: rec.matchScore >= 75 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    border: `1px solid ${rec.matchScore >= 75 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.3rem 0.6rem',
                    minWidth: 54,
                  }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: rec.matchScore >= 75 ? '#34D399' : '#FCD34D' }}>{rec.matchScore}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/candidate/resume" className="btn btn-secondary">
            <FileText size={16} /> Upload Resume
          </Link>
          <Link to="/candidate/jobs" className="btn btn-secondary">
            <Briefcase size={16} /> Browse Jobs
          </Link>
          <Link to="/candidate/analysis" className="btn btn-secondary">
            <Zap size={16} /> Analyze Resume
          </Link>
          <Link to="/candidate/skill-gap" className="btn btn-secondary">
            <TrendingUp size={16} /> View Skill Gap
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};
