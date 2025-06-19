import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertChecklistSchema } from "@shared/schema";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";

const formSchema = insertChecklistSchema.extend({
  items: z.array(z.object({
    title: z.string().min(1, "Item title is required"),
  })).min(1, "At least one item is required"),
});

type FormData = z.infer<typeof formSchema>;

interface ChecklistFormProps {
  onSubmit: () => void;
}

export default function ChecklistForm({ onSubmit }: ChecklistFormProps) {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      items: [{ title: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // First create the checklist
      const checklistResponse = await apiRequest("POST", "/api/checklists", {
        title: data.title,
      });
      const checklist = await checklistResponse.json();

      // Then create all the items
      await Promise.all(
        data.items.map((item, index) =>
          apiRequest("POST", "/api/checklist-items", {
            checklistId: checklist.id,
            title: item.title,
            completed: false,
            order: index,
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/checklists"] });
      toast({ title: "Checklist created successfully" });
      onSubmit();
    },
    onError: () => {
      toast({ title: "Failed to create checklist", variant: "destructive" });
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Checklist Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Weekly Errands, Travel Packing..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Items</FormLabel>
          <div className="space-y-2 mt-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name={`items.${index}.title`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder={`Item ${index + 1}...`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ title: "" })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Checklist"}
          </Button>
          <Button type="button" variant="outline" onClick={onSubmit}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
