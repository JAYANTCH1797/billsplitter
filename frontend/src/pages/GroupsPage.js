import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { groupsApi } from '../api';
import { getInitials } from '../lib/utils';
import { Input } from '../components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { 
  Receipt, 
  Plus, 
  Users, 
  ArrowLeft,
  Search,
  LogOut,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

const GroupsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await groupsApi.list();
      setGroups(response.data);
    } catch (error) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('See you later!');
  };

  const groupColors = ['bg-yellow-400', 'bg-lime-400', 'bg-violet-500 text-white', 'bg-sky-400', 'bg-coral'];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="brutal-card p-8">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b-3 border-foreground">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-10 h-10 border-3 border-foreground bg-white flex items-center justify-center hover:bg-yellow-400 transition-colors"
                data-testid="back-to-dashboard-btn"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-foreground flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-background" strokeWidth={2.5} />
                </div>
                <span className="text-xl font-bold tracking-tight hidden sm:block">SPLITSYNC</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/groups/new')} 
                className="brutal-btn flex items-center gap-2 py-2 px-4"
                data-testid="create-group-btn"
              >
                <Plus className="w-4 h-4" strokeWidth={3} />
                <span className="hidden sm:inline">New Group</span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 border-3 border-foreground bg-yellow-400 flex items-center justify-center font-bold hover:bg-lime-400 transition-colors" data-testid="user-menu-btn">
                    {getInitials(user?.name)}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 border-3 border-foreground rounded-none shadow-[4px_4px_0px_hsl(var(--foreground))]" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="font-bold">{user?.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-foreground h-[2px]" />
                  <DropdownMenuItem onClick={handleLogout} className="font-bold cursor-pointer" data-testid="logout-btn">
                    <LogOut className="mr-2 h-4 w-4" strokeWidth={2.5} />
                    <span>LOG OUT</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="animate-enter">
            <h1 className="text-4xl font-bold mb-1">Your Groups</h1>
            <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">Manage your expense groups</p>
          </div>
          
          <div className="relative animate-enter delay-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" strokeWidth={2.5} />
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 w-full sm:w-72 border-3 border-foreground rounded-none font-mono"
              data-testid="search-groups-input"
            />
          </div>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="brutal-card border-dashed p-16 text-center animate-enter delay-2">
            <div className="w-24 h-24 border-3 border-foreground mx-auto mb-6 flex items-center justify-center bg-yellow-400">
              <Users className="w-12 h-12" strokeWidth={2} />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {searchTerm ? 'No groups found' : 'No groups yet!'}
            </h3>
            <p className="text-muted-foreground mb-8 font-mono text-sm max-w-md mx-auto">
              {searchTerm 
                ? 'Try a different search term' 
                : 'Create a group to start splitting expenses with friends'}
            </p>
            {!searchTerm && (
              <button onClick={() => navigate('/groups/new')} className="brutal-btn" data-testid="create-first-group-btn">
                <Plus className="w-5 h-5 mr-2 inline" strokeWidth={3} />
                Create Your First Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2" data-testid="groups-list">
            {filteredGroups.map((group, index) => (
              <div 
                key={group.id} 
                className="brutal-card p-5 cursor-pointer animate-enter"
                style={{ animationDelay: `${(index + 2) * 0.05}s` }}
                onClick={() => navigate(`/groups/${group.id}`)}
                data-testid={`group-card-${group.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 border-3 border-foreground flex items-center justify-center ${groupColors[index % groupColors.length]}`}>
                      <Users className="w-7 h-7" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">{group.name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">
                        {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                        {group.description && ` · ${group.description}`}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 flex-shrink-0" strokeWidth={2.5} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default GroupsPage;
