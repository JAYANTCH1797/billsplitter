import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, groupsApi } from '../api';
import { formatCurrency, formatDate, getInitials } from '../lib/utils';
import { detectExpenseCategory } from '../lib/expenseCategories';
import BottomNav from '../components/BottomNav';
import { toast } from 'sonner';
import { 
  Plus, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  Wallet,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <BottomNav />
      </div>
    );
  }

  const groupColors = ['bg-yellow-400', 'bg-lime-400', 'bg-violet-500 text-white', 'bg-sky-400'];

  return (
    <div className="page-content bg-background">
      {/* Header */}
      <header className="px-4 pt-4 pb-2 animate-enter">
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-1">Welcome back</p>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {user?.name?.split(' ')[0]} <span className="text-xl">👋</span>
        </h1>
      </header>

      {/* Balance Cards */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="brutal-card-lime p-3 animate-enter delay-1">
            <p className="text-[10px] font-mono uppercase opacity-70 mb-1">You're Owed</p>
            <p className="text-xl font-bold currency">{formatCurrency(dashboard?.total_owed || 0)}</p>
          </div>
          <div className="brutal-card-coral p-3 animate-enter delay-2">
            <p className="text-[10px] font-mono uppercase opacity-70 mb-1">You Owe</p>
            <p className="text-xl font-bold currency">{formatCurrency(dashboard?.total_owing || 0)}</p>
          </div>
        </div>
        
        <div className="brutal-card p-3 animate-enter delay-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Net Balance</p>
              <p className={`text-xl font-bold currency ${(dashboard?.net_balance || 0) >= 0 ? 'balance-positive' : 'balance-negative'}`}>
                {(dashboard?.net_balance || 0) >= 0 ? '+' : ''}{formatCurrency(dashboard?.net_balance || 0)}
              </p>
            </div>
            <div className="w-10 h-10 border-2 border-foreground bg-yellow-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      {/* Groups Section */}
      <section className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide">Your Groups</h2>
          <button 
            onClick={() => navigate('/groups')}
            className="text-xs font-mono text-muted-foreground flex items-center gap-1"
            data-testid="view-all-groups-btn"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="brutal-card border-dashed p-6 text-center animate-enter delay-4">
            <div className="w-12 h-12 border-2 border-foreground mx-auto mb-3 flex items-center justify-center bg-yellow-400">
              <Users className="w-6 h-6" strokeWidth={2} />
            </div>
            <p className="text-sm font-semibold mb-1">No groups yet</p>
            <p className="text-xs text-muted-foreground mb-3">Create a group to start</p>
            <button onClick={() => navigate('/groups/new')} className="brutal-btn text-xs py-2 px-4" data-testid="create-first-group-btn">
              <Plus className="w-3 h-3 mr-1 inline" /> Create Group
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.slice(0, 3).map((group, index) => (
              <div 
                key={group.id} 
                className="brutal-card-sm p-3 animate-enter"
                style={{ animationDelay: `${(index + 4) * 0.05}s` }}
                onClick={() => navigate(`/groups/${group.id}`)}
                data-testid={`group-card-${group.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 border-2 border-foreground flex items-center justify-center ${groupColors[index % groupColors.length]}`}>
                    <Users className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{group.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wide">Recent Activity</h2>
          <button 
            onClick={() => navigate('/activity')}
            className="text-xs font-mono text-muted-foreground flex items-center gap-1"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {(!dashboard?.recent_expenses || dashboard.recent_expenses.length === 0) ? (
          <div className="brutal-card p-4 text-center animate-enter">
            <p className="text-xs text-muted-foreground font-mono">No recent activity</p>
          </div>
        ) : (
          <div className="brutal-card overflow-hidden animate-enter" data-testid="recent-activity">
            {dashboard.recent_expenses.slice(0, 4).map((expense, index) => {
              const category = detectExpenseCategory(expense.description);
              const CategoryIcon = category.icon;
              return (
                <div 
                  key={expense.id} 
                  className={`p-3 ${index !== 0 ? 'border-t-2 border-foreground' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`category-icon ${
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
                      <p className="font-semibold text-sm truncate">{expense.description}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {expense.group_name}
                      </p>
                    </div>
                    <p className="font-bold currency text-sm">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          if (groups.length > 0) {
            navigate(`/groups/${groups[0].id}?action=add-expense`);
          } else {
            toast.info('Create a group first!');
            navigate('/groups/new');
          }
        }}
        className="fab"
        data-testid="fab-add-expense"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>

      <BottomNav />
    </div>
  );
};

export default DashboardPage;
