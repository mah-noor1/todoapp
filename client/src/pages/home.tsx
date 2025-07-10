import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, CheckSquare, User, List, Columns, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import TaskForm from "@/components/task-form";
import TaskList from "@/components/task-list";
import KanbanBoard from "@/components/kanban-board";
import TaskFilters from "@/components/task-filters";
import { checkForDueNotifications } from "@/lib/notifications";
import type { Task } from "@shared/schema";

export default function Home() {
  const [currentView, setCurrentView] = useState<'list' | 'kanban'>('list');
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    status: '',
  });
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  const { data: tasks = [], isLoading, refetch } = useQuery<Task[]>({
    queryKey: ['/api/tasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.status) params.append('status', filters.status);
      
      const response = await fetch(`/api/tasks?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
  });

  // Check for due notifications every minute
  useEffect(() => {
    if (tasks.length > 0) {
      checkForDueNotifications(tasks);
    }
    
    const interval = setInterval(() => {
      if (tasks.length > 0) {
        checkForDueNotifications(tasks);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [tasks]);

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => {
      if (!t.dueDate || t.completed) return false;
      return new Date(t.dueDate) < new Date();
    }).length,
  };

  const notificationCount = taskStats.overdue;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckSquare className="text-blue-600 h-6 w-6" />
                <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
              </div>
              <span className="text-sm text-gray-500 hidden sm:inline">Priority Todo Manager</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={currentView === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('list')}
                  className="text-sm"
                >
                  <List className="w-4 h-4 mr-1" />
                  List
                </Button>
                <Button
                  variant={currentView === 'kanban' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView('kanban')}
                  className="text-sm"
                >
                  <Columns className="w-4 h-4 mr-1" />
                  Kanban
                </Button>
              </div>
              
              <div className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
              </div>
              
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="text-white h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Task Creation Dialog */}
        <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <TaskForm 
              onSuccess={() => {
                setIsTaskFormOpen(false);
                refetch();
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Task Filters */}
        <TaskFilters 
          filters={filters}
          onFiltersChange={setFilters}
          taskStats={taskStats}
        />

        {/* Task Views */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : currentView === 'list' ? (
          <TaskList tasks={tasks} onRefetch={refetch} />
        ) : (
          <KanbanBoard tasks={tasks} onRefetch={refetch} />
        )}

        {/* Floating Action Button */}
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl"
          onClick={() => setIsTaskFormOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </main>
    </div>
  );
}
