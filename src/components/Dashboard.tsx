import React, { useState, useEffect } from 'react';
import { User, LogOut, Clock, Eye, Target, CheckCircle2, Download, TrendingUp } from 'lucide-react';
import { TodoList } from './TodoList';
import { FocusMonitor } from './FocusMonitor';
import { StatsCard } from './StatsCard';
import { ExportModal } from './ExportModal';
import { logoutUser } from '../utils/auth';
import { updateUser } from '../utils/storage';
import { getCurrentUser } from '../utils/storage';

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user: initialUser, onLogout }) => {
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState('monitor');
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    // Refresh user data from storage
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser);
    updateUser(updatedUser);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const tabs = [
    { id: 'monitor', label: 'Focus Monitor', icon: Eye },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
    { id: 'stats', label: 'Statistics', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-white/40 backdrop-blur-xl">
      {/* Header */}
      <header className="bg-gradient-to-r from-white/90 via-indigo-50/80 to-pink-50/80 backdrop-blur-xl shadow-lg border-b border-indigo-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Avatar + Logo */}
            <div className="flex items-center">
              <div className="relative mr-5">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-pink-400 via-indigo-400 to-purple-400 blur-md opacity-60 animate-pulse"></div>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center shadow-xl border-4 border-white relative z-10">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent tracking-wide drop-shadow-lg">
                  FocusForge
                </h1>
                <div className="h-1 w-10 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full my-1 opacity-60"></div>
                <p className="text-base text-gray-700 animate-slideIn font-medium">Welcome back, {user.name}!</p>
              </div>
            </div>
            {/* Logout Button */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLogout}
                className="flex items-center px-7 py-3 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-500 text-white rounded-full shadow-2xl hover:from-pink-600 hover:to-indigo-700 transition-all duration-200 hover:shadow-pink-400/60 hover:shadow-2xl transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-pink-300 focus:ring-offset-2 text-lg font-bold gap-2 animate-glow"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-gray-100">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-4 text-base font-semibold border-b-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 transform scale-105'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  aria-label={tab.label}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'monitor' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Total Focus Time"
                value={formatTime(user.totalFocusTime)}
                icon={Clock}
                color="blue"
              />
              <StatsCard
                title="Sleep Incidents"
                value={user.sleepIncidents.toString()}
                icon={Eye}
                color="red"
              />
              <StatsCard
                title="Tasks Completed"
                value={user.todoList.filter((task: any) => task.completed).length.toString()}
                icon={CheckCircle2}
                color="green"
              />
            </div>

            {/* Focus Monitor */}
            <FocusMonitor user={user} onUserUpdate={handleUserUpdate} />
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="max-w-2xl animate-fadeIn">
            <TodoList user={user} onUserUpdate={handleUserUpdate} />
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass rounded-lg shadow p-6 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Progress</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Total Focus Time</span>
                      <span>{formatTime(user.totalFocusTime)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out animate-slideRight" 
                        style={{ width: `${Math.min((user.totalFocusTime / 3600) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Tasks Completed</span>
                      <span>{user.todoList.filter((task: any) => task.completed).length} / {user.todoList.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out animate-slideRight" 
                        style={{ 
                          width: user.todoList.length > 0 
                            ? `${(user.todoList.filter((task: any) => task.completed).length / user.todoList.length) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 animate-pulse">
                    <div className="text-2xl font-bold text-gray-900">{user.sleepIncidents}</div>
                    <div className="text-sm text-gray-600">Sleep Incidents</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatTime(user.totalSleepTime)}
                    </div>
                    <div className="text-sm text-gray-600">Total Sleep Time</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Export & Suggestion Section */}
            <div className="glass rounded-lg shadow p-6 bg-gradient-to-br from-pink-100 via-fuchsia-100 to-purple-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center px-7 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-full shadow-xl hover:from-pink-600 hover:to-indigo-700 transition-all duration-200 hover:shadow-2xl transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 text-lg font-bold gap-2"
              >
                <Download className="w-5 h-5 mr-2" />
                Export Data
              </button>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Sleep Suggestion</h3>
                <p className="text-gray-600">
                  {user.sleepIncidents === 0
                    ? 'Great job! No sleep incidents detected. Keep up your focus!'
                    : user.sleepIncidents < 3
                      ? 'You had a few sleep incidents. Try to take short breaks and stay hydrated for better focus.'
                      : 'Multiple sleep incidents detected. Consider getting more rest and taking regular breaks to improve your focus.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <ExportModal 
        user={user}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};