import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertGoalSchema, type Goal } from "@shared/schema";
import MediaUpload from "./MediaUpload";
import type { z } from "zod";

type FormData = z.infer<typeof insertGoalSchema>;

interface GoalFormProps {
  goal?: Goal | null;
  onSubmit: () => void;
}

export default function GoalForm({ goal, onSubmit }: GoalFormProps) {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(insertGoalSchema),
    defaultValues: {
      title: goal?.title || "",
      description: goal?.description || "",
      targetValue: goal?.targetValue || "",
      currentValue: goal?.currentValue || "0",
      unit: goal?.unit || "",
      status: goal?.status || "not_started",
      startDate: goal?.startDate ? new Date(goal.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      targetDate: goal?.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : "",
      motivationMedia: goal?.motivationMedia || [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      await apiRequest("POST", "/api/goals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal created successfully" });
      onSubmit();
    },
    onError: () => {
      toast({ title: "Failed to create goal", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      await apiRequest("PATCH", `/api/goals/${goal!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal updated successfully" });
      onSubmit();
    },
    onError: () => {
      toast({ title: "Failed to update goal", variant: "destructive" });
    },
  });

  const handleSubmit = (data: FormData) => {
    if (goal) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Learn Spanish, Save $10,000..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add more details about this goal..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="targetValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Value</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g., 24, 10000..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., books, dollars, days..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {goal && (
          <FormField
            control={form.control}
            name="currentValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Progress</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Date (Optional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="motivationMedia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivation Media</FormLabel>
              <FormControl>
                <MediaUpload
                  value={field.value || []}
                  onChange={field.onChange}
                  maxFiles={3}
                  acceptedTypes={["image/*", "video/*"]}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-gray-500 mt-1">
                Add inspiring images or videos to keep you motivated towards your goal
              </p>
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : goal ? "Update Goal" : "Create Goal"}
          </Button>
          <Button type="button" variant="outline" onClick={onSubmit}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
