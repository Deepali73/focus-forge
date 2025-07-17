import { User, FocusSession } from '../types';
import { getSessions } from './storage';

export interface ExportData {
  user: User;
  sessions: FocusSession[];
  exportDate: string;
  summary: {
    totalSessions: number;
    totalFocusTime: number;
    totalSleepIncidents: number;
    averageSessionTime: number;
    completedTasks: number;
    totalTasks: number;
    productivityScore: number;
  };
}

export const generateExportData = (user: User): ExportData => {
  const sessions = getSessions().filter(session => session.userId === user.id);
  const completedTasks = user.todoList.filter(task => task.completed).length;
  const totalTasks = user.todoList.length;
  
  const summary = {
    totalSessions: sessions.length,
    totalFocusTime: user.totalFocusTime,
    totalSleepIncidents: user.sleepIncidents,
    averageSessionTime: sessions.length > 0 ? user.totalFocusTime / sessions.length : 0,
    completedTasks,
    totalTasks,
    productivityScore: calculateProductivityScore(user, sessions)
  };

  return {
    user: {
      ...user,
      password: '[HIDDEN]' // Don't export password
    } as User,
    sessions,
    exportDate: new Date().toISOString(),
    summary
  };
};

const calculateProductivityScore = (user: User, sessions: FocusSession[]): number => {
  if (sessions.length === 0) return 0;
  
  const avgFocusTime = user.totalFocusTime / sessions.length;
  const sleepIncidentRate = user.sleepIncidents / sessions.length;
  const taskCompletionRate = user.todoList.length > 0 
    ? user.todoList.filter(task => task.completed).length / user.todoList.length 
    : 0;
  
  // Score calculation (0-100)
  const focusScore = Math.min(avgFocusTime / 60, 100); // Max 100 for 60+ minutes avg
  const alertPenalty = Math.max(0, 100 - (sleepIncidentRate * 20)); // -20 per incident
  const taskBonus = taskCompletionRate * 50; // Up to 50 points for task completion
  
  return Math.round((focusScore + alertPenalty + taskBonus) / 2);
};

export const exportToJSON = (data: ExportData): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `focus-forge-data-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToCSV = (data: ExportData): void => {
  const csvContent = generateCSVContent(data);
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `focus-forge-sessions-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const generateCSVContent = (data: ExportData): string => {
  const headers = [
    'Session ID',
    'Start Time',
    'End Time', 
    'Duration (minutes)',
    'Sleep Detections',
    'Status'
  ];
  
  const rows = data.sessions.map(session => [
    session.id,
    new Date(session.startTime).toLocaleString(),
    session.endTime ? new Date(session.endTime).toLocaleString() : 'Ongoing',
    (session.duration / 60).toFixed(2),
    session.sleepDetections.toString(),
    session.isActive ? 'Active' : 'Completed'
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
};

export const exportToPDF = async (data: ExportData): Promise<void> => {
  // For a real implementation, you'd use a library like jsPDF
  // For now, we'll create a formatted text report
  const reportContent = generateTextReport(data);
  const blob = new Blob([reportContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `focus-forge-report-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const generateTextReport = (data: ExportData): string => {
  const { user, summary, sessions } = data;
  
  return `
FOCUS FORGE - ACTIVITY REPORT
Generated on: ${new Date(data.exportDate).toLocaleString()}

USER INFORMATION
================
Name: ${user.name}
Username: ${user.username}
Age: ${user.age}
Member since: ${new Date(user.createdAt).toLocaleDateString()}

SUMMARY STATISTICS
==================
Total Focus Sessions: ${summary.totalSessions}
Total Focus Time: ${(summary.totalFocusTime / 3600).toFixed(2)} hours
Average Session Time: ${(summary.averageSessionTime / 60).toFixed(2)} minutes
Sleep Incidents: ${summary.totalSleepIncidents}
Tasks Completed: ${summary.completedTasks}/${summary.totalTasks}
Productivity Score: ${summary.productivityScore}/100

RECENT SESSIONS
===============
${sessions.slice(-10).map(session => 
  `${new Date(session.startTime).toLocaleString()} - ${(session.duration / 60).toFixed(2)} min - ${session.sleepDetections} alerts`
).join('\n')}

TASK LIST
=========
${user.todoList.map(task => 
  `${task.completed ? '✓' : '○'} ${task.text}`
).join('\n')}

---
Report generated by Focus Forge
Your Personal Focus Companion
  `.trim();
};