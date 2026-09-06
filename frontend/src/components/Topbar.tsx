import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title, subtitle }) => {
  const { user } = useAuth();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header style={{
      height: 'var(--topbar-height)',
      background: 'rgba(7,11,20,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div>
        {title ? (
          <>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{title}</h1>
            {subtitle && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subtitle}</p>}
          </>
        ) : (
          <>
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>
              {greeting()}, {user?.name?.split(' ')[0]} 👋
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Notification bell */}
        <button style={{
          width: 40, height: 40,
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'var(--transition)',
          position: 'relative',
        }}>
          <Bell size={18} />
          <span style={{
            position: 'absolute',
            top: 6, right: 6,
            width: 8, height: 8,
            borderRadius: '50%',
            background: 'var(--accent-rose)',
            border: '1px solid var(--bg-secondary)',
          }} />
        </button>

        {/* Avatar */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--gradient-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
          boxShadow: '0 0 0 2px rgba(59,130,246,0.3)',
        }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};
