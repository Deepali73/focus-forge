import { User, TodoItem, FocusSession } from '../types';

const STORAGE_KEYS = {
  USERS: 'focusforge_users',
  CURRENT_USER: 'focusforge_current_user',
  SESSIONS: 'focusforge_sessions',
} as const;

// User management
export const getUsers = (): Record<string, User> => {
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : {};
};

export const saveUsers = (users: Record<string, User>): void => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const updateUser = (user: User): void => {
  const users = getUsers();
  users[user.username] = user;
  saveUsers(users);
  setCurrentUser(user);
};

// Session management
export const getSessions = (): FocusSession[] => {
  const sessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  return sessions ? JSON.parse(sessions) : [];
};

export const saveSessions = (sessions: FocusSession[]): void => {
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
};

export const addSession = (session: FocusSession): void => {
  const sessions = getSessions();
  sessions.push(session);
  saveSessions(sessions);
};

export const updateSession = (sessionId: string, updates: Partial<FocusSession>): void => {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === sessionId);
  if (index !== -1) {
    sessions[index] = { ...sessions[index], ...updates };
    saveSessions(sessions);
  }
};