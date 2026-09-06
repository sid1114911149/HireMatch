import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, User, FileText, Briefcase, Star, BookmarkCheck,
  ClipboardList, TrendingUp, Settings, LogOut, ChevronLeft, ChevronRight,
  Users, BarChart3, Shield, Zap
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const candidateNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/candidate/dashboard' },
  { icon: User, label: 'Profile', path: '/candidate/profile' },
  { icon: FileText, label: 'My Resumes', path: '/candidate/resume' },
  { icon: Zap, label: 'AI Analysis', path: '/candidate/analysis' },
  { icon: Briefcase, label: 'Browse Jobs', path: '/candidate/jobs' },
  { icon: Star, label: 'Recommendations', path: '/candidate/recommendations' },
  { icon: BookmarkCheck, label: 'Saved Jobs', path: '/candidate/saved-jobs' },
  { icon: ClipboardList, label: 'Applications', path: '/candidate/applications' },
  { icon: TrendingUp, label: 'Skill Gap', path: '/candidate/skill-gap' },
];

const recruiterNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/recruiter/dashboard' },
  { icon: Briefcase, label: 'Post a Job', path: '/recruiter/create-job' },
  { icon: ClipboardList, label: 'My Jobs', path: '/recruiter/jobs' },
  { icon: Users, label: 'Applications', path: '/recruiter/applications' },
];

const adminNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Briefcase, label: 'Jobs', path: '/admin/jobs' },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems =
    user?.role === 'CANDIDATE' ? candidateNav :
    user?.role === 'RECRUITER' ? recruiterNav :
    adminNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: collapsed ? '70px' : 'var(--sidebar-width)',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '1.25rem 0' : '1.5rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid var(--border-color)',
        minHeight: 'var(--topbar-height)',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 36, height: 36,
              background: 'var(--gradient-primary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={18} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>HireMatch</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {user?.role === 'ADMIN' ? '⚙ Admin Panel' : user?.role === 'RECRUITER' ? '🏢 Recruiter' : '🎯 Candidate'}
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: 36, height: 36,
            background: 'var(--gradient-primary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            marginLeft: collapsed ? 0 : 'auto',
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0.75rem 0.5rem' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : undefined}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: collapsed ? '0.7rem 0' : '0.7rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '0.2rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              color: isActive ? 'white' : 'var(--text-secondary)',
              background: isActive ? 'var(--gradient-primary)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize: '0.875rem',
              transition: 'var(--transition)',
              textDecoration: 'none',
              boxShadow: isActive ? '0 4px 12px rgba(59,130,246,0.25)' : 'none',
            })}
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} color={isActive ? 'white' : 'currentColor'} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div style={{
        padding: collapsed ? '1rem 0.5rem' : '1rem',
        borderTop: '1px solid var(--border-color)',
      }}>
        {!collapsed && user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.04)',
            marginBottom: '0.75rem',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, fontWeight: 700, fontSize: '0.875rem',
            }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: collapsed ? '0.7rem 0' : '0.7rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-rose)',
            width: '100%',
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: 'transparent',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'var(--transition)',
            cursor: 'pointer',
            border: 'none',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,63,94,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={18} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
};
