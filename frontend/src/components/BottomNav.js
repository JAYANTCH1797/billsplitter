import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, Activity, Settings } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/groups', icon: Users, label: 'Groups' },
    { path: '/activity', icon: Activity, label: 'Activity' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname.startsWith('/groups/');
    }
    return location.pathname === path;
  };

  return (
    <nav className="bottom-nav" data-testid="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
            data-testid={`nav-${item.label.toLowerCase()}`}
          >
            <div className="nav-icon-bg">
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
