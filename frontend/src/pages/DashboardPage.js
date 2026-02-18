import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, groupsApi } from '../api';
import { formatCurrency, formatDate, getInitials } from '../lib/utils';
import { detectExpenseCategory } from '../lib/expenseCategories';
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
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  LogOut,
  Wallet,
  RefreshCw,
  Sparkles,
  Zap
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
    toast.success('See you later!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="brutal-card p-8 animate-pulse">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b-3 border-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-foreground flex items-center justify-center">
                <Receipt className="w-6 h-6 text-background" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight hidden sm:block">SPLITSYNC</span>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-10 animate-enter">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl sm:text-5xl font-bold">
              Hey, {user?.name?.split(' ')[0]}!
            </h1>
            <span className="text-4xl bounce-hover cursor-default">👋</span>
          </div>
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
            Here's your expense summary
          </p>
        </div>

        {/* Balance Cards - Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10" data-testid="balance-cards">
          <div className="brutal-card-lime p-6 animate-enter delay-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider mb-2 opacity-70">You are owed</p>
                <p className="text-4xl font-bold currency">
                  {formatCurrency(dashboard?.total_owed || 0)}
                </p>
              </div>
              <div className="w-14 h-14 border-3 border-foreground bg-white flex items-center justify-center">
                <TrendingUp className="w-7 h-7" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="brutal-card-coral p-6 animate-enter delay-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider mb-2 opacity-70">You owe</p>
                <p className="text-4xl font-bold currency">
                  {formatCurrency(dashboard?.total_owing || 0)}
                </p>
              </div>
              <div className="w-14 h-14 border-3 border-foreground bg-white flex items-center justify-center">
                <TrendingDown className="w-7 h-7" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="brutal-card p-6 animate-enter delay-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider mb-2 text-muted-foreground">Net balance</p>
                <p className={`text-4xl font-bold currency ${(dashboard?.net_balance || 0) >= 0 ? 'balance-positive' : 'balance-negative'}`}>
                  {(dashboard?.net_balance || 0) >= 0 ? '+' : ''}{formatCurrency(dashboard?.net_balance || 0)}
                </p>
              </div>
              <div className="w-14 h-14 border-3 border-foreground bg-yellow-400 flex items-center justify-center">
                <Wallet className="w-7 h-7" strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Groups Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6" strokeWidth={2.5} />
                Your Groups
              </h2>
              <button 
                onClick={() => navigate('/groups')}
                className="font-mono text-sm uppercase tracking-wider hover:underline decoration-3 underline-offset-4"
                data-testid="view-all-groups-btn"
              >
                View all →
              </button>
            </div>

            {groups.length === 0 ? (
              <div className="brutal-card border-dashed p-12 text-center animate-enter delay-4">
                <div className="w-20 h-20 border-3 border-foreground mx-auto mb-4 flex items-center justify-center bg-yellow-400">
                  <Users className="w-10 h-10" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-xl mb-2">No groups yet!</h3>
                <p className="text-muted-foreground mb-6 font-mono text-sm">
                  Create a group to start splitting expenses
                </p>
                <button onClick={() => navigate('/groups/new')} className="brutal-btn" data-testid="create-first-group-btn">
                  <Plus className="w-4 h-4 mr-2 inline" strokeWidth={3} />
                  Create Group
                </button>
              </div>
            ) : (
              <div className="space-y-3" data-testid="groups-list">
                {groups.slice(0, 5).map((group, index) => (
                  <div 
                    key={group.id} 
                    className="brutal-card p-4 cursor-pointer animate-enter"
                    style={{ animationDelay: `${(index + 4) * 0.05}s` }}
                    onClick={() => navigate(`/groups/${group.id}`)}
                    data-testid={`group-card-${group.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 border-3 border-foreground flex items-center justify-center ${
                          index % 4 === 0 ? 'bg-yellow-400' :
                          index % 4 === 1 ? 'bg-lime-400' :
                          index % 4 === 2 ? 'bg-violet-500 text-white' :
                          'bg-coral'
                        }`}>
                          <Users className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{group.name}</h3>
                          <p className="text-sm text-muted-foreground font-mono">
                            {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6" strokeWidth={2.5} />
              Activity
            </h2>
            
            {(!dashboard?.recent_expenses || dashboard.recent_expenses.length === 0) ? (
              <div className="brutal-card p-8 text-center animate-enter delay-5">
                <Receipt className="w-12 h-12 mx-auto mb-3 text-muted-foreground" strokeWidth={1.5} />
                <p className="font-mono text-sm text-muted-foreground uppercase">No recent expenses</p>
              </div>
            ) : (
              <div className="brutal-card p-0 overflow-hidden animate-enter delay-5" data-testid="recent-activity">
                <div className="divide-y-3 divide-foreground">
                  {dashboard.recent_expenses.slice(0, 6).map((expense, index) => {
                    const category = detectExpenseCategory(expense.description);
                    const CategoryIcon = category.icon;
                    return (
                      <div 
                        key={expense.id} 
                        className="p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`category-icon flex-shrink-0 ${
                            category.id === 'groceries' ? 'category-groceries' :
                            category.id === 'restaurant' ? 'category-restaurant' :
                            category.id === 'coffee' ? 'category-coffee' :
                            category.id === 'movies' ? 'category-movies' :
                            category.id === 'travel' || category.id === 'car' ? 'category-travel' :
                            'category-default'
                          }`}>
                            <CategoryIcon className="w-5 h-5" strokeWidth={2} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-bold truncate">{expense.description}</p>
                              <p className="font-bold currency whitespace-nowrap">
                                {formatCurrency(expense.amount)}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono mt-1">
                              {expense.group_name} · {formatDate(expense.date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
