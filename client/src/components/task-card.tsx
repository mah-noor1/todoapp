import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2, Calendar, Tag, Repeat, Clock, CheckCircle2 } from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import PriorityBadge from "@/components/priority-badge";
import TaskForm from "@/components/task-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Task } from "@shared/schema";

interface TaskCardProps {
  task: Task;
  onRefetch: () => void;
  isDraggable?: boolean;
  className?: string;
}

export default function TaskCard({ task, onRefetch, isDraggable = false, className }: TaskCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const response = await apiRequest("PUT", `/api/tasks/${task.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      onRefetch();
      toast({ title: "Task updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update task", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/tasks/${task.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      onRefetch();
      toast({ title: "Task deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete task", variant: "destructive" });
    },
  });

  const handleToggleComplete = () => {
    updateMutation.mutate({ completed: !task.completed });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteMutation.mutate();
    }
  };

  const isOverdue = task.dueDate && !task.completed && isBefore(new Date(task.dueDate), new Date());
  const isDueSoon = task.dueDate && !task.completed && 
    isAfter(new Date(task.dueDate), new Date()) && 
    isBefore(new Date(task.dueDate), addDays(new Date(), 2));

  const formatDueDate = (dueDate: Date | string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'}`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return format(date, "MMM d, yyyy");
    }
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      task.completed && "opacity-75",
      isDraggable && "cursor-move",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1">
            <Checkbox
              checked={task.completed}
              onCheckedChange={handleToggleComplete}
              disabled={updateMutation.isPending}
            />
            
            <div className="flex-1">
              <h4 className={cn(
                "font-medium text-gray-900",
                task.completed && "line-through"
              )}>
                {task.title}
              </h4>
              {task.description && (
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <TaskForm 
                  task={task}
                  onSuccess={() => {
                    setIsEditOpen(false);
                    onRefetch();
                  }}
                />
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-600 hover:text-red-700"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 text-xs">
          <PriorityBadge priority={task.priority as 'high' | 'medium' | 'low'} />
          
          {task.completed && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Completed
            </Badge>
          )}
          
          {task.dueDate && (
            <Badge 
              variant="outline" 
              className={cn(
                isOverdue && "bg-red-100 text-red-800 border-red-200",
                isDueSoon && "bg-orange-100 text-orange-800 border-orange-200"
              )}
            >
              <Calendar className="w-3 h-3 mr-1" />
              {formatDueDate(task.dueDate)}
            </Badge>
          )}
          
          <Badge variant="outline" className="text-gray-600">
            <Tag className="w-3 h-3 mr-1" />
            {task.category}
          </Badge>
          
          {task.isRecurring && (
            <Badge variant="outline" className="text-gray-600">
              <Repeat className="w-3 h-3 mr-1" />
              {task.recurringPattern}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
