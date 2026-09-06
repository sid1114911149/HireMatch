import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap, ArrowRight, User, Mail, Lock, Building2, Briefcase } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['CANDIDATE', 'RECRUITER']),
  company: z.string().optional(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export const RegisterPage: React.FC = () => {
  const { register: authRegister } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'CANDIDATE' },
  });

  const role = watch('role');

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await authRegister({ name: data.name, email: data.email, password: data.password, role: data.role, company: data.company });
      toast.success('Account created! Welcome to HireMatch 🎉');
      window.location.href = '/';
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', top: '-200px', right: '-100px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)', bottom: '-100px', left: '-50px', pointerEvents: 'none' }} />

      <div style={{
        width: '100%', maxWidth: 520,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, margin: '0 auto 1rem',
            background: 'var(--gradient-primary)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
          }}>
            <Zap size={28} color="white" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem' }}>Create your account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Join HireMatch and find your perfect match</p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {(['CANDIDATE', 'RECRUITER'] as const).map((r) => (
            <label
              key={r}
              htmlFor={`role-${r}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.65rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${role === r ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                background: role === r ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              <input {...register('role')} type="radio" value={r} id={`role-${r}`} style={{ display: 'none' }} />
              {r === 'CANDIDATE' ? <User size={18} color={role === r ? 'var(--accent-blue)' : 'var(--text-muted)'} /> : <Briefcase size={18} color={role === r ? 'var(--accent-blue)' : 'var(--text-muted)'} />}
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: role === r ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{r === 'CANDIDATE' ? 'Job Seeker' : 'Recruiter'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r === 'CANDIDATE' ? 'Find jobs & track applications' : 'Post jobs & hire talent'}</div>
              </div>
            </label>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input {...register('name')} type="text" className={`form-input ${errors.name ? 'error' : ''}`} placeholder="John Doe" style={{ paddingLeft: '2.5rem' }} />
            </div>
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          {role === 'RECRUITER' && (
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <div style={{ position: 'relative' }}>
                <Building2 size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input {...register('company')} type="text" className="form-input" placeholder="TechCorp Inc." style={{ paddingLeft: '2.5rem' }} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input {...register('email')} type="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="you@example.com" style={{ paddingLeft: '2.5rem' }} />
            </div>
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input {...register('password')} type={showPassword ? 'text' : 'password'} className={`form-input ${errors.password ? 'error' : ''}`} placeholder="••••••••" style={{ paddingLeft: '2.5rem' }} />
              </div>
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input {...register('confirmPassword')} type={showPassword ? 'text' : 'password'} className={`form-input ${errors.confirmPassword ? 'error' : ''}`} placeholder="••••••••" style={{ paddingLeft: '2.5rem' }} />
              </div>
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <input type="checkbox" onChange={() => setShowPassword(!showPassword)} style={{ accentColor: 'var(--accent-blue)' }} />
            Show password
          </label>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                Creating account...
              </span>
            ) : (
              <>Create Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
