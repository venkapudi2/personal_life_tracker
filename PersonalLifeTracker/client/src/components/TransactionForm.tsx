import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertTransactionSchema } from "@shared/schema";
import type { z } from "zod";

type FormData = z.infer<typeof insertTransactionSchema>;

const categories = {
  income: ["Salary", "Freelance", "Investment", "Other Income"],
  expense: ["Food & Dining", "Transportation", "Shopping", "Entertainment", "Bills & Utilities", "Healthcare", "Housing", "Other Expense"]
};

interface TransactionFormProps {
  onSubmit: () => void;
}

export default function TransactionForm({ onSubmit }: TransactionFormProps) {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(insertTransactionSchema),
    defaultValues: {
      title: "",
      amount: "",
      type: "expense",
      category: "",
    },
  });

  const selectedType = form.watch("type");

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      await apiRequest("POST", "/api/transactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({ title: "Transaction added successfully" });
      onSubmit();
    },
    onError: () => {
      toast({ title: "Failed to add transaction", variant: "destructive" });
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
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Groceries, Salary..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories[selectedType].map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Adding..." : "Add Transaction"}
          </Button>
          <Button type="button" variant="outline" onClick={onSubmit}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
