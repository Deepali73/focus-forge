export interface User {
  id: string;
  username: string;
  name: string;
  age: number;
  password: string;
  sleepIncidents: number;
  totalSleepTime: number;
  todoList: TodoItem[];
  totalFocusTime: number;
  createdAt: string;
  lastLogin: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration: number;
  sleepDetections: number;
  isActive: boolean;
}

export interface EyeDetection {
  isOpen: boolean;
  confidence: number;
  timestamp: number;
}