import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import GoalForm from "@/components/GoalForm";
import MediaGallery from "@/components/MediaGallery";
import type { Goal } from "@shared/schema";

const statusColors = {
  not_started: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  on_hold: "bg-yellow-100 text-yellow-800",
};

const statusLabels = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  on_hold: "On Hold",
};

export default function Goals() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const { toast } = useToast();

  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["/api/goals"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete goal", variant: "destructive" });
    },
  });

  const calculateProgress = (goal: Goal) => {
    if (!goal.targetValue || parseFloat(goal.targetValue) === 0) return 0;
    const current = parseFloat(goal.currentValue || "0");
    const target = parseFloat(goal.targetValue);
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = () => {
    setDialogOpen(false);
    setEditingGoal(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Goals</h2>
            <p className="text-gray-600">Set and track your personal goals</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingGoal(null)}>
                <Plus className="w-5 h-5 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingGoal ? "Edit Goal" : "Create New Goal"}
                </DialogTitle>
              </DialogHeader>
              <GoalForm goal={editingGoal} onSubmit={handleSubmit} />
            </DialogContent>
          </Dialog>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Target className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-500 mb-4">
              Set your first goal to start tracking progress
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {goals.map((goal) => {
              const progress = calculateProgress(goal);

              return (
                <div key={goal.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge className={statusColors[goal.status]}>
                        {statusLabels[goal.status]}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(goal)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(goal.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {goal.targetValue && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-500">
                          {goal.currentValue || 0}
                          {goal.unit && ` ${goal.unit}`} / {goal.targetValue}
                          {goal.unit && ` ${goal.unit}`} ({progress}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-primary h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Motivation Media Gallery */}
                  {goal.motivationMedia && goal.motivationMedia.length > 0 && (
                    <div className="mb-4">
                      <MediaGallery media={goal.motivationMedia} />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Started: {new Date(goal.startDate).toLocaleDateString()}</span>
                    {goal.targetDate && (
                      <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
