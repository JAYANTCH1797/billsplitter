import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsApi } from '../api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { toast } from 'sonner';
import { Receipt, ArrowLeft, Users } from 'lucide-react';

const CreateGroupPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await groupsApi.create({ name, description });
      toast.success('Group created successfully!');
      navigate(`/groups/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

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
                onClick={() => navigate(-1)}
                className="rounded-full"
                data-testid="back-btn"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <Receipt className="w-6 h-6" strokeWidth={1.5} />
                <span className="text-xl font-bold tracking-tight">SplitSync</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-border/60">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-foreground text-background flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <CardTitle className="text-2xl">Create a Group</CardTitle>
            <CardDescription>
              Start splitting expenses with your friends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Trip to Paris, Roommates, Office Lunch"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="group-name-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What's this group for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  data-testid="group-description-input"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 rounded-full"
                  onClick={() => navigate(-1)}
                  data-testid="cancel-btn"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 rounded-full btn-active"
                  disabled={isLoading}
                  data-testid="create-group-submit-btn"
                >
                  {isLoading ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateGroupPage;
