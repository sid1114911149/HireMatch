import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Candidate
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { ProfilePage } from './pages/candidate/ProfilePage';
import { ResumePage } from './pages/candidate/ResumePage';
import { JobsPage } from './pages/candidate/JobsPage';
import { RecommendationsPage } from './pages/candidate/RecommendationsPage';
import { SavedJobsPage } from './pages/candidate/SavedJobsPage';
import { ApplicationsPage } from './pages/candidate/ApplicationsPage';
import { SkillGapPage } from './pages/candidate/SkillGapPage';

// Recruiter
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard';
import { CreateJobPage } from './pages/recruiter/CreateJobPage';
import { ManageJobsPage } from './pages/recruiter/ManageJobsPage';
import { RecruiterApplicationsPage } from './pages/recruiter/RecruiterApplicationsPage';

// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

// ── Protected Route ──────────────────────────────────────────────────────────

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            border: '3px solid rgba(249,115,22,0.25)',
            borderTopColor: '#F97316',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 1rem',
          }} />
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading HireMatch...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHome(user.role)} replace />;
  }
  return <>{children}</>;
};

const getRoleHome = (role: string) => {
  if (role === 'RECRUITER') return '/recruiter/dashboard';
  if (role === 'ADMIN') return '/admin/dashboard';
  return '/candidate/dashboard';
};

// ── Root Redirect ────────────────────────────────────────────────────────────

const RootRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <LandingPage />;
  return <Navigate to={getRoleHome(user.role)} replace />;
};

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1C2333',
              color: '#F9FAFB',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#1C2333' } },
            error: { iconTheme: { primary: '#F43F5E', secondary: '#1C2333' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Candidate */}
          <Route path="/candidate/dashboard" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><CandidateDashboard /></ProtectedRoute>} />
          <Route path="/candidate/profile" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><ProfilePage /></ProtectedRoute>} />
          <Route path="/candidate/resume" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><ResumePage /></ProtectedRoute>} />
          <Route path="/candidate/analysis" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><ResumePage /></ProtectedRoute>} />
          <Route path="/candidate/jobs" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><JobsPage /></ProtectedRoute>} />
          <Route path="/candidate/recommendations" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><RecommendationsPage /></ProtectedRoute>} />
          <Route path="/candidate/saved-jobs" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><SavedJobsPage /></ProtectedRoute>} />
          <Route path="/candidate/applications" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><ApplicationsPage /></ProtectedRoute>} />
          <Route path="/candidate/skill-gap" element={<ProtectedRoute allowedRoles={['CANDIDATE']}><SkillGapPage /></ProtectedRoute>} />

          {/* Recruiter */}
          <Route path="/recruiter/dashboard" element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterDashboard /></ProtectedRoute>} />
          <Route path="/recruiter/create-job" element={<ProtectedRoute allowedRoles={['RECRUITER']}><CreateJobPage /></ProtectedRoute>} />
          <Route path="/recruiter/jobs" element={<ProtectedRoute allowedRoles={['RECRUITER']}><ManageJobsPage /></ProtectedRoute>} />
          <Route path="/recruiter/applications" element={<ProtectedRoute allowedRoles={['RECRUITER']}><RecruiterApplicationsPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
