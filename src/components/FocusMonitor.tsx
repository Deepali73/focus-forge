import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Camera, CameraOff, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { CameraManager } from '../utils/camera';
import { EyeDetectionService } from '../utils/eyeDetection';
import { NotificationService } from '../utils/notifications';
import { generateId } from '../utils/auth';
import { addSession, updateSession } from '../utils/storage';

interface FocusMonitorProps {
  user: any;
  onUserUpdate: (user: any) => void;
}

export const FocusMonitor: React.FC<FocusMonitorProps> = ({ user, onUserUpdate }) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [eyesClosedTime, setEyesClosedTime] = useState(0);
  const [alertMessage, setAlertMessage] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sleepDetections, setSleepDetections] = useState(0);
  const [incidentCooldown, setIncidentCooldown] = useState(false);
  const cooldownTimeoutRef = useRef<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraManager = useRef<CameraManager>(new CameraManager());
  const eyeDetection = useRef<EyeDetectionService>(new EyeDetectionService());
  const notifications = useRef<NotificationService>(new NotificationService());
  const sessionStartTime = useRef<number>(0);
  const eyesClosedStartTime = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Only check camera permission after onboarding
    if (!showOnboarding) {
      checkCameraPermission();
    }
    return () => {
      stopMonitoring();
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
      }
    };
  }, [showOnboarding]);

  const checkCameraPermission = async () => {
    try {
      const hasPermission = await CameraManager.checkPermissions();
      setCameraPermission(hasPermission);
    } catch {
      setCameraPermission(false);
    }
  };

  const startMonitoring = async () => {
    try {
      setAlertMessage('');
      
      // Initialize camera
      const video = await cameraManager.current.initialize();
      if (videoRef.current) {
        videoRef.current.srcObject = video.srcObject;
      }

      // Create new session
      const sessionId = generateId();
      const session = {
        id: sessionId,
        userId: user.id,
        startTime: new Date().toISOString(),
        duration: 0,
        sleepDetections: 0,
        isActive: true,
      };
      
      addSession(session);
      setCurrentSessionId(sessionId);
      setSleepDetections(0);

      // Start monitoring
      sessionStartTime.current = Date.now();
      setIsMonitoring(true);
      setSessionTime(0);
      setEyesClosedTime(0);

      // Start eye detection
      eyeDetection.current.startDetection(video, handleEyeDetection);

      // Start timer
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - sessionStartTime.current) / 1000;
        setSessionTime(elapsed);
      }, 1000);

    } catch (error) {
      setAlertMessage('Failed to start camera. Please check permissions.');
      console.error('Camera error:', error);
    }
  };

  const stopMonitoring = () => {
    if (!isMonitoring) return;

    // Stop camera and detection
    cameraManager.current.stop();
    eyeDetection.current.stopDetection();
    
    // Clear timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Update session
    if (currentSessionId) {
      const duration = (Date.now() - sessionStartTime.current) / 1000;
      updateSession(currentSessionId, {
        endTime: new Date().toISOString(),
        duration,
        sleepDetections,
        isActive: false,
      });

      // Update user stats
      const updatedUser = {
        ...user,
        totalFocusTime: user.totalFocusTime + duration,
        sleepIncidents: user.sleepIncidents + sleepDetections,
      };
      onUserUpdate(updatedUser);
    }

    // Reset state
    setIsMonitoring(false);
    setCurrentSessionId(null);
    setSessionTime(0);
    setEyesClosedTime(0);
    setAlertMessage('');
    eyesClosedStartTime.current = null;
  };

  const handleEyeDetection = (detection: any) => {
    const now = Date.now();

    if (!detection.isOpen) {
      // Eyes are closed
      if (eyesClosedStartTime.current === null) {
        eyesClosedStartTime.current = now;
      }
      const closedDuration = (now - eyesClosedStartTime.current) / 1000;
      setEyesClosedTime(closedDuration);

      // Only trigger alert if not in cooldown
      if (closedDuration > 5 && !incidentCooldown) {
        triggerAlert();
        setIncidentCooldown(true);
      }
      // If eyes are closed, clear any cooldown timer
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current);
        cooldownTimeoutRef.current = null;
      }
    } else {
      // Eyes are open
      eyesClosedStartTime.current = null;
      setEyesClosedTime(0);
      setAlertMessage('');
      // If in cooldown, start a 1s timer to reset cooldown
      if (incidentCooldown && !cooldownTimeoutRef.current) {
        cooldownTimeoutRef.current = window.setTimeout(() => {
          setIncidentCooldown(false);
          cooldownTimeoutRef.current = null;
        }, 1000);
      }
    }
  };

  const triggerAlert = () => {
    const phrase = notifications.current.getRandomPhrase();
    setAlertMessage(phrase);
    notifications.current.playAlert();
    
    // Increment sleep detection count
    setSleepDetections(prev => prev + 1);
    
    // Update user stats immediately
    const updatedUser = {
      ...user,
      sleepIncidents: user.sleepIncidents + 1,
      totalSleepTime: user.totalSleepTime + 5, // Add 5 seconds for the detection
    };
    onUserUpdate(updatedUser);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (showOnboarding && !isMonitoring) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fadeIn">
          <Camera className="w-12 h-12 mx-auto mb-4 text-indigo-500 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900">We need your camera!</h2>
          <p className="text-gray-700 mb-6">FocusForge uses your camera to help you stay alert and focused.<br />
            <span className="font-medium">Your video never leaves your device.</span><br />
            We only detect if your eyes are open or closed—no images are stored.<br />
            Please click <b>Continue</b> and then <b>Allow</b> when prompted by your browser.
          </p>
          <button
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
            onClick={() => setShowOnboarding(false)}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (cameraPermission === false) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
        <div className="text-center">
          <CameraOff className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Camera Permission Required</h3>
          <p className="text-gray-600 mb-4">
            FocusForge needs camera access to monitor your focus and detect when you're getting sleepy.
          </p>
          <button
            onClick={checkCameraPermission}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Check Permission
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Focus Monitor
          </h2>
          <div className="flex items-center space-x-4">
            <div className="text-base text-gray-600">
              Session: {formatTime(sessionTime)}
            </div>
            {isMonitoring ? (
              <button
                onClick={stopMonitoring}
                className="flex items-center px-7 py-3 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white rounded-full shadow-2xl hover:from-red-600 hover:to-purple-700 transition-all duration-200 hover:shadow-pink-400/60 hover:shadow-2xl transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-pink-300 focus:ring-offset-2 text-lg font-bold gap-2 animate-pulse"
                aria-label="Stop Monitoring"
              >
                <Square className="w-6 h-6 mr-2" />
                Stop
              </button>
            ) : (
              <button
                onClick={startMonitoring}
                className="flex items-center px-7 py-3 bg-gradient-to-r from-green-400 via-teal-400 to-blue-500 text-white rounded-full shadow-2xl hover:from-green-500 hover:to-blue-700 transition-all duration-200 hover:shadow-teal-400/60 hover:shadow-2xl transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-teal-300 focus:ring-offset-2 text-lg font-bold gap-2"
                aria-label="Start Monitoring"
              >
                <Play className="w-6 h-6 mr-2" />
                Start
              </button>
            )}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center p-4 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-2xl border-2 border-indigo-300 shadow-xl hover:shadow-2xl hover:border-pink-400 transition-all duration-200 transform hover:scale-105 cursor-pointer ring-1 ring-indigo-200 hover:ring-pink-300 hover:bg-opacity-90"
          >
            <Camera className={`w-5 h-5 mr-3 ${isMonitoring ? 'text-green-500' : 'text-gray-400'}`} />
            <div>
              <div className="text-sm font-medium text-gray-900">Camera</div>
              <div className="text-xs text-gray-600">
                {isMonitoring ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          <div className="flex items-center p-4 bg-gradient-to-br from-teal-400 via-blue-400 to-indigo-400 rounded-2xl border-2 border-teal-300 shadow-xl hover:shadow-2xl hover:border-indigo-400 transition-all duration-200 transform hover:scale-105 cursor-pointer ring-1 ring-teal-200 hover:ring-indigo-300 hover:bg-opacity-90"
          >
            {eyesClosedTime > 0 ? (
              <EyeOff className="w-5 h-5 mr-3 text-red-500 animate-pulse" />
            ) : (
              <Eye className="w-5 h-5 mr-3 text-green-500" />
            )}
            <div>
              <div className="text-sm font-medium text-gray-900">Eye Status</div>
              <div className="text-xs text-gray-600">
                {eyesClosedTime > 0 ? `Closed ${eyesClosedTime.toFixed(1)}s` : 'Open'}
              </div>
            </div>
          </div>

          <div className="flex items-center p-4 bg-gradient-to-br from-pink-400 via-fuchsia-400 to-purple-400 rounded-2xl border-2 border-pink-300 shadow-xl hover:shadow-2xl hover:border-fuchsia-400 transition-all duration-200 transform hover:scale-105 cursor-pointer ring-1 ring-pink-200 hover:ring-fuchsia-300 hover:bg-opacity-90"
          >
            <AlertTriangle className={`w-5 h-5 mr-3 ${sleepDetections > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
            <div>
              <div className="text-sm font-medium text-gray-900">Sleep Alerts</div>
              <div className="text-xs text-gray-600">
                {sleepDetections} this session
              </div>
            </div>
          </div>
        </div>

        {/* Alert Message */}
        {alertMessage && (
          <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl mb-6 animate-bounce shadow-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-3 animate-pulse" />
              <p className="text-red-700 font-medium">{alertMessage}</p>
            </div>
          </div>
        )}

        {/* Video Feed */}
        <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover transition-all duration-300"
            style={{ transform: 'scaleX(-1)' }} // Mirror the video
          />
          {!isMonitoring && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm">
              <div className="text-center text-white">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50 animate-pulse" />
                <p className="text-lg font-medium">Click Start to begin monitoring</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
    </div>
  );
};