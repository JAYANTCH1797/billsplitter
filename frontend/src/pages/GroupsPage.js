import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { groupsApi } from '../api';
import { getInitials } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
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
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/dashboard')}
                className="rounded-full"
                data-testid="back-to-dashboard-btn"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <Receipt className="w-6 h-6" strokeWidth={1.5} />
                <span className="text-xl font-bold tracking-tight">SplitSync</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate('/groups/new')} 
                className="rounded-full gap-2"
                data-testid="create-group-btn"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Group</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="user-menu-btn">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-foreground text-background text-sm">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="logout-btn">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Groups</h1>
            <p className="text-muted-foreground">Manage your expense groups</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
              data-testid="search-groups-input"
            />
          </div>
        </div>

        {filteredGroups.length === 0 ? (
          <Card className="border-border/60 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {searchTerm ? 'No groups found' : 'No groups yet'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {searchTerm 
                  ? 'Try a different search term' 
                  : 'Create a group to start splitting expenses with friends'}
              </p>
              {!searchTerm && (
                <Button onClick={() => navigate('/groups/new')} className="rounded-full" data-testid="create-first-group-btn">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Group
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3" data-testid="groups-list">
            {filteredGroups.map((group, index) => (
              <Card 
                key={group.id} 
                className="border-border/60 card-hover cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => navigate(`/groups/${group.id}`)}
                data-testid={`group-card-${group.id}`}
              >
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center">
                      <Users className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                        {group.description && ` · ${group.description}`}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default GroupsPage;
