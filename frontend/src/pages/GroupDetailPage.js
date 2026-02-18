import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { groupsApi, expensesApi, settlementsApi } from '../api';
import { formatCurrency, formatDate, getInitials, getAvatarColor } from '../lib/utils';
import { detectExpenseCategory } from '../lib/expenseCategories';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { 
  Receipt, 
  ArrowLeft,
  Plus,
  Users,
  Trash2,
  MoreVertical,
  UserPlus,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Check,
  Zap
} from 'lucide-react';

const GroupDetailPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialogs
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [showDeleteGroup, setShowDeleteGroup] = useState(false);
  
  // Form states
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    paid_by: '',
    split_type: 'equal',
    date: new Date().toISOString().split('T')[0],
    splits: []
  });
  const [settlementForm, setSettlementForm] = useState({
    from_user: '',
    to_user: '',
    amount: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [groupRes, expensesRes, balancesRes, settlementsRes] = await Promise.all([
        groupsApi.get(groupId),
        expensesApi.list(groupId),
        groupsApi.getBalances(groupId),
        settlementsApi.list(groupId)
      ]);
      setGroup(groupRes.data);
      setExpenses(expensesRes.data);
      setBalances(balancesRes.data);
      setSettlements(settlementsRes.data);
    } catch (error) {
      toast.error('Failed to load group data');
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  }, [groupId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Initialize splits when opening expense dialog or when members/amount changes
  useEffect(() => {
    if (showAddExpense && group?.members) {
      const amount = parseFloat(expenseForm.amount) || 0;
      const memberCount = group.members.length;
      
      if (expenseForm.split_type === 'equal') {
        const equalShare = memberCount > 0 ? parseFloat((amount / memberCount).toFixed(2)) : 0;
        setExpenseForm(prev => ({
          ...prev,
          splits: group.members.map(m => ({
            user_id: m.user_id,
            amount: equalShare
          }))
        }));
      } else if (expenseForm.splits.length !== memberCount) {
        setExpenseForm(prev => ({
          ...prev,
          splits: group.members.map(m => ({
            user_id: m.user_id,
            amount: 0
          }))
        }));
      }
    }
  }, [showAddExpense, group?.members, expenseForm.amount, expenseForm.split_type]);

  const handleAddMember = async () => {
    if (!newMemberEmail) {
      toast.error('Please enter an email');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await groupsApi.addMember(groupId, newMemberEmail);
      toast.success('Member added!');
      setNewMemberEmail('');
      setShowAddMember(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await groupsApi.removeMember(groupId, userId);
      toast.success('Member removed');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to remove member');
    }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.paid_by) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(expenseForm.amount);
    const splitsTotal = expenseForm.splits.reduce((sum, s) => sum + s.amount, 0);
    
    if (Math.abs(splitsTotal - amount) > 0.01) {
      toast.error(`Split amounts (${formatCurrency(splitsTotal)}) must equal total (${formatCurrency(amount)})`);
      return;
    }

    setIsSubmitting(true);
    try {
      await expensesApi.create({
        group_id: groupId,
        description: expenseForm.description,
        amount: amount,
        paid_by: expenseForm.paid_by,
        split_type: expenseForm.split_type,
        splits: expenseForm.splits,
        date: expenseForm.date
      });
      toast.success('Expense added!');
      setShowAddExpense(false);
      setExpenseForm({
        description: '',
        amount: '',
        paid_by: '',
        split_type: 'equal',
        date: new Date().toISOString().split('T')[0],
        splits: []
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await expensesApi.delete(expenseId);
      toast.success('Expense deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const handleSettlement = async () => {
    if (!settlementForm.from_user || !settlementForm.to_user || !settlementForm.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await settlementsApi.create({
        group_id: groupId,
        from_user: settlementForm.from_user,
        to_user: settlementForm.to_user,
        amount: parseFloat(settlementForm.amount)
      });
      toast.success('Settlement recorded!');
      setShowSettlement(false);
      setSettlementForm({ from_user: '', to_user: '', amount: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to record settlement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async () => {
    setIsSubmitting(true);
    try {
      await groupsApi.delete(groupId);
      toast.success('Group deleted');
      navigate('/groups');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSplitAmount = (userId, value) => {
    const amount = parseFloat(value) || 0;
    setExpenseForm(prev => ({
      ...prev,
      splits: prev.splits.map(s => 
        s.user_id === userId ? { ...s, amount } : s
      )
    }));
  };

  const recalculateSplits = (type) => {
    const amount = parseFloat(expenseForm.amount) || 0;
    const memberCount = group?.members?.length || 1;
    
    if (type === 'equal') {
      const equalShare = parseFloat((amount / memberCount).toFixed(2));
      setExpenseForm(prev => ({
        ...prev,
        split_type: type,
        splits: group.members.map(m => ({
          user_id: m.user_id,
          amount: equalShare
        }))
      }));
    } else {
      setExpenseForm(prev => ({
        ...prev,
        split_type: type
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="brutal-card p-8">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  const memberColors = ['bg-yellow-400', 'bg-lime-400', 'bg-violet-500 text-white', 'bg-sky-400', 'bg-coral'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b-3 border-foreground">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/groups')}
                className="w-10 h-10 border-3 border-foreground bg-white flex items-center justify-center hover:bg-yellow-400 transition-colors"
                data-testid="back-btn"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <div>
                <h1 className="font-bold text-xl">{group?.name}</h1>
                <p className="text-xs text-muted-foreground font-mono uppercase">
                  {group?.members?.length} member{group?.members?.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowAddExpense(true)} 
                className="brutal-btn flex items-center gap-2 py-2 px-4"
                data-testid="add-expense-btn"
              >
                <Plus className="w-4 h-4" strokeWidth={3} />
                <span className="hidden sm:inline">Add Expense</span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 border-3 border-foreground bg-white flex items-center justify-center hover:bg-muted transition-colors" data-testid="group-menu-btn">
                    <MoreVertical className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-3 border-foreground rounded-none shadow-[4px_4px_0px_hsl(var(--foreground))]">
                  <DropdownMenuItem onClick={() => setShowAddMember(true)} className="font-bold cursor-pointer" data-testid="add-member-menu-item">
                    <UserPlus className="mr-2 h-4 w-4" strokeWidth={2.5} />
                    ADD MEMBER
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowSettlement(true)} className="font-bold cursor-pointer" data-testid="settle-up-menu-item">
                    <ArrowRightLeft className="mr-2 h-4 w-4" strokeWidth={2.5} />
                    SETTLE UP
                  </DropdownMenuItem>
                  {group?.created_by === user?.id && (
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteGroup(true)} 
                      className="font-bold cursor-pointer text-red-600"
                      data-testid="delete-group-menu-item"
                    >
                      <Trash2 className="mr-2 h-4 w-4" strokeWidth={2.5} />
                      DELETE GROUP
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="w-full border-3 border-foreground rounded-none p-0 h-auto bg-transparent mb-6">
            <TabsTrigger 
              value="expenses" 
              className="flex-1 py-3 font-bold uppercase rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background border-r-3 border-foreground"
              data-testid="expenses-tab"
            >
              Expenses
            </TabsTrigger>
            <TabsTrigger 
              value="balances" 
              className="flex-1 py-3 font-bold uppercase rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background border-r-3 border-foreground"
              data-testid="balances-tab"
            >
              Balances
            </TabsTrigger>
            <TabsTrigger 
              value="members" 
              className="flex-1 py-3 font-bold uppercase rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background"
              data-testid="members-tab"
            >
              Members
            </TabsTrigger>
          </TabsList>

          {/* Expenses Tab */}
          <TabsContent value="expenses" data-testid="expenses-content">
            {expenses.length === 0 ? (
              <div className="brutal-card border-dashed p-12 text-center animate-enter">
                <div className="w-20 h-20 border-3 border-foreground mx-auto mb-4 flex items-center justify-center bg-yellow-400">
                  <Receipt className="w-10 h-10" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-xl mb-2">No expenses yet!</h3>
                <p className="text-muted-foreground mb-6 font-mono text-sm">
                  Add your first expense to get started
                </p>
                <button onClick={() => setShowAddExpense(true)} className="brutal-btn" data-testid="add-first-expense-btn">
                  <Plus className="w-4 h-4 mr-2 inline" strokeWidth={3} />
                  Add Expense
                </button>
              </div>
            ) : (
              <div className="space-y-3" data-testid="expenses-list">
                {expenses.map((expense, index) => {
                  const category = detectExpenseCategory(expense.description);
                  const CategoryIcon = category.icon;
                  return (
                    <div 
                      key={expense.id} 
                      className="brutal-card p-4 animate-enter"
                      style={{ animationDelay: `${index * 0.03}s` }}
                      data-testid={`expense-card-${expense.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`category-icon flex-shrink-0 ${
                            category.id === 'groceries' ? 'category-groceries' :
                            category.id === 'restaurant' ? 'category-restaurant' :
                            category.id === 'coffee' ? 'category-coffee' :
                            category.id === 'movies' ? 'category-movies' :
                            category.id === 'travel' || category.id === 'car' ? 'category-travel' :
                            'category-default'
                          }`}>
                            <CategoryIcon className="w-6 h-6" strokeWidth={2} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-bold text-lg">{expense.description}</h3>
                              <span className={`sticker text-[10px] ${
                                expense.split_type === 'equal' ? 'sticker-sky' :
                                expense.split_type === 'unequal' ? 'sticker-violet' :
                                expense.split_type === 'parts' ? 'sticker-coral' :
                                'sticker-lime'
                              }`}>
                                {expense.split_type}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">
                              Paid by {expense.paid_by_name} · {formatDate(expense.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <p className="text-2xl font-bold currency">{formatCurrency(expense.amount)}</p>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="w-8 h-8 border-2 border-foreground flex items-center justify-center hover:bg-muted" data-testid={`expense-menu-${expense.id}`}>
                                <MoreVertical className="w-4 h-4" strokeWidth={2.5} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="border-3 border-foreground rounded-none">
                              <DropdownMenuItem 
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="font-bold cursor-pointer text-red-600"
                                data-testid={`delete-expense-${expense.id}`}
                              >
                                <Trash2 className="mr-2 h-4 w-4" strokeWidth={2.5} />
                                DELETE
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Balances Tab */}
          <TabsContent value="balances" data-testid="balances-content">
            {balances.length === 0 ? (
              <div className="brutal-card-lime p-12 text-center animate-enter">
                <div className="w-20 h-20 border-3 border-foreground mx-auto mb-4 flex items-center justify-center bg-white">
                  <Check className="w-10 h-10" strokeWidth={3} />
                </div>
                <h3 className="font-bold text-2xl mb-2">All Settled Up! 🎉</h3>
                <p className="font-mono text-sm">No outstanding balances</p>
              </div>
            ) : (
              <div className="space-y-3" data-testid="balances-list">
                {balances.map((balance, index) => (
                  <div 
                    key={balance.user_id} 
                    className={`brutal-card p-5 animate-enter ${balance.amount > 0 ? 'border-l-8 border-l-lime-400' : 'border-l-8 border-l-coral'}`}
                    style={{ animationDelay: `${index * 0.03}s` }}
                    data-testid={`balance-card-${balance.user_id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 border-3 border-foreground flex items-center justify-center font-bold ${memberColors[index % memberColors.length]}`}>
                          {getInitials(balance.user_name)}
                        </div>
                        <div>
                          <p className="font-bold text-lg">{balance.user_name}</p>
                          <p className="text-sm font-mono text-muted-foreground uppercase">
                            {balance.amount > 0 ? 'owes you' : 'you owe them'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {balance.amount > 0 ? (
                          <TrendingUp className="w-6 h-6 text-lime-600" strokeWidth={2.5} />
                        ) : (
                          <TrendingDown className="w-6 h-6 text-red-500" strokeWidth={2.5} />
                        )}
                        <p className={`text-2xl font-bold currency ${balance.amount > 0 ? 'balance-positive' : 'balance-negative'}`}>
                          {formatCurrency(Math.abs(balance.amount))}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => setShowSettlement(true)} 
                  className="brutal-btn-outline w-full py-4 mt-4"
                  data-testid="settle-up-btn"
                >
                  <ArrowRightLeft className="w-5 h-5 mr-2 inline" strokeWidth={2.5} />
                  SETTLE UP
                </button>
              </div>
            )}

            {/* Recent Settlements */}
            {settlements.length > 0 && (
              <div className="mt-8">
                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" strokeWidth={2.5} />
                  Recent Settlements
                </h3>
                <div className="brutal-card divide-y-3 divide-foreground" data-testid="settlements-list">
                  {settlements.slice(0, 5).map((settlement) => (
                    <div key={settlement.id} className="p-4 flex items-center justify-between">
                      <div className="font-mono text-sm">
                        <span className="font-bold">{settlement.from_user_name}</span>
                        <span className="text-muted-foreground"> paid </span>
                        <span className="font-bold">{settlement.to_user_name}</span>
                      </div>
                      <p className="font-bold currency">{formatCurrency(settlement.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" data-testid="members-content">
            <div className="space-y-3">
              {group?.members?.map((member, index) => (
                <div 
                  key={member.user_id} 
                  className="brutal-card p-4 animate-enter"
                  style={{ animationDelay: `${index * 0.03}s` }}
                  data-testid={`member-card-${member.user_id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 border-3 border-foreground flex items-center justify-center font-bold ${memberColors[index % memberColors.length]}`}>
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <p className="font-bold text-lg">
                          {member.name}
                          {member.user_id === user?.id && (
                            <span className="sticker sticker-yellow ml-2 text-[10px]">you</span>
                          )}
                          {member.user_id === group?.created_by && (
                            <span className="sticker sticker-violet ml-2 text-[10px]">admin</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground font-mono">{member.email}</p>
                      </div>
                    </div>
                    {member.user_id !== group?.created_by && member.user_id !== user?.id && (
                      <button 
                        onClick={() => handleRemoveMember(member.user_id)}
                        className="w-10 h-10 border-3 border-foreground flex items-center justify-center hover:bg-red-100 hover:border-red-500 transition-colors"
                        data-testid={`remove-member-${member.user_id}`}
                      >
                        <Trash2 className="w-5 h-5 text-red-500" strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button 
                onClick={() => setShowAddMember(true)} 
                className="brutal-btn-outline w-full py-4 mt-4"
                data-testid="add-member-btn"
              >
                <UserPlus className="w-5 h-5 mr-2 inline" strokeWidth={2.5} />
                ADD MEMBER
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="border-3 border-foreground rounded-none shadow-[8px_8px_0px_hsl(var(--foreground))] max-w-md" data-testid="add-member-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add Member</DialogTitle>
            <DialogDescription className="font-mono text-sm">
              Enter the email of the person you want to add
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold uppercase text-xs">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="h-12 border-3 border-foreground rounded-none font-mono"
                data-testid="member-email-input"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setShowAddMember(false)} className="brutal-btn-outline px-6 py-3">
              Cancel
            </button>
            <button onClick={handleAddMember} disabled={isSubmitting} className="brutal-btn px-6 py-3" data-testid="add-member-submit-btn">
              {isSubmitting ? 'Adding...' : 'Add Member'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
        <DialogContent className="border-3 border-foreground rounded-none shadow-[8px_8px_0px_hsl(var(--foreground))] max-w-lg max-h-[90vh] overflow-y-auto" data-testid="add-expense-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add Expense</DialogTitle>
            <DialogDescription className="font-mono text-sm">
              Enter the details and how to split it
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="font-bold uppercase text-xs">Description *</Label>
              <Input
                id="description"
                placeholder="e.g., Dinner, Groceries, Uber"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                className="h-12 border-3 border-foreground rounded-none"
                data-testid="expense-description-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="font-bold uppercase text-xs">Amount *</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="h-12 pl-8 border-3 border-foreground rounded-none currency text-lg"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                    data-testid="expense-amount-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="font-bold uppercase text-xs">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                  className="h-12 border-3 border-foreground rounded-none font-mono"
                  data-testid="expense-date-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold uppercase text-xs">Paid by *</Label>
              <Select 
                value={expenseForm.paid_by} 
                onValueChange={(value) => setExpenseForm(prev => ({ ...prev, paid_by: value }))}
              >
                <SelectTrigger className="h-12 border-3 border-foreground rounded-none font-bold" data-testid="expense-payer-select">
                  <SelectValue placeholder="Who paid?" />
                </SelectTrigger>
                <SelectContent className="border-3 border-foreground rounded-none">
                  {group?.members?.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id} className="font-bold">
                      {member.name} {member.user_id === user?.id && '(you)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t-3 border-foreground pt-4">
              <Label className="font-bold uppercase text-xs">Split Type</Label>
              <Select 
                value={expenseForm.split_type} 
                onValueChange={recalculateSplits}
              >
                <SelectTrigger className="h-12 border-3 border-foreground rounded-none font-bold mt-2" data-testid="split-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-3 border-foreground rounded-none">
                  <SelectItem value="equal" className="font-bold">Split Equally</SelectItem>
                  <SelectItem value="unequal" className="font-bold">Exact Amounts</SelectItem>
                  <SelectItem value="parts" className="font-bold">By Parts</SelectItem>
                  <SelectItem value="percentage" className="font-bold">By Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {expenseForm.split_type !== 'equal' && (
              <div className="space-y-3 brutal-card p-4" data-testid="custom-splits">
                <Label className="font-bold uppercase text-xs">
                  {expenseForm.split_type === 'percentage' ? 'Percentages' : 
                   expenseForm.split_type === 'parts' ? 'Parts' : 'Amounts'}
                </Label>
                {group?.members?.map((member, index) => {
                  const split = expenseForm.splits.find(s => s.user_id === member.user_id);
                  return (
                    <div key={member.user_id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 border-2 border-foreground flex items-center justify-center font-bold text-xs ${memberColors[index % memberColors.length]}`}>
                        {getInitials(member.name)}
                      </div>
                      <span className="flex-1 font-bold text-sm">{member.name}</span>
                      <div className="relative w-24">
                        {expenseForm.split_type === 'unequal' && (
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-sm">$</span>
                        )}
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className={`h-10 ${expenseForm.split_type === 'unequal' ? 'pl-6' : ''} border-3 border-foreground rounded-none currency text-right font-bold`}
                          value={split?.amount || ''}
                          onChange={(e) => updateSplitAmount(member.user_id, e.target.value)}
                          data-testid={`split-amount-${member.user_id}`}
                        />
                        {expenseForm.split_type === 'percentage' && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-sm">%</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between text-sm pt-3 border-t-2 border-foreground">
                  <span className="font-bold uppercase text-xs">Total</span>
                  <span className={`font-bold currency ${
                    Math.abs(expenseForm.splits.reduce((sum, s) => sum + s.amount, 0) - parseFloat(expenseForm.amount || 0)) > 0.01
                      ? 'text-red-500'
                      : 'text-lime-600'
                  }`}>
                    {formatCurrency(expenseForm.splits.reduce((sum, s) => sum + s.amount, 0))}
                    {' / '}
                    {formatCurrency(parseFloat(expenseForm.amount) || 0)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setShowAddExpense(false)} className="brutal-btn-outline px-6 py-3">
              Cancel
            </button>
            <button onClick={handleAddExpense} disabled={isSubmitting} className="brutal-btn px-6 py-3" data-testid="add-expense-submit-btn">
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settlement Dialog */}
      <Dialog open={showSettlement} onOpenChange={setShowSettlement}>
        <DialogContent className="border-3 border-foreground rounded-none shadow-[8px_8px_0px_hsl(var(--foreground))] max-w-md" data-testid="settlement-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Record Settlement</DialogTitle>
            <DialogDescription className="font-mono text-sm">
              Record a payment between group members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-bold uppercase text-xs">Who paid?</Label>
              <Select 
                value={settlementForm.from_user} 
                onValueChange={(value) => setSettlementForm(prev => ({ ...prev, from_user: value }))}
              >
                <SelectTrigger className="h-12 border-3 border-foreground rounded-none font-bold" data-testid="settlement-from-select">
                  <SelectValue placeholder="Select payer" />
                </SelectTrigger>
                <SelectContent className="border-3 border-foreground rounded-none">
                  {group?.members?.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id} className="font-bold">
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-bold uppercase text-xs">Who received?</Label>
              <Select 
                value={settlementForm.to_user} 
                onValueChange={(value) => setSettlementForm(prev => ({ ...prev, to_user: value }))}
              >
                <SelectTrigger className="h-12 border-3 border-foreground rounded-none font-bold" data-testid="settlement-to-select">
                  <SelectValue placeholder="Select receiver" />
                </SelectTrigger>
                <SelectContent className="border-3 border-foreground rounded-none">
                  {group?.members?.filter(m => m.user_id !== settlementForm.from_user).map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id} className="font-bold">
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="settlement-amount" className="font-bold uppercase text-xs">Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg">$</span>
                <Input
                  id="settlement-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="h-12 pl-8 border-3 border-foreground rounded-none currency text-lg"
                  value={settlementForm.amount}
                  onChange={(e) => setSettlementForm(prev => ({ ...prev, amount: e.target.value }))}
                  data-testid="settlement-amount-input"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setShowSettlement(false)} className="brutal-btn-outline px-6 py-3">
              Cancel
            </button>
            <button onClick={handleSettlement} disabled={isSubmitting} className="brutal-btn px-6 py-3" data-testid="settlement-submit-btn">
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Dialog */}
      <Dialog open={showDeleteGroup} onOpenChange={setShowDeleteGroup}>
        <DialogContent className="border-3 border-foreground rounded-none shadow-[8px_8px_0px_hsl(var(--foreground))] max-w-md" data-testid="delete-group-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600">Delete Group</DialogTitle>
            <DialogDescription className="font-mono text-sm">
              This action cannot be undone. All expenses and settlements will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <button onClick={() => setShowDeleteGroup(false)} className="brutal-btn-outline px-6 py-3">
              Cancel
            </button>
            <button 
              onClick={handleDeleteGroup} 
              disabled={isSubmitting}
              className="brutal-btn bg-red-500 border-red-500 hover:bg-red-600 px-6 py-3"
              data-testid="delete-group-confirm-btn"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Forever'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupDetailPage;
