import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../lib/utils';
import BottomNav from '../components/BottomNav';
import { toast } from 'sonner';
import { LogOut, User, Bell, Shield, HelpCircle, ChevronRight } from 'lucide-react';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('See you later!');
  };

  const settingsItems = [
    { icon: User, label: 'Edit Profile', action: () => toast.info('Coming soon!') },
    { icon: Bell, label: 'Notifications', action: () => toast.info('Coming soon!') },
    { icon: Shield, label: 'Privacy & Security', action: () => toast.info('Coming soon!') },
    { icon: HelpCircle, label: 'Help & Support', action: () => toast.info('Coming soon!') },
  ];

  return (
    <div className="page-content bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b-2 border-foreground px-4 py-3">
        <h1 className="text-xl font-bold">Settings</h1>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {/* Profile Card */}
        <div className="brutal-card p-4 mb-4 animate-enter">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 border-2 border-foreground bg-yellow-400 flex items-center justify-center font-bold text-lg">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">{user?.name}</p>
              <p className="text-sm text-muted-foreground font-mono">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Settings List */}
        <div className="brutal-card overflow-hidden animate-enter delay-1">
          {settingsItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.action}
                className={`w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors ${
                  index !== 0 ? 'border-t-2 border-foreground' : ''
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
                <span className="flex-1 font-medium text-sm">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full brutal-btn mt-4 py-4 flex items-center justify-center gap-2 animate-enter delay-2"
          data-testid="logout-btn"
        >
          <LogOut className="w-4 h-4" strokeWidth={2.5} />
          Log Out
        </button>

        {/* App Info */}
        <p className="text-center text-xs text-muted-foreground font-mono mt-6 animate-enter delay-3">
          SPLITSYNC v1.0 • MADE WITH ❤️
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default SettingsPage;
