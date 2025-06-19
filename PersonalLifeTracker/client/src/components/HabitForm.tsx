import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertHabitSchema } from "@shared/schema";
import type { z } from "zod";

type FormData = z.infer<typeof insertHabitSchema>;

interface HabitFormProps {
  onSubmit: () => void;
}

export default function HabitForm({ onSubmit }: HabitFormProps) {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(insertHabitSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      await apiRequest("POST", "/api/habits", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      toast({ title: "Habit created successfully" });
      onSubmit();
    },
    onError: () => {
      toast({ title: "Failed to create habit", variant: "destructive" });
    },
  });

  const handleSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Habit Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Morning workout, Read for 30 minutes..." {...field} />
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
                  placeholder="Add more details about this habit..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Habit"}
          </Button>
          <Button type="button" variant="outline" onClick={onSubmit}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
