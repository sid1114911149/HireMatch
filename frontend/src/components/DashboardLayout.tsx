import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="main-content" style={{ marginLeft: 'var(--sidebar-width)', transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)' }}>
        <Topbar title={title} subtitle={subtitle} />
        <div className="page-content fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};
