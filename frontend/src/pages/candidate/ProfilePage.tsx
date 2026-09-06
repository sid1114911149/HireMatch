import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { User, Phone, MapPin, Globe, Link2, GitBranch, Plus, X, Save } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    company: user?.company || '',
    profile: {
      bio: '', phone: '', location: '', linkedin: '', github: '', portfolio: '',
      skills: [] as string[],
      education: [] as { institution: string; degree: string; field: string; from: string; to: string }[],
      experience: [] as { company: string; title: string; location: string; from: string; to: string; description: string }[],
    },
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        company: (user as { company?: string }).company || '',
        profile: {
          bio: (user.profile as { bio?: string })?.bio || '',
          phone: (user.profile as { phone?: string })?.phone || '',
          location: (user.profile as { location?: string })?.location || '',
          linkedin: (user.profile as { linkedin?: string })?.linkedin || '',
          github: (user.profile as { github?: string })?.github || '',
          portfolio: (user.profile as { portfolio?: string })?.portfolio || '',
          skills: (user.profile as { skills?: string[] })?.skills || [],
          education: (user.profile as { education?: { institution: string; degree: string; field: string; from: string; to: string }[] })?.education || [],
          experience: (user.profile as { experience?: { company: string; title: string; location: string; from: string; to: string; description: string }[] })?.experience || [],
        },
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/auth/update-profile', form);
      await refreshUser();
      toast.success('Profile updated!');
    } catch { toast.error('Failed to save'); }
    finally { setLoading(false); }
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (!s) return;
    if (!form.profile.skills.includes(s)) {
      setForm(prev => ({ ...prev, profile: { ...prev.profile, skills: [...prev.profile.skills, s] } }));
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string) =>
    setForm(prev => ({ ...prev, profile: { ...prev.profile, skills: prev.profile.skills.filter(s => s !== skill) } }));

  const field = (label: string, key: string, type = 'text', icon?: React.ReactNode) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>{icon}</span>}
        <input type={type} value={(form.profile as Record<string, unknown>)[key] as string || ''}
          className="form-input"
          style={{ paddingLeft: icon ? '2.5rem' : '1rem' }}
          onChange={e => setForm(prev => ({ ...prev, profile: { ...prev.profile, [key]: e.target.value } }))}
        />
      </div>
    </div>
  );

  const profileCompletion = user?.profileCompletion ?? 0;

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your personal information">
      {/* Completion banner */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(124,58,237,0.1) 100%)', border: '1px solid rgba(59,130,246,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem', flexShrink: 0 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{user?.email} · {user?.role}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="progress-bar" style={{ flex: 1, height: 6 }}>
                <div className="progress-fill" style={{ width: `${profileCompletion}%` }} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{profileCompletion}%</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {/* Basic Info */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Basic Information</h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" value={form.name} className="form-input" style={{ paddingLeft: '2.5rem' }} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>
            </div>
            {field('Phone', 'phone', 'tel', <Phone size={15} />)}
            {field('Location', 'location', 'text', <MapPin size={15} />)}
            {field('Portfolio URL', 'portfolio', 'url', <Globe size={15} />)}
            {field('LinkedIn URL', 'linkedin', 'url', <Link2 size={15} />)}
            {field('GitHub URL', 'github', 'url', <GitBranch size={15} />)}
          </div>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Bio</label>
            <textarea
              className="form-input"
              placeholder="Brief professional summary..."
              value={form.profile.bio}
              onChange={e => setForm(prev => ({ ...prev, profile: { ...prev.profile, bio: e.target.value } }))}
              rows={3}
            />
          </div>
        </div>

        {/* Skills */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Skills</h3>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <input
              type="text" value={newSkill} placeholder="Add a skill..."
              className="form-input" style={{ flex: 1 }}
              onChange={e => setNewSkill(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            />
            <button className="btn btn-primary" onClick={addSkill}><Plus size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {form.profile.skills.map(skill => (
              <span key={skill} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', color: '#93C5FD' }}>
                {skill}
                <button onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0 }}><X size={12} /></button>
              </span>
            ))}
            {form.profile.skills.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No skills added yet</p>}
          </div>
        </div>

        {/* Save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? '...' : <><Save size={16} /> Save Profile</>}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};
