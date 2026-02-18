import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { groupsApi, expensesApi, settlementsApi } from '../api';
import { formatCurrency, formatDate, getInitials } from '../lib/utils';
import { detectExpenseCategory } from '../lib/expenseCategories';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import BottomNav from '../components/BottomNav';
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
  Receipt
} from 'lucide-react';

const GroupDetailPage = () => {
  const { groupId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [showDeleteGroup, setShowDeleteGroup] = useState(false);
  
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
      toast.error('Failed to load group');
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  }, [groupId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open add expense if coming from FAB
  useEffect(() => {
    if (searchParams.get('action') === 'add-expense' && group) {
      setShowAddExpense(true);
    }
  }, [searchParams, group]);

  useEffect(() => {
    if (showAddExpense && group?.members) {
      const amount = parseFloat(expenseForm.amount) || 0;
      const memberCount = group.members.length;
      
      if (expenseForm.split_type === 'equal') {
        const equalShare = memberCount > 0 ? parseFloat((amount / memberCount).toFixed(2)) : 0;
        setExpenseForm(prev => ({
          ...prev,
          splits: group.members.map(m => ({ user_id: m.user_id, amount: equalShare }))
        }));
      } else if (expenseForm.splits.length !== memberCount) {
        setExpenseForm(prev => ({
          ...prev,
          splits: group.members.map(m => ({ user_id: m.user_id, amount: 0 }))
        }));
      }
    }
  }, [showAddExpense, group?.members, expenseForm.amount, expenseForm.split_type]);

  const handleAddMember = async () => {
    if (!newMemberEmail) { toast.error('Enter an email'); return; }
    setIsSubmitting(true);
    try {
      await groupsApi.addMember(groupId, newMemberEmail);
      toast.success('Member added!');
      setNewMemberEmail('');
      setShowAddMember(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed');
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
      toast.error('Failed to remove');
    }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.paid_by) {
      toast.error('Fill in all fields');
      return;
    }
    const amount = parseFloat(expenseForm.amount);
    const splitsTotal = expenseForm.splits.reduce((sum, s) => sum + s.amount, 0);
    if (Math.abs(splitsTotal - amount) > 0.01) {
      toast.error('Split amounts must equal total');
      return;
    }
    setIsSubmitting(true);
    try {
      await expensesApi.create({
        group_id: groupId,
        description: expenseForm.description,
        amount,
        paid_by: expenseForm.paid_by,
        split_type: expenseForm.split_type,
        splits: expenseForm.splits,
        date: expenseForm.date
      });
      toast.success('Expense added!');
      setShowAddExpense(false);
      setExpenseForm({
        description: '', amount: '', paid_by: '', split_type: 'equal',
        date: new Date().toISOString().split('T')[0], splits: []
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await expensesApi.delete(expenseId);
      toast.success('Deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed');
    }
  };

  const handleSettlement = async () => {
    if (!settlementForm.from_user || !settlementForm.to_user || !settlementForm.amount) {
      toast.error('Fill all fields');
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
      toast.success('Recorded!');
      setShowSettlement(false);
      setSettlementForm({ from_user: '', to_user: '', amount: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async () => {
    setIsSubmitting(true);
    try {
      await groupsApi.delete(groupId);
      toast.success('Deleted');
      navigate('/groups');
    } catch (error) {
      toast.error('Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSplitAmount = (userId, value) => {
    setExpenseForm(prev => ({
      ...prev,
      splits: prev.splits.map(s => s.user_id === userId ? { ...s, amount: parseFloat(value) || 0 } : s)
    }));
  };

  const recalculateSplits = (type) => {
    const amount = parseFloat(expenseForm.amount) || 0;
    const memberCount = group?.members?.length || 1;
    if (type === 'equal') {
      const equalShare = parseFloat((amount / memberCount).toFixed(2));
      setExpenseForm(prev => ({
        ...prev, split_type: type,
        splits: group.members.map(m => ({ user_id: m.user_id, amount: equalShare }))
      }));
    } else {
      setExpenseForm(prev => ({ ...prev, split_type: type }));
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

  const memberColors = ['bg-yellow-400', 'bg-lime-400', 'bg-violet-500 text-white', 'bg-sky-400', 'bg-coral'];

  return (
    <div className="page-content bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background border-b-2 border-foreground px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/groups')} className="w-8 h-8 border-2 border-foreground flex items-center justify-center" data-testid="back-btn">
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base truncate">{group?.name}</h1>
            <p className="text-[10px] text-muted-foreground font-mono uppercase">
              {group?.members?.length} member{group?.members?.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => setShowAddExpense(true)} className="brutal-btn py-2 px-3 text-xs" data-testid="add-expense-btn">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 border-2 border-foreground flex items-center justify-center" data-testid="group-menu-btn">
                <MoreVertical className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-2 border-foreground rounded-none shadow-[3px_3px_0px_hsl(var(--foreground))]">
              <DropdownMenuItem onClick={() => setShowAddMember(true)} className="text-sm font-medium" data-testid="add-member-menu-item">
                <UserPlus className="mr-2 h-4 w-4" /> Add Member
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSettlement(true)} className="text-sm font-medium" data-testid="settle-up-menu-item">
                <ArrowRightLeft className="mr-2 h-4 w-4" /> Settle Up
              </DropdownMenuItem>
              {group?.created_by === user?.id && (
                <DropdownMenuItem onClick={() => setShowDeleteGroup(true)} className="text-sm font-medium text-red-600" data-testid="delete-group-menu-item">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="w-full border-b-2 border-foreground rounded-none p-0 h-auto bg-transparent sticky top-[60px] z-20">
          <TabsTrigger value="expenses" className="flex-1 py-2.5 text-xs font-bold uppercase rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background border-r-2 border-foreground" data-testid="expenses-tab">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="balances" className="flex-1 py-2.5 text-xs font-bold uppercase rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background border-r-2 border-foreground" data-testid="balances-tab">
            Balances
          </TabsTrigger>
          <TabsTrigger value="members" className="flex-1 py-2.5 text-xs font-bold uppercase rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background" data-testid="members-tab">
            Members
          </TabsTrigger>
        </TabsList>

        {/* Expenses */}
        <TabsContent value="expenses" className="px-4 py-4" data-testid="expenses-content">
          {expenses.length === 0 ? (
            <div className="brutal-card border-dashed p-6 text-center animate-enter">
              <Receipt className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-semibold mb-1">No expenses</p>
              <p className="text-xs text-muted-foreground mb-3">Add your first expense</p>
              <button onClick={() => setShowAddExpense(true)} className="brutal-btn text-xs" data-testid="add-first-expense-btn">
                <Plus className="w-3 h-3 mr-1 inline" /> Add
              </button>
            </div>
          ) : (
            <div className="space-y-2" data-testid="expenses-list">
              {expenses.map((expense, index) => {
                const category = detectExpenseCategory(expense.description);
                const CategoryIcon = category.icon;
                return (
                  <div key={expense.id} className="brutal-card-sm p-3 animate-enter" style={{ animationDelay: `${index * 0.02}s` }} data-testid={`expense-card-${expense.id}`}>
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm truncate">{expense.description}</p>
                          <span className={`sticker text-[8px] ${
                            expense.split_type === 'equal' ? 'sticker-sky' :
                            expense.split_type === 'unequal' ? 'sticker-violet' :
                            'sticker-lime'
                          }`}>{expense.split_type}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {expense.paid_by_name} · {formatDate(expense.date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold currency text-sm">{formatCurrency(expense.amount)}</p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="w-6 h-6 flex items-center justify-center" data-testid={`expense-menu-${expense.id}`}>
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-2 border-foreground rounded-none">
                            <DropdownMenuItem onClick={() => handleDeleteExpense(expense.id)} className="text-red-600 text-sm" data-testid={`delete-expense-${expense.id}`}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
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

        {/* Balances */}
        <TabsContent value="balances" className="px-4 py-4" data-testid="balances-content">
          {balances.length === 0 ? (
            <div className="brutal-card-lime p-6 text-center animate-enter">
              <Check className="w-10 h-10 mx-auto mb-2" strokeWidth={2.5} />
              <p className="font-bold text-base mb-1">All Settled! 🎉</p>
              <p className="text-xs">No outstanding balances</p>
            </div>
          ) : (
            <div className="space-y-2" data-testid="balances-list">
              {balances.map((balance, index) => (
                <div key={balance.user_id} className={`brutal-card-sm p-3 animate-enter ${balance.amount > 0 ? 'border-l-4 border-l-lime-400' : 'border-l-4 border-l-coral'}`} style={{ animationDelay: `${index * 0.02}s` }} data-testid={`balance-card-${balance.user_id}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 border-2 border-foreground flex items-center justify-center font-bold text-xs ${memberColors[index % memberColors.length]}`}>
                      {getInitials(balance.user_name)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{balance.user_name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">
                        {balance.amount > 0 ? 'owes you' : 'you owe'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {balance.amount > 0 ? <TrendingUp className="w-4 h-4 text-lime-600" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                      <p className={`font-bold currency text-sm ${balance.amount > 0 ? 'balance-positive' : 'balance-negative'}`}>
                        {formatCurrency(Math.abs(balance.amount))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setShowSettlement(true)} className="w-full brutal-btn-outline py-3 text-xs mt-2" data-testid="settle-up-btn">
                <ArrowRightLeft className="w-4 h-4 mr-1 inline" /> Settle Up
              </button>
            </div>
          )}
          {settlements.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-bold uppercase mb-2">Recent Settlements</h3>
              <div className="brutal-card-sm divide-y-2 divide-foreground" data-testid="settlements-list">
                {settlements.slice(0, 3).map((s) => (
                  <div key={s.id} className="p-3 flex items-center justify-between">
                    <p className="text-xs font-mono"><span className="font-bold">{s.from_user_name}</span> → <span className="font-bold">{s.to_user_name}</span></p>
                    <p className="font-bold currency text-xs">{formatCurrency(s.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Members */}
        <TabsContent value="members" className="px-4 py-4" data-testid="members-content">
          <div className="space-y-2">
            {group?.members?.map((member, index) => (
              <div key={member.user_id} className="brutal-card-sm p-3 animate-enter" style={{ animationDelay: `${index * 0.02}s` }} data-testid={`member-card-${member.user_id}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 border-2 border-foreground flex items-center justify-center font-bold text-sm ${memberColors[index % memberColors.length]}`}>
                    {getInitials(member.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm flex items-center gap-1 flex-wrap">
                      {member.name}
                      {member.user_id === user?.id && <span className="sticker sticker-yellow text-[8px]">you</span>}
                      {member.user_id === group?.created_by && <span className="sticker sticker-violet text-[8px]">admin</span>}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">{member.email}</p>
                  </div>
                  {member.user_id !== group?.created_by && member.user_id !== user?.id && (
                    <button onClick={() => handleRemoveMember(member.user_id)} className="w-8 h-8 flex items-center justify-center text-red-500" data-testid={`remove-member-${member.user_id}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button onClick={() => setShowAddMember(true)} className="w-full brutal-btn-outline py-3 text-xs mt-2" data-testid="add-member-btn">
              <UserPlus className="w-4 h-4 mr-1 inline" /> Add Member
            </button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="mx-4 max-w-sm" data-testid="add-member-dialog">
          <DialogHeader>
            <DialogTitle className="text-lg">Add Member</DialogTitle>
            <DialogDescription className="text-xs">Enter their email address</DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <Label className="text-xs font-bold uppercase">Email</Label>
            <Input type="email" placeholder="friend@example.com" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} className="mt-1 h-10 border-2 border-foreground rounded-none text-sm" data-testid="member-email-input" />
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setShowAddMember(false)} className="brutal-btn-outline py-2 px-4 text-xs">Cancel</button>
            <button onClick={handleAddMember} disabled={isSubmitting} className="brutal-btn py-2 px-4 text-xs" data-testid="add-member-submit-btn">
              {isSubmitting ? '...' : 'Add'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
        <DialogContent className="mx-4 max-w-sm max-h-[80vh] overflow-y-auto" data-testid="add-expense-dialog">
          <DialogHeader>
            <DialogTitle className="text-lg">Add Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs font-bold uppercase">Description</Label>
              <Input placeholder="e.g., Dinner, Groceries" value={expenseForm.description} onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))} className="mt-1 h-10 border-2 border-foreground rounded-none text-sm" data-testid="expense-description-input" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-bold uppercase">Amount</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm">$</span>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" className="h-10 pl-7 border-2 border-foreground rounded-none currency text-sm" value={expenseForm.amount} onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))} data-testid="expense-amount-input" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-bold uppercase">Date</Label>
                <Input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))} className="mt-1 h-10 border-2 border-foreground rounded-none text-sm" data-testid="expense-date-input" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold uppercase">Paid By</Label>
              <Select value={expenseForm.paid_by} onValueChange={(value) => setExpenseForm(prev => ({ ...prev, paid_by: value }))}>
                <SelectTrigger className="mt-1 h-10 border-2 border-foreground rounded-none text-sm font-medium" data-testid="expense-payer-select">
                  <SelectValue placeholder="Who paid?" />
                </SelectTrigger>
                <SelectContent className="border-2 border-foreground rounded-none">
                  {group?.members?.map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id} className="text-sm">{m.name} {m.user_id === user?.id && '(you)'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold uppercase">Split Type</Label>
              <Select value={expenseForm.split_type} onValueChange={recalculateSplits}>
                <SelectTrigger className="mt-1 h-10 border-2 border-foreground rounded-none text-sm font-medium" data-testid="split-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-2 border-foreground rounded-none">
                  <SelectItem value="equal" className="text-sm">Equal</SelectItem>
                  <SelectItem value="unequal" className="text-sm">Exact Amounts</SelectItem>
                  <SelectItem value="parts" className="text-sm">By Parts</SelectItem>
                  <SelectItem value="percentage" className="text-sm">By %</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {expenseForm.split_type !== 'equal' && (
              <div className="brutal-card-sm p-3 space-y-2" data-testid="custom-splits">
                <Label className="text-xs font-bold uppercase">
                  {expenseForm.split_type === 'percentage' ? '%' : expenseForm.split_type === 'parts' ? 'Parts' : 'Amounts'}
                </Label>
                {group?.members?.map((m, i) => (
                  <div key={m.user_id} className="flex items-center gap-2">
                    <div className={`w-7 h-7 border-2 border-foreground flex items-center justify-center font-bold text-[10px] ${memberColors[i % memberColors.length]}`}>
                      {getInitials(m.name)}
                    </div>
                    <span className="flex-1 text-xs font-medium truncate">{m.name}</span>
                    <div className="relative w-20">
                      {expenseForm.split_type === 'unequal' && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs">$</span>}
                      <Input type="number" step="0.01" min="0" className={`h-8 ${expenseForm.split_type === 'unequal' ? 'pl-5' : ''} border-2 border-foreground rounded-none currency text-xs text-right`} value={expenseForm.splits.find(s => s.user_id === m.user_id)?.amount || ''} onChange={(e) => updateSplitAmount(m.user_id, e.target.value)} data-testid={`split-amount-${m.user_id}`} />
                      {expenseForm.split_type === 'percentage' && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">%</span>}
                    </div>
                  </div>
                ))}
                <div className="flex justify-between text-xs pt-2 border-t-2 border-foreground">
                  <span className="font-bold">Total</span>
                  <span className={`font-bold currency ${Math.abs(expenseForm.splits.reduce((s, x) => s + x.amount, 0) - parseFloat(expenseForm.amount || 0)) > 0.01 ? 'text-red-500' : 'text-lime-600'}`}>
                    {formatCurrency(expenseForm.splits.reduce((s, x) => s + x.amount, 0))} / {formatCurrency(parseFloat(expenseForm.amount) || 0)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setShowAddExpense(false)} className="brutal-btn-outline py-2 px-4 text-xs">Cancel</button>
            <button onClick={handleAddExpense} disabled={isSubmitting} className="brutal-btn py-2 px-4 text-xs" data-testid="add-expense-submit-btn">
              {isSubmitting ? '...' : 'Add'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settlement Dialog */}
      <Dialog open={showSettlement} onOpenChange={setShowSettlement}>
        <DialogContent className="mx-4 max-w-sm" data-testid="settlement-dialog">
          <DialogHeader>
            <DialogTitle className="text-lg">Record Settlement</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs font-bold uppercase">Who paid?</Label>
              <Select value={settlementForm.from_user} onValueChange={(v) => setSettlementForm(prev => ({ ...prev, from_user: v }))}>
                <SelectTrigger className="mt-1 h-10 border-2 border-foreground rounded-none text-sm" data-testid="settlement-from-select">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="border-2 border-foreground rounded-none">
                  {group?.members?.map((m) => <SelectItem key={m.user_id} value={m.user_id} className="text-sm">{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold uppercase">Who received?</Label>
              <Select value={settlementForm.to_user} onValueChange={(v) => setSettlementForm(prev => ({ ...prev, to_user: v }))}>
                <SelectTrigger className="mt-1 h-10 border-2 border-foreground rounded-none text-sm" data-testid="settlement-to-select">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="border-2 border-foreground rounded-none">
                  {group?.members?.filter(m => m.user_id !== settlementForm.from_user).map((m) => <SelectItem key={m.user_id} value={m.user_id} className="text-sm">{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold uppercase">Amount</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm">$</span>
                <Input type="number" step="0.01" min="0" placeholder="0.00" className="h-10 pl-7 border-2 border-foreground rounded-none currency text-sm" value={settlementForm.amount} onChange={(e) => setSettlementForm(prev => ({ ...prev, amount: e.target.value }))} data-testid="settlement-amount-input" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setShowSettlement(false)} className="brutal-btn-outline py-2 px-4 text-xs">Cancel</button>
            <button onClick={handleSettlement} disabled={isSubmitting} className="brutal-btn py-2 px-4 text-xs" data-testid="settlement-submit-btn">
              {isSubmitting ? '...' : 'Record'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Dialog */}
      <Dialog open={showDeleteGroup} onOpenChange={setShowDeleteGroup}>
        <DialogContent className="mx-4 max-w-sm" data-testid="delete-group-dialog">
          <DialogHeader>
            <DialogTitle className="text-lg text-red-600">Delete Group</DialogTitle>
            <DialogDescription className="text-xs">This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <button onClick={() => setShowDeleteGroup(false)} className="brutal-btn-outline py-2 px-4 text-xs">Cancel</button>
            <button onClick={handleDeleteGroup} disabled={isSubmitting} className="brutal-btn bg-red-500 border-red-500 py-2 px-4 text-xs" data-testid="delete-group-confirm-btn">
              {isSubmitting ? '...' : 'Delete'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default GroupDetailPage;
