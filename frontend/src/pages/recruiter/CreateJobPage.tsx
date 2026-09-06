import React, { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Briefcase } from 'lucide-react';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
const EDU_LEVELS = ["Any", "High School", "Associate's", "Bachelor's", "Master's", "PhD"];

export const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newPrefSkill, setNewPrefSkill] = useState('');
  const [form, setForm] = useState({
    title: '', company: '', location: '', type: 'Full-time',
    description: '',
    requiredSkills: [] as string[],
    preferredSkills: [] as string[],
    experienceMin: 0, experienceMax: 5,
    salaryMin: '', salaryMax: '',
    education: 'Any',
    responsibilities: '',
  });

  const set = (key: string, val: unknown) => setForm(prev => ({ ...prev, [key]: val }));

  const addSkill = (type: 'required' | 'preferred') => {
    const skill = type === 'required' ? newSkill.trim() : newPrefSkill.trim();
    if (!skill) return;
    const key = type === 'required' ? 'requiredSkills' : 'preferredSkills';
    if (!form[key].includes(skill)) set(key, [...form[key], skill]);
    type === 'required' ? setNewSkill('') : setNewPrefSkill('');
  };

  const removeSkill = (type: 'required' | 'preferred', skill: string) => {
    const key = type === 'required' ? 'requiredSkills' : 'preferredSkills';
    set(key, form[key].filter((s: string) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.location || !form.description) {
      toast.error('Please fill all required fields'); return;
    }
    setLoading(true);
    try {
      await api.post('/jobs', {
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        responsibilities: form.responsibilities.split('\n').filter(Boolean),
      });
      toast.success('Job posted successfully!');
      navigate('/recruiter/jobs');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to post job');
    } finally { setLoading(false); }
  };

  const inputField = (label: string, key: string, type = 'text', required = false, placeholder = '') => (
    <div className="form-group">
      <label className="form-label">{label}{required && <span style={{ color: 'var(--accent-rose)' }}> *</span>}</label>
      <input type={type} value={(form as Record<string, unknown>)[key] as string}
        className="form-input" placeholder={placeholder}
        onChange={e => set(key, e.target.value)} required={required}
      />
    </div>
  );

  return (
    <DashboardLayout title="Post a Job" subtitle="Create a new job listing to attract top talent">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Basic Info */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={18} color="var(--accent-blue)" /> Job Details
            </h3>
            <div className="grid-2">
              {inputField('Job Title', 'title', 'text', true, 'e.g. Senior React Developer')}
              {inputField('Company Name', 'company', 'text', true, 'e.g. TechCorp Inc.')}
              {inputField('Location', 'location', 'text', true, 'e.g. San Francisco, CA or Remote')}
              <div className="form-group">
                <label className="form-label">Job Type <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
                <select value={form.type} className="form-input" onChange={e => set('type', e.target.value)}>
                  {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Education Required</label>
                <select value={form.education} className="form-input" onChange={e => set('education', e.target.value)}>
                  {EDU_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Job Description <span style={{ color: 'var(--accent-rose)' }}>*</span></label>
              <textarea value={form.description} className="form-input" rows={5} placeholder="Describe the role, team, and what you're looking for..."
                onChange={e => set('description', e.target.value)} />
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Responsibilities (one per line)</label>
              <textarea value={form.responsibilities} className="form-input" rows={4} placeholder="Build and maintain REST APIs&#10;Collaborate with design team&#10;Code reviews..."
                onChange={e => set('responsibilities', e.target.value)} />
            </div>
          </div>

          {/* Salary & Experience */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Compensation & Experience</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Min Salary (USD/year)</label>
                <input type="number" value={form.salaryMin} className="form-input" placeholder="e.g. 80000" onChange={e => set('salaryMin', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Salary (USD/year)</label>
                <input type="number" value={form.salaryMax} className="form-input" placeholder="e.g. 150000" onChange={e => set('salaryMax', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Min Experience (years)</label>
                <input type="number" value={form.experienceMin} className="form-input" min={0} max={20} onChange={e => set('experienceMin', Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Experience (years)</label>
                <input type="number" value={form.experienceMax} className="form-input" min={0} max={30} onChange={e => set('experienceMax', Number(e.target.value))} />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Skills</h3>
            <div className="grid-2">
              {/* Required */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Required Skills</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input type="text" value={newSkill} placeholder="e.g. React" className="form-input" style={{ flex: 1 }}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill('required'); } }}
                  />
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => addSkill('required')}><Plus size={15} /></button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {form.requiredSkills.map(s => (
                    <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.65rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', color: '#93C5FD' }}>
                      {s} <button type="button" onClick={() => removeSkill('required', s)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}><X size={11} /></button>
                    </span>
                  ))}
                </div>
              </div>
              {/* Preferred */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Preferred Skills</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input type="text" value={newPrefSkill} placeholder="e.g. Docker" className="form-input" style={{ flex: 1 }}
                    onChange={e => setNewPrefSkill(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill('preferred'); } }}
                  />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => addSkill('preferred')}><Plus size={15} /></button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {form.preferredSkills.map(s => (
                    <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.65rem', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', color: '#A78BFA' }}>
                      {s} <button type="button" onClick={() => removeSkill('preferred', s)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}><X size={11} /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/recruiter/jobs')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
};
