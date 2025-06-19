import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  completed: boolean("completed").notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type", { enum: ["income", "expense"] }).notNull(),
  category: text("category").notNull(),
  date: timestamp("date").defaultNow().notNull(),
});

export const checklists = pgTable("checklists", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const checklistItems = pgTable("checklist_items", {
  id: serial("id").primaryKey(),
  checklistId: integer("checklist_id").notNull(),
  title: text("title").notNull(),
  completed: boolean("completed").default(false).notNull(),
  order: integer("order").notNull(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  targetValue: decimal("target_value", { precision: 10, scale: 2 }),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }).default("0"),
  unit: text("unit"), // e.g., "books", "dollars", "days"
  status: text("status", { enum: ["not_started", "in_progress", "completed", "on_hold"] }).default("not_started").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  targetDate: timestamp("target_date"),
  motivationMedia: text("motivation_media").array(), // Array of media URLs/base64
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  currentStreak: true,
  longestStreak: true,
  createdAt: true,
});

export const insertHabitLogSchema = createInsertSchema(habitLogs).omit({
  id: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  date: true,
});

export const insertChecklistSchema = createInsertSchema(checklists).omit({
  id: true,
  createdAt: true,
});

export const insertChecklistItemSchema = createInsertSchema(checklistItems).omit({
  id: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
}).extend({
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  motivationMedia: z.array(z.string()).optional(),
});

// Types
export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;

export type HabitLog = typeof habitLogs.$inferSelect;
export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Checklist = typeof checklists.$inferSelect;
export type InsertChecklist = z.infer<typeof insertChecklistSchema>;

export type ChecklistItem = typeof checklistItems.$inferSelect;
export type InsertChecklistItem = z.infer<typeof insertChecklistItemSchema>;

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;

// Extended types for frontend
export type ChecklistWithItems = Checklist & {
  items: ChecklistItem[];
};
