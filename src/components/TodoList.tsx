import React, { useState } from 'react';
import { Plus, Trash2, Check, Clock } from 'lucide-react';
import { TodoItem } from '../types';
import { generateId } from '../utils/auth';

interface TodoListProps {
  user: any;
  onUserUpdate: (user: any) => void;
}

export const TodoList: React.FC<TodoListProps> = ({ user, onUserUpdate }) => {
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (!newTask.trim()) return;

    const task: TodoItem = {
      id: generateId(),
      text: newTask.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedUser = {
      ...user,
      todoList: [...user.todoList, task],
    };

    onUserUpdate(updatedUser);
    setNewTask('');
  };

  const toggleTask = (taskId: string) => {
    const updatedTodoList = user.todoList.map((task: TodoItem) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );

    const updatedUser = {
      ...user,
      todoList: updatedTodoList,
    };

    onUserUpdate(updatedUser);
  };

  const deleteTask = (taskId: string) => {
    const updatedTodoList = user.todoList.filter((task: TodoItem) => task.id !== taskId);

    const updatedUser = {
      ...user,
      todoList: updatedTodoList,
    };

    onUserUpdate(updatedUser);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const completedTasks = user.todoList.filter((task: TodoItem) => task.completed);
  const pendingTasks = user.todoList.filter((task: TodoItem) => !task.completed);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Task Management</h2>
        <div className="text-base text-gray-600">
          {completedTasks.length} of {user.todoList.length} completed
        </div>
      </div>

      {/* Add new task */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
          aria-label="Add new task"
        />
        <button
          onClick={addTask}
          disabled={!newTask.trim()}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-full shadow-xl hover:from-pink-600 hover:to-indigo-700 transition-all duration-200 hover:shadow-2xl transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 text-lg font-bold gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Add Task"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Task lists */}
      <div className="space-y-6">
        {/* Pending tasks */}
        {pendingTasks.length > 0 && (
          <div>
            <h3 className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Clock className="w-4 h-4 mr-2" />
              Pending Tasks ({pendingTasks.length})
            </h3>
            <div className="space-y-2">
              {pendingTasks.map((task: TodoItem) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h3 className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Check className="w-4 h-4 mr-2" />
              Completed Tasks ({completedTasks.length})
            </h3>
            <div className="space-y-2">
              {completedTasks.map((task: TodoItem) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </div>
        )}

        {user.todoList.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tasks yet. Add your first task above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface TaskItemProps {
  task: TodoItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border-2 shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer ring-1 ring-indigo-100 hover:ring-pink-200 hover:bg-opacity-90 ${
      task.completed 
        ? 'bg-gradient-to-r from-green-400 via-teal-300 to-blue-300 border-green-400 hover:shadow-teal-400/60' 
        : 'bg-gradient-to-r from-white via-indigo-100 to-purple-100 border-indigo-200 hover:shadow-indigo-400/40'
    }`}>
      <button
        onClick={() => onToggle(task.id)}
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-offset-2 text-lg font-bold shadow-xl hover:shadow-indigo-400/60 transform hover:scale-110 ${
          task.completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-indigo-500 bg-white'
        }`}
        aria-label={task.completed ? 'Mark as pending' : 'Mark as completed'}
      >
        {task.completed && <Check className="w-4 h-4" />}
      </button>
      
      <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
        {task.text}
      </span>
      
      <button
        onClick={() => onDelete(task.id)}
        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full focus:outline-none focus:ring-4 focus:ring-pink-300 focus:ring-offset-2 hover:shadow-pink-400/60"
        aria-label="Delete Task"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};