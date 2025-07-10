import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface TaskFiltersProps {
  filters: {
    search: string;
    priority: string;
    status: string;
  };
  onFiltersChange: (filters: any) => void;
  taskStats: {
    total: number;
    pending: number;
    overdue: number;
  };
}

export default function TaskFilters({ filters, onFiltersChange, taskStats }: TaskFiltersProps) {
  const updateFilter = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value === 'all' ? '' : value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.status} onValueChange={(value) => updateFilter('status', value === 'all' ? '' : value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Tasks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>{taskStats.total} tasks total</span>
            <span>•</span>
            <span>{taskStats.pending} pending</span>
            <span>•</span>
            <span className={taskStats.overdue > 0 ? "text-red-600 font-medium" : ""}>
              {taskStats.overdue} overdue
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
