import React, { useState } from 'react';
import { User, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { registerUser, loginUser } from '../utils/auth';

interface AuthFormProps {
  onLogin: (user: any) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    age: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isLogin) {
        const result = await loginUser(formData.username, formData.password);
        if (result.success && result.user) {
          onLogin(result.user);
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      } else {
        if (!formData.name || !formData.age) {
          setMessage({ type: 'error', text: 'Please fill all fields' });
          return;
        }
        
        const result = await registerUser(
          formData.username,
          formData.password,
          formData.name,
          parseInt(formData.age)
        );
        
        if (result.success) {
          setMessage({ type: 'success', text: 'Registration successful! Please login.' });
          setIsLogin(true);
          setFormData({ username: '', password: '', name: '', age: '' });
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-10 animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white/20 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            FocusForge
          </h1>
          <p className="text-gray-600 animate-slideUp">Your personal focus companion</p>
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1 mb-6 relative overflow-hidden">
          <div 
            className={`absolute top-1 bottom-1 bg-white rounded-lg shadow-md transition-transform duration-300 ease-in-out ${
              isLogin ? 'translate-x-1 w-[calc(50%-4px)]' : 'translate-x-[calc(50%+2px)] w-[calc(50%-4px)]'
            }`}
          ></div>
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 px-4 rounded-lg text-base font-semibold transition-all duration-300 relative z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isLogin
                ? 'text-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Login Tab"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 px-4 rounded-lg text-base font-semibold transition-all duration-300 relative z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              !isLogin
                ? 'text-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            aria-label="Sign Up Tab"
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-base"
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-5 py-4 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-base"
                placeholder="Enter your password"
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-base"
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-1" htmlFor="age">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required={!isLogin}
                  min="1"
                  max="120"
                  className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-base"
                  placeholder="Enter your age"
                  autoComplete="age"
                />
              </div>
            </>
          )}

          {message.text && (
            <div className={`p-4 rounded-xl text-base font-medium animate-slideDown ${
              message.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-lg"
            aria-busy={loading}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? <LogIn className="w-5 h-5 mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                {isLogin ? 'Login' : 'Sign Up'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};