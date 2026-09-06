import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Upload, FileText, Trash2, Zap, CheckCircle, Clock, Eye } from 'lucide-react';

interface Resume {
  _id: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  isAnalyzed: boolean;
  score: { overall: number; skills: number; experience: number; projects: number; education: number };
  suggestions: string[];
  parsedData: { skills: string[]; education: unknown[]; experience: unknown[] };
  createdAt: string;
}

export const ResumePage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [selected, setSelected] = useState<Resume | null>(null);
  const [dragging, setDragging] = useState(false);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await api.get('/resumes');
      setResumes(res.data.resumes);
    } catch { toast.error('Failed to load resumes'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  const handleUpload = async (file: File) => {
    if (!file) return;
    const allowed = ['.pdf', '.docx', '.doc', '.txt'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowed.includes(ext)) { toast.error('Only PDF, DOCX, DOC, TXT allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return; }

    const formData = new FormData();
    formData.append('resume', file);
    setUploading(true);
    try {
      await api.post('/resumes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Resume uploaded successfully!');
      fetchResumes();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleAnalyze = async (id: string) => {
    setAnalyzing(id);
    try {
      const res = await api.post(`/resumes/${id}/analyze`);
      setResumes(prev => prev.map(r => r._id === id ? res.data.resume : r));
      if (selected?._id === id) setSelected(res.data.resume);
      toast.success('Resume analyzed!');
    } catch { toast.error('Analysis failed'); }
    finally { setAnalyzing(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume?')) return;
    try {
      await api.delete(`/resumes/${id}`);
      setResumes(prev => prev.filter(r => r._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success('Resume deleted');
    } catch { toast.error('Delete failed'); }
  };

  const fmtSize = (bytes: number) => `${(bytes / 1024).toFixed(0)} KB`;
  const scoreColor = (s: number) => s >= 75 ? '#34D399' : s >= 50 ? '#FCD34D' : '#FB7185';

  return (
    <DashboardLayout title="My Resumes" subtitle="Upload and manage your resumes">
      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left: list + upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
            style={{
              border: `2px dashed ${dragging ? 'var(--accent-blue)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem',
              textAlign: 'center',
              background: dragging ? 'rgba(59,130,246,0.06)' : 'var(--bg-secondary)',
              transition: 'var(--transition)',
              cursor: 'pointer',
            }}
            onClick={() => document.getElementById('resume-file-input')?.click()}
          >
            <input
              id="resume-file-input"
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }}
            />
            {uploading ? (
              <div style={{ color: 'var(--text-secondary)' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-blue)', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                Uploading...
              </div>
            ) : (
              <>
                <div style={{ width: 56, height: 56, background: 'rgba(59,130,246,0.1)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Upload size={24} color="var(--accent-blue)" />
                </div>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Drop your resume here</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>PDF, DOCX, DOC, TXT · Max 5MB</div>
                <div style={{ marginTop: '1rem' }}>
                  <span className="btn btn-primary btn-sm">Browse File</span>
                </div>
              </>
            )}
          </div>

          {/* Resume list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {loading ? Array(2).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius-md)' }} />
            )) : resumes.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon"><FileText size={24} /></div><p>No resumes uploaded yet</p></div>
            ) : resumes.map(resume => (
              <div
                key={resume._id}
                className="card"
                style={{
                  cursor: 'pointer',
                  border: selected?._id === resume._id ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                  background: selected?._id === resume._id ? 'rgba(59,130,246,0.06)' : 'var(--bg-card)',
                  padding: '1rem 1.25rem',
                }}
                onClick={() => setSelected(resume)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div style={{ width: 40, height: 40, background: 'rgba(59,130,246,0.1)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={18} color="var(--accent-blue)" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resume.originalName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fmtSize(resume.fileSize)} · {new Date(resume.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    {resume.isAnalyzed ? (
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: scoreColor(resume.score.overall) }}>
                        {resume.score.overall}%
                      </div>
                    ) : (
                      <span className="badge badge-gray"><Clock size={11} /> Not analyzed</span>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); handleAnalyze(resume._id); }} disabled={analyzing === resume._id} title="Analyze">
                      {analyzing === resume._id ? '...' : <Zap size={15} color="var(--accent-blue)" />}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); handleDelete(resume._id); }} title="Delete">
                      <Trash2 size={15} color="var(--accent-rose)" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: selected resume detail */}
        <div>
          {selected ? (
            <div className="card" style={{ position: 'sticky', top: '5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 700 }}>Resume Analysis</h3>
                {!selected.isAnalyzed && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleAnalyze(selected._id)} disabled={analyzing === selected._id}>
                    <Zap size={14} /> Analyze
                  </button>
                )}
              </div>

              {selected.isAnalyzed ? (
                <>
                  {/* Overall score ring */}
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                        <circle cx="60" cy="60" r="50" fill="none"
                          stroke={scoreColor(selected.score.overall)}
                          strokeWidth="10"
                          strokeDasharray={`${2 * Math.PI * 50}`}
                          strokeDashoffset={`${2 * Math.PI * 50 * (1 - selected.score.overall / 100)}`}
                          strokeLinecap="round"
                          style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 1s ease' }}
                        />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: scoreColor(selected.score.overall) }}>{selected.score.overall}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ 100</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, marginTop: '0.5rem' }}>Overall Resume Score</div>
                  </div>

                  {/* Score breakdown */}
                  {[
                    { label: 'Skills', value: selected.score.skills },
                    { label: 'Experience', value: selected.score.experience },
                    { label: 'Projects', value: selected.score.projects },
                    { label: 'Education', value: selected.score.education },
                  ].map(s => (
                    <div key={s.label} style={{ marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                        <span>{s.label}</span>
                        <span style={{ color: 'white', fontWeight: 600 }}>{s.value}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${s.value}%`, background: scoreColor(s.value) }} />
                      </div>
                    </div>
                  ))}

                  {/* Skills */}
                  {selected.parsedData?.skills?.length > 0 && (
                    <div style={{ marginTop: '1.25rem' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>DETECTED SKILLS</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {selected.parsedData.skills.map(skill => (
                          <span key={skill} className="skill-tag matched"><CheckCircle size={10} /> {skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {selected.suggestions?.length > 0 && (
                    <div style={{ marginTop: '1.25rem' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>IMPROVEMENT TIPS</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {selected.suggestions.map((s, i) => (
                          <div key={i} style={{ display: 'flex', gap: '0.65rem', padding: '0.6rem 0.85rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <span style={{ color: '#FCD34D' }}>💡</span> {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-state" style={{ padding: '2rem' }}>
                  <Eye size={32} color="var(--text-muted)" />
                  <p>Click "Analyze" to get your resume score and improvement tips</p>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <FileText size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Select a resume to view its analysis</p>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
};
