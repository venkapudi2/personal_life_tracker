import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertNoteSchema,
  insertHabitSchema,
  insertHabitLogSchema,
  insertTransactionSchema,
  insertChecklistSchema,
  insertChecklistItemSchema,
  insertGoalSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Notes routes
  app.get("/api/notes", async (req, res) => {
    try {
      const notes = await storage.getNotes();
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const notes = await storage.searchNotes(query);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to search notes" });
    }
  });

  app.get("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const validatedData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ message: "Invalid note data" });
    }
  });

  app.patch("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertNoteSchema.partial().parse(req.body);
      const note = await storage.updateNote(id, validatedData);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(400).json({ message: "Invalid note data" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNote(id);
      if (!deleted) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json({ message: "Note deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // Habits routes
  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getHabits();
      res.json(habits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  app.post("/api/habits", async (req, res) => {
    try {
      const validatedData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(validatedData);
      res.status(201).json(habit);
    } catch (error) {
      res.status(400).json({ message: "Invalid habit data" });
    }
  });

  app.patch("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertHabitSchema.partial().parse(req.body);
      const habit = await storage.updateHabit(id, validatedData);
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      res.json(habit);
    } catch (error) {
      res.status(400).json({ message: "Invalid habit data" });
    }
  });

  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteHabit(id);
      if (!deleted) {
        return res.status(404).json({ message: "Habit not found" });
      }
      res.json({ message: "Habit deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  // Habit logs routes
  app.get("/api/habits/:id/logs", async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const logs = await storage.getHabitLogs(habitId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habit logs" });
    }
  });

  app.get("/api/habit-logs/date/:date", async (req, res) => {
    try {
      const date = req.params.date;
      const logs = await storage.getHabitLogsForDate(date);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habit logs for date" });
    }
  });

  app.post("/api/habit-logs", async (req, res) => {
    try {
      const validatedData = insertHabitLogSchema.parse(req.body);
      const log = await storage.createOrUpdateHabitLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      res.status(400).json({ message: "Invalid habit log data" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  app.patch("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTransactionSchema.partial().parse(req.body);
      const transaction = await storage.updateTransaction(id, validatedData);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: "Invalid transaction data" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTransaction(id);
      if (!deleted) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Checklists routes
  app.get("/api/checklists", async (req, res) => {
    try {
      const checklists = await storage.getChecklists();
      res.json(checklists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch checklists" });
    }
  });

  app.post("/api/checklists", async (req, res) => {
    try {
      const validatedData = insertChecklistSchema.parse(req.body);
      const checklist = await storage.createChecklist(validatedData);
      res.status(201).json(checklist);
    } catch (error) {
      res.status(400).json({ message: "Invalid checklist data" });
    }
  });

  app.patch("/api/checklists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertChecklistSchema.partial().parse(req.body);
      const checklist = await storage.updateChecklist(id, validatedData);
      if (!checklist) {
        return res.status(404).json({ message: "Checklist not found" });
      }
      res.json(checklist);
    } catch (error) {
      res.status(400).json({ message: "Invalid checklist data" });
    }
  });

  app.delete("/api/checklists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteChecklist(id);
      if (!deleted) {
        return res.status(404).json({ message: "Checklist not found" });
      }
      res.json({ message: "Checklist deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete checklist" });
    }
  });

  // Checklist items routes
  app.post("/api/checklist-items", async (req, res) => {
    try {
      const validatedData = insertChecklistItemSchema.parse(req.body);
      const item = await storage.createChecklistItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid checklist item data" });
    }
  });

  app.patch("/api/checklist-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertChecklistItemSchema.partial().parse(req.body);
      const item = await storage.updateChecklistItem(id, validatedData);
      if (!item) {
        return res.status(404).json({ message: "Checklist item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid checklist item data" });
    }
  });

  app.delete("/api/checklist-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteChecklistItem(id);
      if (!deleted) {
        return res.status(404).json({ message: "Checklist item not found" });
      }
      res.json({ message: "Checklist item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete checklist item" });
    }
  });

  // Goals routes
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid goal data" });
    }
  });

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertGoalSchema.partial().parse(req.body);
      const goal = await storage.updateGoal(id, validatedData);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(400).json({ message: "Invalid goal data" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteGoal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json({ message: "Goal deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const notes = await storage.getNotes();
      const habits = await storage.getHabits();
      const transactions = await storage.getTransactions();
      const goals = await storage.getGoals();
      
      const today = new Date().toISOString().split('T')[0];
      const todayLogs = await storage.getHabitLogsForDate(today);
      const completedHabits = todayLogs.filter(log => log.completed).length;
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      });
      
      const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const completedGoals = goals.filter(g => g.status === 'completed').length;
      
      res.json({
        totalNotes: notes.length,
        habitsCompleted: `${completedHabits}/${habits.length}`,
        monthlyBalance: monthlyIncome - monthlyExpenses,
        goalsProgress: `${completedGoals}/${goals.length}`,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
