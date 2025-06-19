import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell, X, Calendar, Target, CheckSquare, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Goal, ChecklistWithItems } from "@shared/schema";

interface Notification {
  id: string;
  type: 'goal' | 'checklist';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  timestamp: Date;
  itemId: number;
  read: boolean;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const { data: checklists = [] } = useQuery<ChecklistWithItems[]>({
    queryKey: ["/api/checklists"],
  });

  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: Notification[] = [];
      const now = new Date();

      // Goal notifications
      goals.forEach(goal => {
        // Overdue goals
        if (goal.targetDate && new Date(goal.targetDate) < now && goal.status !== 'completed') {
          newNotifications.push({
            id: `goal-overdue-${goal.id}`,
            type: 'goal',
            priority: 'high',
            title: 'Goal Overdue',
            message: `"${goal.title}" is past its target date`,
            timestamp: new Date(goal.targetDate),
            itemId: goal.id,
            read: false,
          });
        }

        // Goals due soon (within 7 days)
        if (goal.targetDate && goal.status !== 'completed') {
          const targetDate = new Date(goal.targetDate);
          const daysUntilDue = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilDue <= 7 && daysUntilDue > 0) {
            newNotifications.push({
              id: `goal-due-soon-${goal.id}`,
              type: 'goal',
              priority: 'medium',
              title: 'Goal Due Soon',
              message: `"${goal.title}" is due in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`,
              timestamp: now,
              itemId: goal.id,
              read: false,
            });
          }
        }

        // Nearly completed goals (80%+ progress)
        if (goal.targetValue && goal.status === 'in_progress') {
          const currentProgress = parseFloat(goal.currentValue || "0");
          const targetProgress = parseFloat(goal.targetValue);
          const progressPercentage = (currentProgress / targetProgress) * 100;

          if (progressPercentage >= 80 && progressPercentage < 100) {
            newNotifications.push({
              id: `goal-almost-complete-${goal.id}`,
              type: 'goal',
              priority: 'medium',
              title: 'Goal Almost Complete',
              message: `"${goal.title}" is ${Math.round(progressPercentage)}% complete! Keep going!`,
              timestamp: now,
              itemId: goal.id,
              read: false,
            });
          }
        }
      });

      // Checklist notifications
      checklists.forEach(checklist => {
        const completedItems = checklist.items.filter(item => item.completed).length;
        const totalItems = checklist.items.length;
        const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

        // Nearly completed checklists (80%+ completion)
        if (totalItems > 0 && completionPercentage >= 80 && completionPercentage < 100) {
          newNotifications.push({
            id: `checklist-almost-complete-${checklist.id}`,
            type: 'checklist',
            priority: 'medium',
            title: 'Checklist Almost Done',
            message: `"${checklist.title}" is ${Math.round(completionPercentage)}% complete (${completedItems}/${totalItems} items)`,
            timestamp: now,
            itemId: checklist.id,
            read: false,
          });
        }
      });

      // Merge with existing notifications to preserve read status
      setNotifications(prevNotifications => {
        const existingNotificationMap = new Map(prevNotifications.map(n => [n.id, n]));
        
        const mergedNotifications = newNotifications.map(newNotif => {
          const existing = existingNotificationMap.get(newNotif.id);
          return existing ? { ...newNotif, read: existing.read } : newNotif;
        });

        // Sort by priority and timestamp
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        mergedNotifications.sort((a, b) => {
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }
          return b.timestamp.getTime() - a.timestamp.getTime();
        });

        return mergedNotifications;
      });
    };

    generateNotifications();
  }, [goals.length, checklists.length]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (notification: Notification) => {
    switch (notification.type) {
      case 'goal':
        return <Target className="w-4 h-4" />;
      case 'checklist':
        return <CheckSquare className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return timestamp.toLocaleDateString();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No notifications yet
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      notification.read ? 'bg-gray-50' : 'bg-white border border-gray-200'
                    } hover:bg-gray-100`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-1.5 rounded-full ${getPriorityColor(notification.priority)}`}>
                          {getNotificationIcon(notification)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium text-sm text-gray-900">
                              {notification.title}
                            </p>
                            {notification.priority === 'high' && (
                              <AlertTriangle className="w-3 h-3 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 break-words">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatTimeAgo(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-2 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(notification.id);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator className="my-1" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}