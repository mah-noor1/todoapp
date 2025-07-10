import { Badge } from "@/components/ui/badge";
import { TriangleAlert, Minus, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
  className?: string;
}

export default function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const configs = {
    high: {
      icon: TriangleAlert,
      text: "High Priority",
      className: "priority-high",
    },
    medium: {
      icon: Minus,
      text: "Medium Priority", 
      className: "priority-medium",
    },
    low: {
      icon: ArrowDown,
      text: "Low Priority",
      className: "priority-low",
    },
  };

  const config = configs[priority];
  const Icon = config.icon;

  return (
    <Badge className={cn(config.className, className)} variant="outline">
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
    </Badge>
  );
}
