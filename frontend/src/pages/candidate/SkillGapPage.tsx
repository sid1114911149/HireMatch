import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { TrendingUp, AlertCircle, BookOpen, Target, ChevronRight } from 'lucide-react';

interface SkillGapItem {
  skill: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  learningDirection: string;
}

interface Match {
  _id: string;
  jobId: { title: string; company: string };
  scores: { overall: number; skills: number; experience: number; education: number; similarity: number };
  matchedSkills: string[];
  missingSkills: string[];
  skillGap: SkillGapItem[];
  recommendation: string;
}

const priorityColor = { high: '#FB7185', medium: '#FCD34D', low: '#34D399' };
const priorityBg = { high: 'rgba(244,63,94,0.1)', medium: 'rgba(245,158,11,0.1)', low: 'rgba(16,185,129,0.1)' };

export const SkillGapPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);

  useEffect(() => {
    api.get('/matches/all').then(r => {
      const m = r.data.matches || [];
      setMatches(m);
      if (m.length > 0) setActiveMatch(m[0]);
    }).catch(() => toast.error('Failed to load matches')).finally(() => setLoading(false));
  }, []);

  // Aggregate all missing skills across matches
  const allMissingSkills = [...new Set(matches.flatMap(m => m.missingSkills || []))];
  const skillFrequency = allMissingSkills.map(skill => ({
    skill,
    count: matches.filter(m => m.missingSkills?.includes(skill)).length,
  })).sort((a, b) => b.count - a.count);

  return (
    <DashboardLayout title="Skill Gap Analysis" subtitle="Identify and close your skill gaps">
      {loading ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : matches.length === 0 ? (
        <div className="empty-state card" style={{ padding: '4rem 2rem' }}>
          <div className="empty-state-icon"><TrendingUp size={32} /></div>
          <h3>No match analysis yet</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>Browse jobs and run match analysis to see your personalized skill gap report.</p>
          <a href="/candidate/jobs" className="btn btn-primary">Browse Jobs</a>
        </div>
      ) : (
        <>
          {/* Top Missing Skills Overview */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>📊 Most Needed Skills Across All Matches</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {skillFrequency.slice(0, 15).map(({ skill, count }) => (
                <div key={skill} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.4rem 0.85rem',
                  background: `rgba(244,63,94,${Math.min(0.05 + count * 0.07, 0.25)})`,
                  border: `1px solid rgba(244,63,94,${Math.min(0.1 + count * 0.1, 0.4)})`,
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.82rem', fontWeight: 600,
                  color: '#FDA4AF',
                }}>
                  {skill}
                  <span style={{ background: 'rgba(244,63,94,0.3)', borderRadius: 'var(--radius-full)', padding: '0 5px', fontSize: '0.7rem' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid-2" style={{ alignItems: 'start' }}>
            {/* Job Match Selector */}
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>SELECT A JOB MATCH</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {matches.map(match => (
                  <div
                    key={match._id}
                    className="card"
                    style={{
                      cursor: 'pointer', padding: '1rem',
                      border: activeMatch?._id === match._id ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                      background: activeMatch?._id === match._id ? 'rgba(59,130,246,0.06)' : 'var(--bg-card)',
                    }}
                    onClick={() => setActiveMatch(match)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{match.jobId?.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{match.jobId?.company}</div>
                        <div style={{ fontSize: '0.75rem', color: '#FB7185', marginTop: '0.35rem' }}>
                          {match.missingSkills?.length || 0} missing skills
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: match.scores.overall >= 75 ? '#34D399' : '#FCD34D' }}>{match.scores.overall}%</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>match</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Gap Detail */}
            {activeMatch && (
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>SKILL GAP REPORT</div>

                {/* Score bars */}
                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '1rem' }}>{activeMatch.jobId?.title}</div>
                  {Object.entries(activeMatch.scores).map(([key, val]) => (
                    <div key={key} style={{ marginBottom: '0.65rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem', textTransform: 'capitalize' }}>
                        <span>{key}</span>
                        <span style={{ fontWeight: 700, color: Number(val) >= 70 ? '#34D399' : '#FCD34D' }}>{val}%</span>
                      </div>
                      <div className="progress-bar" style={{ height: 6 }}>
                        <div className="progress-fill" style={{ width: `${val}%`, background: Number(val) >= 70 ? '#10B981' : Number(val) >= 50 ? '#F59E0B' : '#F43F5E' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Skill Gap items */}
                {activeMatch.skillGap?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activeMatch.skillGap.map((item, i) => (
                      <div key={i} style={{
                        background: priorityBg[item.priority],
                        border: `1px solid ${priorityColor[item.priority]}30`,
                        borderLeft: `3px solid ${priorityColor[item.priority]}`,
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.skill}</div>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-full)', textTransform: 'uppercase',
                            background: `${priorityColor[item.priority]}20`,
                            color: priorityColor[item.priority],
                          }}>{item.priority}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                          <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 2 }} /> {item.reason}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                          <BookOpen size={13} style={{ flexShrink: 0, marginTop: 2, color: '#60A5FA' }} />
                          <span style={{ color: '#93C5FD' }}>{item.learningDirection}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <Target size={32} color="#34D399" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: '#34D399', fontWeight: 600 }}>No skill gaps! You're a strong match for this role.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};
