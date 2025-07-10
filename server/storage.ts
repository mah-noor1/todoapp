import { tasks, type Task, type InsertTask, type UpdateTask, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: UpdateTask): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getTasksByStatus(status: string): Promise<Task[]>;
  getTasksByPriority(priority: string): Promise<Task[]>;
  searchTasks(query: string): Promise<Task[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private currentUserId: number;
  private currentTaskId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.currentUserId = 1;
    this.currentTaskId = 1;
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const sampleTasks = [
      {
        title: "Complete project proposal",
        description: "Write and review the quarterly project proposal for the new client engagement",
        priority: "high",
        status: "todo",
        category: "Work",
        dueDate: tomorrow,
        isRecurring: false,
        recurringPattern: null,
        completed: false,
      },
      {
        title: "Team standup meeting",
        description: "Daily standup with the development team to discuss progress and blockers",
        priority: "medium", 
        status: "in-progress",
        category: "Work",
        dueDate: now,
        isRecurring: true,
        recurringPattern: "daily",
        completed: false,
      },
      {
        title: "Grocery shopping",
        description: "Buy groceries for the week including vegetables, fruits, and household items",
        priority: "low",
        status: "todo",
        category: "Personal",
        dueDate: nextWeek,
        isRecurring: true,
        recurringPattern: "weekly",
        completed: false,
      },
      {
        title: "Review code changes",
        description: "Review pull requests from team members and provide feedback",
        priority: "high",
        status: "review",
        category: "Work",
        dueDate: now,
        isRecurring: false,
        recurringPattern: null,
        completed: false,
      },
      {
        title: "Exercise routine",
        description: "30-minute workout session with cardio and strength training",
        priority: "medium",
        status: "done",
        category: "Health",
        dueDate: null,
        isRecurring: true,
        recurringPattern: "daily",
        completed: true,
      }
    ];

    sampleTasks.forEach((taskData) => {
      const id = this.currentTaskId++;
      const task: Task = {
        ...taskData,
        id,
        createdAt: now,
        updatedAt: now,
      };
      this.tasks.set(id, task);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => {
      // Sort by priority (high > medium > low) then by due date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder];
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder];
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const now = new Date();
    const task: Task = {
      ...insertTask,
      description: insertTask.description || null,
      status: insertTask.status || "todo",
      dueDate: insertTask.dueDate || null,
      isRecurring: insertTask.isRecurring || false,
      recurringPattern: insertTask.recurringPattern || null,
      completed: insertTask.completed || false,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updateTask: UpdateTask): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) {
      return undefined;
    }

    const updatedTask: Task = {
      ...existingTask,
      ...updateTask,
      updatedAt: new Date(),
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getTasksByStatus(status: string): Promise<Task[]> {
    const allTasks = await this.getTasks();
    return allTasks.filter(task => task.status === status);
  }

  async getTasksByPriority(priority: string): Promise<Task[]> {
    const allTasks = await this.getTasks();
    return allTasks.filter(task => task.priority === priority);
  }

  async searchTasks(query: string): Promise<Task[]> {
    const allTasks = await this.getTasks();
    const lowerQuery = query.toLowerCase();
    return allTasks.filter(task => 
      task.title.toLowerCase().includes(lowerQuery) ||
      (task.description && task.description.toLowerCase().includes(lowerQuery)) ||
      task.category.toLowerCase().includes(lowerQuery)
    );
  }
}

export const storage = new MemStorage();
