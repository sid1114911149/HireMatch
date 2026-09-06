import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Brain, TrendingUp, Target, CheckCircle, Users, Briefcase, Star, ChevronRight } from 'lucide-react';

const stats = [
  { value: '50K+', label: 'Active Candidates' },
  { value: '12K+', label: 'Jobs Posted' },
  { value: '94%', label: 'Match Accuracy' },
  { value: '8K+', label: 'Placements Made' },
];

const features = [
  { icon: Brain, title: 'AI Resume Analysis', desc: 'Our ML engine parses your resume, scores each section and gives actionable improvement tips.', color: '#F97316' },
  { icon: Target, title: 'Smart Job Matching', desc: 'TF-IDF cosine similarity + ML models produce an explainable match score for every job.', color: '#FB923C' },
  { icon: TrendingUp, title: 'Skill Gap Insights', desc: "See exactly which skills you're missing and get personalised learning recommendations.", color: '#10B981' },
  { icon: CheckCircle, title: 'Application Tracking', desc: 'End-to-end pipeline: Applied → Shortlisted → Interview → Selected, with real-time notifications.', color: '#FBBF24' },
];

const howItWorks = [
  { step: '01', title: 'Upload Resume', desc: 'Upload your PDF or DOCX resume. Our parser extracts skills, experience, education and projects.' },
  { step: '02', title: 'Browse & Match', desc: 'Browse jobs and get an instant ML-powered match score showing skills, experience and similarity.' },
  { step: '03', title: 'Close the Gap', desc: 'Review your personalised skill gap report and curated learning recommendations.' },
  { step: '04', title: 'Apply & Track', desc: 'Apply in one click and track your application status in real time.' },
];

export const LandingPage: React.FC = () => {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.25rem 4rem',
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,7,5,0.92)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: 38, height: 38, background: 'var(--gradient-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={20} color="white" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>HireMatch</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started <ArrowRight size={14} /></Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', padding: '7rem 4rem 5rem', textAlign: 'center', overflow: 'hidden' }}>
        {/* Grid bg */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
        {/* Glow orbs */}
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)', top: '-200px', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <div className="badge badge-blue" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
            <Zap size={12} /> AI-Powered Recruitment Platform
          </div>

          <h1 style={{ marginBottom: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
            Find Jobs That{' '}
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Actually Match
            </span>{' '}
            Your Skills
          </h1>

          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Upload your resume, get ML-powered match scores against thousands of jobs, identify skill gaps, and land your dream role faster.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg">
              View Demo
            </Link>
          </div>
        </div>

        {/* Match card preview */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 500, margin: '4rem auto 0', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontWeight: 700 }}>Senior Full Stack Engineer</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>TechCorp Inc. · San Francisco</div>
            </div>
            <div style={{ textAlign: 'center', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', padding: '0.5rem 0.75rem' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34D399' }}>92%</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>MATCH</div>
            </div>
          </div>
          {[
            { label: 'Skills', value: 90, color: '#F97316' },
            { label: 'Experience', value: 82, color: '#FB923C' },
            { label: 'Education', value: 100, color: '#10B981' },
          ].map(bar => (
            <div key={bar.label} style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                <span>{bar.label}</span><span style={{ color: 'white', fontWeight: 600 }}>{bar.value}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${bar.value}%`, background: bar.color }} />
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1rem' }}>
            {['React ✓', 'Node.js ✓', 'MongoDB ✓', 'AWS ✓', 'Docker ✗'].map(s => (
              <span key={s} className={`skill-tag ${s.includes('✗') ? 'missing' : 'matched'}`}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '4rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '6rem 4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontWeight: 900, marginBottom: '1rem' }}>Everything you need to land your dream job</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>From AI-powered resume analysis to real-time application tracking — all in one platform.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
          {features.map(f => (
            <div key={f.title} className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <f.icon size={22} color={f.color} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '6rem 4rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontWeight: 900, marginBottom: '1rem' }}>How it works</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Four simple steps to your next role</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', maxWidth: 1000, margin: '0 auto' }}>
          {howItWorks.map((step, i) => (
            <div key={step.step} style={{ position: 'relative', textAlign: 'center', padding: '1.5rem 1rem' }}>
              {i < howItWorks.length - 1 && (
                <div style={{ position: 'absolute', top: '2.25rem', right: '-1rem', zIndex: 1, color: 'var(--text-muted)' }}>
                  <ChevronRight size={20} />
                </div>
              )}
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(59,130,246,0.3)', fontWeight: 800, fontSize: '1rem' }}>{step.step}</div>
              <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{step.title}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '6rem 4rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-xl)', padding: '4rem 3rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Zap size={40} color="var(--accent-blue)" style={{ margin: '0 auto 1.5rem', display: 'block' }} />
            <h2 style={{ fontWeight: 900, marginBottom: '1rem' }}>Ready to find your match?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>Join thousands of candidates who've found their perfect role using AI-powered matching.</p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem 4rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={16} color="var(--accent-blue)" />
          <span>HireMatch © 2026</span>
        </div>
        <div>AI-Powered · MERN + ML · Production Ready</div>
      </footer>
    </div>
  );
};
