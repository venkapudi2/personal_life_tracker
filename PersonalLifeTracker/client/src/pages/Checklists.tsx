import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Check, Trash2, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ChecklistForm from "@/components/ChecklistForm";
import type { ChecklistWithItems } from "@shared/schema";

export default function Checklists() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: checklists = [], isLoading } = useQuery<ChecklistWithItems[]>({
    queryKey: ["/api/checklists"],
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      await apiRequest("PATCH", `/api/checklist-items/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklists"] });
    },
    onError: () => {
      toast({ title: "Failed to update item", variant: "destructive" });
    },
  });

  const deleteChecklistMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/checklists/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklists"] });
      toast({ title: "Checklist deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete checklist", variant: "destructive" });
    },
  });

  const handleToggleItem = (itemId: number, currentCompleted: boolean) => {
    toggleItemMutation.mutate({ id: itemId, completed: !currentCompleted });
  };

  const handleDeleteChecklist = (id: number) => {
    if (confirm("Are you sure you want to delete this checklist?")) {
      deleteChecklistMutation.mutate(id);
    }
  };

  const calculateProgress = (checklist: ChecklistWithItems) => {
    if (checklist.items.length === 0) return 0;
    const completed = checklist.items.filter(item => item.completed).length;
    return Math.round((completed / checklist.items.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Checklists</h2>
            <p className="text-gray-600">Organize tasks and to-do items</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                New Checklist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Checklist</DialogTitle>
              </DialogHeader>
              <ChecklistForm onSubmit={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {checklists.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <CheckSquare className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No checklists yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first checklist to start organizing tasks
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Checklist
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {checklists.map((checklist) => {
              const progress = calculateProgress(checklist);
              const completedItems = checklist.items.filter(item => item.completed).length;

              return (
                <div key={checklist.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{checklist.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {completedItems}/{checklist.items.length} completed
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteChecklist(checklist.id)}
                        disabled={deleteChecklistMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <div className="space-y-3">
                    {checklist.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <button
                          onClick={() => handleToggleItem(item.id, item.completed)}
                          disabled={toggleItemMutation.isPending}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            item.completed
                              ? "border-green-500 bg-green-500"
                              : "border-gray-300 hover:border-green-500"
                          }`}
                        >
                          {item.completed && <Check className="w-3 h-3 text-white" />}
                        </button>
                        <span className={`text-gray-900 ${item.completed ? 'line-through' : ''}`}>
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>

                  {checklist.items.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No items in this checklist</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
