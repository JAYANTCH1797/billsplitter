import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsApi } from '../api';
import { Input } from '../components/ui/input';
import BottomNav from '../components/BottomNav';
import { toast } from 'sonner';
import { 
  Plus, 
  Users, 
  Search,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

const GroupsPage = () => {
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

  const groupColors = ['bg-yellow-400', 'bg-lime-400', 'bg-violet-500 text-white', 'bg-sky-400', 'bg-coral'];

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
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold">Groups</h1>
            <p className="text-xs text-muted-foreground font-mono uppercase">{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
          </div>
          <button 
            onClick={() => navigate('/groups/new')} 
            className="brutal-btn py-2 px-3 text-xs flex items-center gap-1"
            data-testid="create-group-btn"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 border-2 border-foreground rounded-none text-sm"
            data-testid="search-groups-input"
          />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {filteredGroups.length === 0 ? (
          <div className="brutal-card border-dashed p-8 text-center animate-enter">
            <div className="w-14 h-14 border-2 border-foreground mx-auto mb-4 flex items-center justify-center bg-yellow-400">
              <Users className="w-7 h-7" strokeWidth={2} />
            </div>
            <p className="font-semibold mb-1">
              {searchTerm ? 'No groups found' : 'No groups yet'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {searchTerm ? 'Try a different search' : 'Create your first group'}
            </p>
            {!searchTerm && (
              <button onClick={() => navigate('/groups/new')} className="brutal-btn text-xs" data-testid="create-first-group-btn">
                <Plus className="w-4 h-4 mr-1 inline" /> Create Group
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2" data-testid="groups-list">
            {filteredGroups.map((group, index) => (
              <div 
                key={group.id} 
                className="brutal-card-sm p-3 animate-enter"
                style={{ animationDelay: `${index * 0.03}s` }}
                onClick={() => navigate(`/groups/${group.id}`)}
                data-testid={`group-card-${group.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 border-2 border-foreground flex items-center justify-center ${groupColors[index % groupColors.length]}`}>
                    <Users className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{group.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {group.members.length} member{group.members.length !== 1 ? 's' : ''}
                      {group.description && <span className="hidden sm:inline"> · {group.description}</span>}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default GroupsPage;
