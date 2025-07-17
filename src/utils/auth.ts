import { User } from '../types';
import { getUsers, saveUsers, setCurrentUser } from './storage';

export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const registerUser = async (
  username: string,
  password: string,
  name: string,
  age: number
): Promise<{ success: boolean; message: string }> => {
  const users = getUsers();
  
  if (users[username]) {
    return { success: false, message: 'Username already exists' };
  }

  const hashedPassword = await hashPassword(password);
  const newUser: User = {
    id: generateId(),
    username,
    name,
    age,
    password: hashedPassword,
    sleepIncidents: 0,
    totalSleepTime: 0,
    todoList: [],
    totalFocusTime: 0,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  users[username] = newUser;
  saveUsers(users);
  
  return { success: true, message: 'Registration successful' };
};

export const loginUser = async (
  username: string,
  password: string
): Promise<{ success: boolean; message: string; user?: User }> => {
  const users = getUsers();
  const user = users[username];
  
  if (!user) {
    return { success: false, message: 'User not found' };
  }

  const hashedPassword = await hashPassword(password);
  
  if (user.password !== hashedPassword) {
    return { success: false, message: 'Invalid password' };
  }

  // Update last login
  user.lastLogin = new Date().toISOString();
  users[username] = user;
  saveUsers(users);
  setCurrentUser(user);
  
  return { success: true, message: 'Login successful', user };
};

export const logoutUser = (): void => {
  setCurrentUser(null);
};