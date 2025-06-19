import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Check, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import HabitForm from "@/components/HabitForm";
import type { Habit, HabitLog } from "@shared/schema";

export default function Habits() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const today = new Date().toISOString().split('T')[0];

  const { data: habits = [], isLoading: habitsLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });

  const { data: todayLogs = [] } = useQuery<HabitLog[]>({
    queryKey: ["/api/habit-logs/date", today],
  });

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitId, completed }: { habitId: number; completed: boolean }) => {
      await apiRequest("POST", "/api/habit-logs", {
        habitId,
        date: today,
        completed,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habit-logs/date", today] });
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      toast({ title: "Habit updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update habit", variant: "destructive" });
    },
  });

  const handleToggleHabit = (habitId: number) => {
    const currentLog = todayLogs.find(log => log.habitId === habitId);
    const newCompleted = !currentLog?.completed;
    toggleHabitMutation.mutate({ habitId, completed: newCompleted });
  };

  const getHabitStatus = (habitId: number) => {
    const log = todayLogs.find(log => log.habitId === habitId);
    return log?.completed || false;
  };

  if (habitsLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Habit Tracker</h2>
            <p className="text-gray-600">Build and maintain positive habits</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                New Habit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Habit</DialogTitle>
              </DialogHeader>
              <HabitForm onSubmit={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Today's Habits */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Today's Habits</h3>
          {habits.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No habits created yet</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Habit
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {habits.map((habit) => {
                const isCompleted = getHabitStatus(habit.id);
                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleToggleHabit(habit.id)}
                        disabled={toggleHabitMutation.isPending}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isCompleted
                            ? "border-green-500 bg-green-500"
                            : "border-gray-300 hover:border-green-500"
                        }`}
                      >
                        {isCompleted && <Check className="w-4 h-4 text-white" />}
                      </button>
                      <div>
                        <p className="font-medium text-gray-900">{habit.name}</p>
                        {habit.description && (
                          <p className="text-sm text-gray-500">{habit.description}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          {habit.currentStreak > 0 && `${habit.currentStreak}-day streak`}
                          {habit.longestStreak > 0 && ` • Best: ${habit.longestStreak} days`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-sm font-medium ${
                          isCompleted ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        {isCompleted ? "Completed" : "Pending"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Habit Progress Chart Placeholder */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Progress</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <TrendingUp className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600">Habit progress chart will appear here</p>
              <p className="text-sm text-gray-500 mt-2">
                Start tracking habits to see your progress visualization
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
