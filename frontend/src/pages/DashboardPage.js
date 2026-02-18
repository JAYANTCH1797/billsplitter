import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, groupsApi } from '../api';
import { formatCurrency, formatDate, getInitials } from '../lib/utils';
import { detectExpenseCategory } from '../lib/expenseCategories';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
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
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  LogOut,
  User,
  Wallet,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashboardRes, groupsRes] = await Promise.all([
        dashboardApi.get(),
        groupsApi.list()
      ]);
      setDashboard(dashboardRes.data);
      setGroups(groupsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

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
            <div className="flex items-center gap-3">
              <Receipt className="w-6 h-6" strokeWidth={1.5} />
              <span className="text-xl font-bold tracking-tight">SplitSync</span>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground">Here's your expense summary</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" data-testid="balance-cards">
          <Card className="border-border/60 card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">You are owed</p>
                  <p className="text-2xl font-bold currency text-balance-positive">
                    {formatCurrency(dashboard?.total_owed || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">You owe</p>
                  <p className="text-2xl font-bold currency text-balance-negative">
                    {formatCurrency(dashboard?.total_owing || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-rose-600" strokeWidth={1.5} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Net balance</p>
                  <p className={`text-2xl font-bold currency ${(dashboard?.net_balance || 0) >= 0 ? 'text-balance-positive' : 'text-balance-negative'}`}>
                    {formatCurrency(Math.abs(dashboard?.net_balance || 0))}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Groups Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Groups</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/groups')}
                className="text-muted-foreground"
                data-testid="view-all-groups-btn"
              >
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {groups.length === 0 ? (
              <Card className="border-border/60 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-semibold mb-1">No groups yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create a group to start splitting expenses</p>
                  <Button onClick={() => navigate('/groups/new')} className="rounded-full" data-testid="create-first-group-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3" data-testid="groups-list">
                {groups.slice(0, 5).map((group, index) => (
                  <Card 
                    key={group.id} 
                    className="border-border/60 card-hover cursor-pointer animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => navigate(`/groups/${group.id}`)}
                    data-testid={`group-card-${group.id}`}
                  >
                    <CardContent className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center">
                          <Users className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{group.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            
            {(!dashboard?.recent_expenses || dashboard.recent_expenses.length === 0) ? (
              <Card className="border-border/60">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Receipt className="w-10 h-10 text-muted-foreground/40 mb-3" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">No recent expenses</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/60" data-testid="recent-activity">
                <CardContent className="py-4">
                  <div className="space-y-4">
                    {dashboard.recent_expenses.slice(0, 6).map((expense, index) => {
                      const category = detectExpenseCategory(expense.description);
                      const CategoryIcon = category.icon;
                      return (
                        <div 
                          key={expense.id} 
                          className={`${index !== 0 ? 'pt-4 border-t border-border/60' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${category.color}`}>
                              <CategoryIcon className="w-4 h-4" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium truncate">{expense.description}</p>
                                <p className="font-semibold currency whitespace-nowrap text-sm">
                                  {formatCurrency(expense.amount)}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {expense.group_name} · {formatDate(expense.date)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
