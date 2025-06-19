import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertNoteSchema, type Note } from "@shared/schema";
import type { z } from "zod";

type FormData = z.infer<typeof insertNoteSchema>;

interface NoteFormProps {
  note?: Note | null;
  onSubmit: () => void;
}

export default function NoteForm({ note, onSubmit }: NoteFormProps) {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(insertNoteSchema),
    defaultValues: {
      title: note?.title || "",
      content: note?.content || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      await apiRequest("POST", "/api/notes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({ title: "Note created successfully" });
      onSubmit();
    },
    onError: () => {
      toast({ title: "Failed to create note", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      await apiRequest("PATCH", `/api/notes/${note!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({ title: "Note updated successfully" });
      onSubmit();
    },
    onError: () => {
      toast({ title: "Failed to update note", variant: "destructive" });
    },
  });

  const handleSubmit = (data: FormData) => {
    if (note) {
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
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter note title..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your note content..."
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : note ? "Update Note" : "Create Note"}
          </Button>
          <Button type="button" variant="outline" onClick={onSubmit}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
