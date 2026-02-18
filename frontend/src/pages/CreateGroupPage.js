import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsApi } from '../api';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Receipt, ArrowLeft, Users, Sparkles } from 'lucide-react';

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
      toast.success('Group created!');
      navigate(`/groups/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create group');
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    { emoji: '🏠', text: 'Roommates' },
    { emoji: '✈️', text: 'Trip to Paris' },
    { emoji: '🎉', text: 'Birthday Party' },
    { emoji: '🍕', text: 'Office Lunch' },
    { emoji: '🏕️', text: 'Camping Trip' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b-3 border-foreground">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="w-10 h-10 border-3 border-foreground bg-white flex items-center justify-center hover:bg-yellow-400 transition-colors"
                data-testid="back-btn"
              >
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-foreground flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-background" strokeWidth={2.5} />
                </div>
                <span className="text-xl font-bold tracking-tight">SPLITSYNC</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="brutal-card p-8 animate-enter">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 border-3 border-foreground mx-auto mb-4 flex items-center justify-center bg-lime-400">
              <Users className="w-10 h-10" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold mb-2">Create a Group</h1>
            <p className="text-muted-foreground font-mono text-sm">
              Start splitting expenses with friends
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold uppercase text-xs tracking-wider">Group Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Trip to Hawaii"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 text-lg border-3 border-foreground rounded-none font-bold"
                data-testid="group-name-input"
              />
              
              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-2 mt-3">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setName(suggestion.text)}
                    className="sticker sticker-yellow hover:scale-105 transition-transform cursor-pointer"
                    style={{ transform: `rotate(${(index - 2) * 2}deg)` }}
                  >
                    {suggestion.emoji} {suggestion.text}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-bold uppercase text-xs tracking-wider">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What's this group for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="border-3 border-foreground rounded-none font-mono resize-none"
                data-testid="group-description-input"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="button" 
                className="brutal-btn-outline flex-1 py-4"
                onClick={() => navigate(-1)}
                data-testid="cancel-btn"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="brutal-btn flex-1 py-4 flex items-center justify-center gap-2"
                disabled={isLoading}
                data-testid="create-group-submit-btn"
              >
                {isLoading ? (
                  'Creating...'
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" strokeWidth={2.5} />
                    Create Group
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Fun fact */}
        <p className="text-center text-xs text-muted-foreground font-mono mt-8 animate-enter delay-2">
          💡 PRO TIP: Add members after creating the group
        </p>
      </main>
    </div>
  );
};

export default CreateGroupPage;
