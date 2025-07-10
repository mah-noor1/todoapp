import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TaskCard from "@/components/task-card";
import type { Task } from "@shared/schema";

interface TaskListProps {
  tasks: Task[];
  onRefetch: () => void;
}

export default function TaskList({ tasks, onRefetch }: TaskListProps) {
  const groupedTasks = {
    high: tasks.filter(task => task.priority === 'high'),
    medium: tasks.filter(task => task.priority === 'medium'),
    low: tasks.filter(task => task.priority === 'low'),
  };

  const PrioritySection = ({ 
    priority, 
    tasks, 
    title, 
    color 
  }: { 
    priority: string; 
    tasks: Task[]; 
    title: string; 
    color: string;
  }) => (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 border-b border-gray-200 bg-gray-50">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <span className={`w-3 h-3 rounded-full mr-3 ${color}`}></span>
          {title}
          <Badge variant="secondary" className="ml-2">
            {tasks.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No {priority} priority tasks
          </div>
        ) : (
          <div className="space-y-0">
            {tasks.map((task) => (
              <div key={task.id} className="border-b border-gray-100 last:border-b-0">
                <TaskCard
                  task={task}
                  onRefetch={onRefetch}
                  className="border-0 rounded-none shadow-none"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PrioritySection
        priority="high"
        tasks={groupedTasks.high}
        title="High Priority Tasks"
        color="bg-red-500"
      />
      
      <PrioritySection
        priority="medium"
        tasks={groupedTasks.medium}
        title="Medium Priority Tasks"
        color="bg-yellow-500"
      />
      
      <PrioritySection
        priority="low"
        tasks={groupedTasks.low}
        title="Low Priority Tasks"
        color="bg-green-500"
      />
    </div>
  );
}
