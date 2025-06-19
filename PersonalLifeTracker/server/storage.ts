import {
  notes,
  habits,
  habitLogs,
  transactions,
  checklists,
  checklistItems,
  goals,
  type Note,
  type InsertNote,
  type Habit,
  type InsertHabit,
  type HabitLog,
  type InsertHabitLog,
  type Transaction,
  type InsertTransaction,
  type Checklist,
  type InsertChecklist,
  type ChecklistItem,
  type InsertChecklistItem,
  type Goal,
  type InsertGoal,
  type ChecklistWithItems,
} from "@shared/schema";

export interface IStorage {
  // Notes
  getNotes(): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  searchNotes(query: string): Promise<Note[]>;

  // Habits
  getHabits(): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, habit: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<boolean>;

  // Habit Logs
  getHabitLogs(habitId: number): Promise<HabitLog[]>;
  getHabitLogsForDate(date: string): Promise<HabitLog[]>;
  createOrUpdateHabitLog(log: InsertHabitLog): Promise<HabitLog>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;

  // Checklists
  getChecklists(): Promise<ChecklistWithItems[]>;
  getChecklist(id: number): Promise<ChecklistWithItems | undefined>;
  createChecklist(checklist: InsertChecklist): Promise<Checklist>;
  updateChecklist(id: number, checklist: Partial<InsertChecklist>): Promise<Checklist | undefined>;
  deleteChecklist(id: number): Promise<boolean>;

  // Checklist Items
  getChecklistItems(checklistId: number): Promise<ChecklistItem[]>;
  createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem>;
  updateChecklistItem(id: number, item: Partial<InsertChecklistItem>): Promise<ChecklistItem | undefined>;
  deleteChecklistItem(id: number): Promise<boolean>;

  // Goals
  getGoals(): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private notes: Map<number, Note>;
  private habits: Map<number, Habit>;
  private habitLogs: Map<number, HabitLog>;
  private transactions: Map<number, Transaction>;
  private checklists: Map<number, Checklist>;
  private checklistItems: Map<number, ChecklistItem>;
  private goals: Map<number, Goal>;
  private currentId: number;

  constructor() {
    this.notes = new Map();
    this.habits = new Map();
    this.habitLogs = new Map();
    this.transactions = new Map();
    this.checklists = new Map();
    this.checklistItems = new Map();
    this.goals = new Map();
    this.currentId = 1;
  }

  // Notes
  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.currentId++;
    const now = new Date();
    const note: Note = {
      ...insertNote,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: number, update: Partial<InsertNote>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;

    const updatedNote: Note = {
      ...note,
      ...update,
      updatedAt: new Date(),
    };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }

  async searchNotes(query: string): Promise<Note[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.notes.values()).filter(note =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery)
    );
  }

  // Habits
  async getHabits(): Promise<Habit[]> {
    return Array.from(this.habits.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = this.currentId++;
    const habit: Habit = {
      ...insertHabit,
      id,
      description: insertHabit.description || null,
      currentStreak: 0,
      longestStreak: 0,
      createdAt: new Date(),
    };
    this.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id: number, update: Partial<InsertHabit>): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;

    const updatedHabit: Habit = { ...habit, ...update };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: number): Promise<boolean> {
    // Also delete all habit logs for this habit
    const logsToDelete = Array.from(this.habitLogs.values()).filter(log => log.habitId === id);
    logsToDelete.forEach(log => this.habitLogs.delete(log.id));
    
    return this.habits.delete(id);
  }

  // Habit Logs
  async getHabitLogs(habitId: number): Promise<HabitLog[]> {
    return Array.from(this.habitLogs.values()).filter(log => log.habitId === habitId);
  }

  async getHabitLogsForDate(date: string): Promise<HabitLog[]> {
    return Array.from(this.habitLogs.values()).filter(log => log.date === date);
  }

  async createOrUpdateHabitLog(insertLog: InsertHabitLog): Promise<HabitLog> {
    // Check if log already exists for this habit and date
    const existingLog = Array.from(this.habitLogs.values()).find(
      log => log.habitId === insertLog.habitId && log.date === insertLog.date
    );

    if (existingLog) {
      const updatedLog: HabitLog = { ...existingLog, ...insertLog };
      this.habitLogs.set(existingLog.id, updatedLog);
      
      // Update habit streaks
      await this.updateHabitStreaks(insertLog.habitId);
      
      return updatedLog;
    }

    const id = this.currentId++;
    const log: HabitLog = { ...insertLog, id };
    this.habitLogs.set(id, log);
    
    // Update habit streaks
    await this.updateHabitStreaks(insertLog.habitId);
    
    return log;
  }

  private async updateHabitStreaks(habitId: number): Promise<void> {
    const habit = this.habits.get(habitId);
    if (!habit) return;

    const logs = await this.getHabitLogs(habitId);
    const sortedLogs = logs.sort((a, b) => b.date.localeCompare(a.date));
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak from today backwards
    const today = new Date().toISOString().split('T')[0];
    let checkDate = today;
    
    for (const log of sortedLogs) {
      if (log.date === checkDate && log.completed) {
        currentStreak++;
        const prevDate = new Date(checkDate);
        prevDate.setDate(prevDate.getDate() - 1);
        checkDate = prevDate.toISOString().split('T')[0];
      } else {
        break;
      }
    }

    // Calculate longest streak
    for (const log of sortedLogs) {
      if (log.completed) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    const updatedHabit: Habit = { ...habit, currentStreak, longestStreak };
    this.habits.set(habitId, updatedHabit);
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      date: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: number, update: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const updatedTransaction: Transaction = { ...transaction, ...update };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    return this.transactions.delete(id);
  }

  // Checklists
  async getChecklists(): Promise<ChecklistWithItems[]> {
    const checklistsArray = Array.from(this.checklists.values());
    const checklistsWithItems = await Promise.all(
      checklistsArray.map(async checklist => ({
        ...checklist,
        items: await this.getChecklistItems(checklist.id),
      }))
    );
    return checklistsWithItems.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getChecklist(id: number): Promise<ChecklistWithItems | undefined> {
    const checklist = this.checklists.get(id);
    if (!checklist) return undefined;

    const items = await this.getChecklistItems(id);
    return { ...checklist, items };
  }

  async createChecklist(insertChecklist: InsertChecklist): Promise<Checklist> {
    const id = this.currentId++;
    const checklist: Checklist = {
      ...insertChecklist,
      id,
      createdAt: new Date(),
    };
    this.checklists.set(id, checklist);
    return checklist;
  }

  async updateChecklist(id: number, update: Partial<InsertChecklist>): Promise<Checklist | undefined> {
    const checklist = this.checklists.get(id);
    if (!checklist) return undefined;

    const updatedChecklist: Checklist = { ...checklist, ...update };
    this.checklists.set(id, updatedChecklist);
    return updatedChecklist;
  }

  async deleteChecklist(id: number): Promise<boolean> {
    // Also delete all checklist items
    const itemsToDelete = Array.from(this.checklistItems.values()).filter(item => item.checklistId === id);
    itemsToDelete.forEach(item => this.checklistItems.delete(item.id));
    
    return this.checklists.delete(id);
  }

  // Checklist Items
  async getChecklistItems(checklistId: number): Promise<ChecklistItem[]> {
    return Array.from(this.checklistItems.values())
      .filter(item => item.checklistId === checklistId)
      .sort((a, b) => a.order - b.order);
  }

  async createChecklistItem(insertItem: InsertChecklistItem): Promise<ChecklistItem> {
    const id = this.currentId++;
    const item: ChecklistItem = { 
      ...insertItem, 
      id,
      completed: insertItem.completed || false
    };
    this.checklistItems.set(id, item);
    return item;
  }

  async updateChecklistItem(id: number, update: Partial<InsertChecklistItem>): Promise<ChecklistItem | undefined> {
    const item = this.checklistItems.get(id);
    if (!item) return undefined;

    const updatedItem: ChecklistItem = { ...item, ...update };
    this.checklistItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteChecklistItem(id: number): Promise<boolean> {
    return this.checklistItems.delete(id);
  }

  // Goals
  async getGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.currentId++;
    const goal: Goal = {
      ...insertGoal,
      id,
      description: insertGoal.description || null,
      targetValue: insertGoal.targetValue || null,
      currentValue: insertGoal.currentValue || null,
      unit: insertGoal.unit || null,
      status: insertGoal.status || "not_started",
      startDate: insertGoal.startDate ? new Date(insertGoal.startDate) : new Date(),
      targetDate: insertGoal.targetDate ? new Date(insertGoal.targetDate) : null,
      motivationMedia: insertGoal.motivationMedia || null,
      createdAt: new Date(),
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: number, update: Partial<InsertGoal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;

    const updatedGoal: Goal = { 
      ...goal, 
      ...update,
      startDate: update.startDate ? new Date(update.startDate) : goal.startDate,
      targetDate: update.targetDate ? new Date(update.targetDate) : goal.targetDate,
      motivationMedia: update.motivationMedia !== undefined ? update.motivationMedia : goal.motivationMedia,
    };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }
}

export const storage = new MemStorage();
