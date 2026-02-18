import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api';
import { formatCurrency, formatDate } from '../lib/utils';
import { detectExpenseCategory } from '../lib/expenseCategories';
import BottomNav from '../components/BottomNav';
import { toast } from 'sonner';
import { Activity as ActivityIcon, RefreshCw } from 'lucide-react';

const ActivityPage = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const response = await dashboardApi.get();
      setExpenses(response.data.recent_expenses || []);
    } catch (error) {
      toast.error('Failed to load activity');
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

  return (
    <div className="page-content bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b-2 border-foreground px-4 py-3">
        <h1 className="text-xl font-bold">Activity</h1>
        <p className="text-xs text-muted-foreground font-mono uppercase">Recent transactions</p>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {expenses.length === 0 ? (
          <div className="brutal-card p-8 text-center animate-enter">
            <ActivityIcon className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense, index) => {
              const category = detectExpenseCategory(expense.description);
              const CategoryIcon = category.icon;
              return (
                <div 
                  key={expense.id}
                  className="brutal-card-sm p-3 animate-enter"
                  style={{ animationDelay: `${index * 0.03}s` }}
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
                        {expense.group_name} · {formatDate(expense.date)}
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
      </main>

      <BottomNav />
    </div>
  );
};

export default ActivityPage;
