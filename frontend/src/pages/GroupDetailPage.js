import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { groupsApi, expensesApi, settlementsApi } from '../api';
import { formatCurrency, formatDate, getInitials, getAvatarColor } from '../lib/utils';
import { detectExpenseCategory } from '../lib/expenseCategories';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
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
  Calendar,
  Check
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
      toast.success('Member added successfully');
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
      toast.success('Expense added successfully');
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
      toast.success('Settlement recorded');
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
                onClick={() => navigate('/groups')}
                className="rounded-full"
                data-testid="back-btn"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-bold text-lg">{group?.name}</h1>
                <p className="text-xs text-muted-foreground">
                  {group?.members?.length} member{group?.members?.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setShowAddExpense(true)} 
                className="rounded-full gap-2"
                data-testid="add-expense-btn"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Expense</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" data-testid="group-menu-btn">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowAddMember(true)} data-testid="add-member-menu-item">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowSettlement(true)} data-testid="settle-up-menu-item">
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    Settle Up
                  </DropdownMenuItem>
                  {group?.created_by === user?.id && (
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteGroup(true)} 
                      className="text-destructive"
                      data-testid="delete-group-menu-item"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Group
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="expenses" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="expenses" data-testid="expenses-tab">Expenses</TabsTrigger>
            <TabsTrigger value="balances" data-testid="balances-tab">Balances</TabsTrigger>
            <TabsTrigger value="members" data-testid="members-tab">Members</TabsTrigger>
          </TabsList>

          {/* Expenses Tab */}
          <TabsContent value="expenses" data-testid="expenses-content">
            {expenses.length === 0 ? (
              <Card className="border-border/60 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Receipt className="w-12 h-12 text-muted-foreground/40 mb-4" strokeWidth={1.5} />
                  <h3 className="font-semibold mb-1">No expenses yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Add your first expense to get started</p>
                  <Button onClick={() => setShowAddExpense(true)} className="rounded-full" data-testid="add-first-expense-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3" data-testid="expenses-list">
                {expenses.map((expense, index) => {
                  const category = detectExpenseCategory(expense.description);
                  const CategoryIcon = category.icon;
                  return (
                    <Card 
                      key={expense.id} 
                      className="border-border/60 card-hover animate-slide-up"
                      style={{ animationDelay: `${index * 0.03}s` }}
                      data-testid={`expense-card-${expense.id}`}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${category.color}`}>
                              <CategoryIcon className="w-5 h-5" strokeWidth={1.5} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-semibold">{expense.description}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  expense.split_type === 'equal' ? 'bg-blue-100 text-blue-700' :
                                  expense.split_type === 'unequal' ? 'bg-violet-100 text-violet-700' :
                                  expense.split_type === 'parts' ? 'bg-orange-100 text-orange-700' :
                                  'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {expense.split_type}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Paid by {expense.paid_by_name} · {formatDate(expense.date)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <p className="text-lg font-bold currency">{formatCurrency(expense.amount)}</p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`expense-menu-${expense.id}`}>
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteExpense(expense.id)}
                                  className="text-destructive"
                                  data-testid={`delete-expense-${expense.id}`}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Balances Tab */}
          <TabsContent value="balances" data-testid="balances-content">
            {balances.length === 0 ? (
              <Card className="border-border/60">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Check className="w-12 h-12 text-emerald-500 mb-4" strokeWidth={1.5} />
                  <h3 className="font-semibold mb-1">All settled up!</h3>
                  <p className="text-sm text-muted-foreground">No outstanding balances</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3" data-testid="balances-list">
                {balances.map((balance, index) => (
                  <Card 
                    key={balance.user_id} 
                    className="border-border/60 animate-slide-up"
                    style={{ animationDelay: `${index * 0.03}s` }}
                    data-testid={`balance-card-${balance.user_id}`}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className={`h-10 w-10 ${getAvatarColor(index)}`}>
                            <AvatarFallback>{getInitials(balance.user_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{balance.user_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {balance.amount > 0 ? 'owes you' : 'you owe'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {balance.amount > 0 ? (
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-rose-500" />
                          )}
                          <p className={`text-lg font-bold currency ${balance.amount > 0 ? 'text-balance-positive' : 'text-balance-negative'}`}>
                            {formatCurrency(Math.abs(balance.amount))}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button 
                  onClick={() => setShowSettlement(true)} 
                  variant="outline" 
                  className="w-full mt-4 rounded-full"
                  data-testid="settle-up-btn"
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Settle Up
                </Button>
              </div>
            )}

            {/* Recent Settlements */}
            {settlements.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold mb-4">Recent Settlements</h3>
                <div className="space-y-2" data-testid="settlements-list">
                  {settlements.slice(0, 5).map((settlement) => (
                    <div 
                      key={settlement.id}
                      className="flex items-center justify-between py-3 border-b border-border/60 last:border-0"
                    >
                      <div className="text-sm">
                        <span className="font-medium">{settlement.from_user_name}</span>
                        <span className="text-muted-foreground"> paid </span>
                        <span className="font-medium">{settlement.to_user_name}</span>
                      </div>
                      <p className="font-semibold currency">{formatCurrency(settlement.amount)}</p>
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
                <Card 
                  key={member.user_id} 
                  className="border-border/60 animate-slide-up"
                  style={{ animationDelay: `${index * 0.03}s` }}
                  data-testid={`member-card-${member.user_id}`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className={`h-10 w-10 ${getAvatarColor(index)}`}>
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {member.name}
                            {member.user_id === user?.id && (
                              <span className="text-muted-foreground font-normal"> (you)</span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      {member.user_id !== group?.created_by && member.user_id !== user?.id && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveMember(member.user_id)}
                          className="text-muted-foreground hover:text-destructive"
                          data-testid={`remove-member-${member.user_id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button 
                onClick={() => setShowAddMember(true)} 
                variant="outline" 
                className="w-full mt-4 rounded-full"
                data-testid="add-member-btn"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent data-testid="add-member-dialog">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>
              Enter the email of the person you want to add to this group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                data-testid="member-email-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMember(false)} className="rounded-full">
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={isSubmitting} className="rounded-full" data-testid="add-member-submit-btn">
              {isSubmitting ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="add-expense-dialog">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Enter the details of the expense and how to split it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="e.g., Dinner, Groceries, Uber"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                data-testid="expense-description-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-7 currency"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                    data-testid="expense-amount-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                  data-testid="expense-date-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Paid by *</Label>
              <Select 
                value={expenseForm.paid_by} 
                onValueChange={(value) => setExpenseForm(prev => ({ ...prev, paid_by: value }))}
              >
                <SelectTrigger data-testid="expense-payer-select">
                  <SelectValue placeholder="Who paid?" />
                </SelectTrigger>
                <SelectContent>
                  {group?.members?.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.name} {member.user_id === user?.id && '(you)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Split Type</Label>
              <Select 
                value={expenseForm.split_type} 
                onValueChange={recalculateSplits}
              >
                <SelectTrigger data-testid="split-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal">Split Equally</SelectItem>
                  <SelectItem value="unequal">Exact Amounts</SelectItem>
                  <SelectItem value="parts">By Parts</SelectItem>
                  <SelectItem value="percentage">By Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {expenseForm.split_type !== 'equal' && (
              <div className="space-y-3" data-testid="custom-splits">
                <Label>
                  {expenseForm.split_type === 'percentage' ? 'Percentages' : 
                   expenseForm.split_type === 'parts' ? 'Parts' : 'Amounts'}
                </Label>
                {group?.members?.map((member) => {
                  const split = expenseForm.splits.find(s => s.user_id === member.user_id);
                  return (
                    <div key={member.user_id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <span className="flex-1 text-sm">{member.name}</span>
                      <div className="relative w-24">
                        {expenseForm.split_type === 'unequal' && (
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        )}
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className={`h-9 ${expenseForm.split_type === 'unequal' ? 'pl-5' : ''} currency text-right`}
                          value={split?.amount || ''}
                          onChange={(e) => updateSplitAmount(member.user_id, e.target.value)}
                          data-testid={`split-amount-${member.user_id}`}
                        />
                        {expenseForm.split_type === 'percentage' && (
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Total</span>
                  <span className={`font-semibold currency ${
                    Math.abs(expenseForm.splits.reduce((sum, s) => sum + s.amount, 0) - parseFloat(expenseForm.amount || 0)) > 0.01
                      ? 'text-destructive'
                      : ''
                  }`}>
                    {formatCurrency(expenseForm.splits.reduce((sum, s) => sum + s.amount, 0))}
                    {' / '}
                    {formatCurrency(parseFloat(expenseForm.amount) || 0)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddExpense(false)} className="rounded-full">
              Cancel
            </Button>
            <Button onClick={handleAddExpense} disabled={isSubmitting} className="rounded-full" data-testid="add-expense-submit-btn">
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settlement Dialog */}
      <Dialog open={showSettlement} onOpenChange={setShowSettlement}>
        <DialogContent data-testid="settlement-dialog">
          <DialogHeader>
            <DialogTitle>Record Settlement</DialogTitle>
            <DialogDescription>
              Record a payment between group members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Who paid?</Label>
              <Select 
                value={settlementForm.from_user} 
                onValueChange={(value) => setSettlementForm(prev => ({ ...prev, from_user: value }))}
              >
                <SelectTrigger data-testid="settlement-from-select">
                  <SelectValue placeholder="Select payer" />
                </SelectTrigger>
                <SelectContent>
                  {group?.members?.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Who received?</Label>
              <Select 
                value={settlementForm.to_user} 
                onValueChange={(value) => setSettlementForm(prev => ({ ...prev, to_user: value }))}
              >
                <SelectTrigger data-testid="settlement-to-select">
                  <SelectValue placeholder="Select receiver" />
                </SelectTrigger>
                <SelectContent>
                  {group?.members?.filter(m => m.user_id !== settlementForm.from_user).map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="settlement-amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="settlement-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-7 currency"
                  value={settlementForm.amount}
                  onChange={(e) => setSettlementForm(prev => ({ ...prev, amount: e.target.value }))}
                  data-testid="settlement-amount-input"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettlement(false)} className="rounded-full">
              Cancel
            </Button>
            <Button onClick={handleSettlement} disabled={isSubmitting} className="rounded-full" data-testid="settlement-submit-btn">
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Group Dialog */}
      <Dialog open={showDeleteGroup} onOpenChange={setShowDeleteGroup}>
        <DialogContent data-testid="delete-group-dialog">
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this group? This action cannot be undone.
              All expenses and settlements will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteGroup(false)} className="rounded-full">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteGroup} 
              disabled={isSubmitting}
              className="rounded-full"
              data-testid="delete-group-confirm-btn"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupDetailPage;
