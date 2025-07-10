import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Inbox, Play, Eye, Check } from "lucide-react";
import TaskCard from "@/components/task-card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@shared/schema";

interface KanbanBoardProps {
  tasks: Task[];
  onRefetch: () => void;
}

export default function KanbanBoard({ tasks, onRefetch }: KanbanBoardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/tasks/${taskId}`, { 
        status,
        completed: status === 'done'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      onRefetch();
    },
    onError: () => {
      toast({ title: "Failed to update task status", variant: "destructive" });
    },
  });

  const handleStatusChange = (taskId: number, newStatus: string) => {
    updateMutation.mutate({ taskId, status: newStatus });
  };

  const columns = [
    {
      id: 'todo',
      title: 'To Do',
      icon: Inbox,
      color: 'from-blue-50 to-blue-100',
      badgeColor: 'bg-blue-100 text-blue-800',
      tasks: tasks.filter(task => task.status === 'todo'),
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      icon: Play,
      color: 'from-yellow-50 to-yellow-100',
      badgeColor: 'bg-yellow-100 text-yellow-800',
      tasks: tasks.filter(task => task.status === 'in-progress'),
    },
    {
      id: 'review',
      title: 'Review',
      icon: Eye,
      color: 'from-purple-50 to-purple-100',
      badgeColor: 'bg-purple-100 text-purple-800',
      tasks: tasks.filter(task => task.status === 'review'),
    },
    {
      id: 'done',
      title: 'Done',
      icon: Check,
      color: 'from-green-50 to-green-100',
      badgeColor: 'bg-green-100 text-green-800',
      tasks: tasks.filter(task => task.status === 'done'),
    },
  ];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: number) => {
    e.dataTransfer.setData('text/plain', taskId.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('text/plain'));
    const task = tasks.find(t => t.id === taskId);
    
    if (task && task.status !== columnId) {
      handleStatusChange(taskId, columnId);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => {
        const Icon = column.icon;
        
        return (
          <Card key={column.id} className="overflow-hidden">
            <CardHeader className={`p-4 border-b border-gray-200 bg-gradient-to-r ${column.color}`}>
              <CardTitle className="font-semibold text-gray-900 flex items-center justify-between">
                <span className="flex items-center">
                  <Icon className="text-gray-700 mr-2 h-5 w-5" />
                  {column.title}
                </span>
                <Badge className={column.badgeColor}>
                  {column.tasks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent 
              className="p-4 space-y-3 min-h-96"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {column.tasks.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No tasks in {column.title.toLowerCase()}
                </div>
              ) : (
                column.tasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="cursor-move"
                  >
                    <TaskCard
                      task={task}
                      onRefetch={onRefetch}
                      isDraggable
                      className="hover:shadow-lg transition-shadow duration-200"
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
