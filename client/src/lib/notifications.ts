import { isBefore, addHours, format } from "date-fns";
import type { Task } from "@shared/schema";

let lastNotificationTime: Record<number, number> = {};

export function checkForDueNotifications(tasks: Task[]) {
  // Request notification permission if not already granted
  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  const now = new Date();
  const twoHoursFromNow = addHours(now, 2);

  tasks.forEach(task => {
    if (task.completed || !task.dueDate) {
      return;
    }

    const dueDate = new Date(task.dueDate);
    const taskId = task.id;
    const currentTime = now.getTime();

    // Check if we've already notified for this task recently (within 30 minutes)
    if (lastNotificationTime[taskId] && currentTime - lastNotificationTime[taskId] < 30 * 60 * 1000) {
      return;
    }

    // Task is overdue
    if (isBefore(dueDate, now)) {
      showNotification(
        "Task Overdue!",
        `"${task.title}" was due ${format(dueDate, "MMM d 'at' h:mm a")}`,
        'overdue'
      );
      lastNotificationTime[taskId] = currentTime;
    }
    // Task is due within 2 hours
    else if (isBefore(dueDate, twoHoursFromNow)) {
      const hoursUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
      showNotification(
        "Task Due Soon!",
        `"${task.title}" is due in ${hoursUntilDue} hour${hoursUntilDue === 1 ? '' : 's'}`,
        'due-soon'
      );
      lastNotificationTime[taskId] = currentTime;
    }
  });
}

function showNotification(title: string, body: string, type: 'overdue' | 'due-soon') {
  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `task-${type}`,
    requireInteraction: type === 'overdue',
  });

  // Auto-close notification after 5 seconds (except for overdue tasks)
  if (type !== 'overdue') {
    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

export function showTaskCompleteNotification(taskTitle: string) {
  if (Notification.permission === 'granted') {
    new Notification("Task Completed! 🎉", {
      body: `"${taskTitle}" has been marked as complete`,
      icon: '/favicon.ico',
      tag: 'task-complete',
    });
  }
}

export function requestNotificationPermission() {
  if (Notification.permission === 'default') {
    return Notification.requestPermission();
  }
  return Promise.resolve(Notification.permission);
}
