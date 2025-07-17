export class NotificationService {
  private alertAudio: HTMLAudioElement | null = null;
  private backgroundAudio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private wakePhrases = [
    "Utho bhai! Neend me padhna mana hai! 🎯",
    "Zyada mat socho, bas padho! 💪",
    "Focus karo! Aankhein khol lo! ⚡",
    "Padhai se bhaag mat yaar! 🏆",
    "Arey! Neend ko maaro goli, chalo padho! 🚀",
    "Rise and grind! Time to focus! 📚",
    "Your goals are waiting! Wake up! 🎯",
    "Stay strong, stay awake! 💪",
    "Eyes open, mind sharp! Focus time! ⭐",
    "Don't let sleep win this battle! 🔥"
  ];
  private stopTimeout: number | null = null;

  constructor() {
    this.initializeAudio();
    this.requestNotificationPermission();
  }

  private initializeAudio(): void {
    // Alert sound for initial wake-up
    this.alertAudio = new Audio();
    this.alertAudio.src = '/alert.mp3';
    this.alertAudio.volume = 0.8;
    
    // Background alarm sound for continuous play
    this.backgroundAudio = new Audio();
    // Using the same alert sound for background alarm
    this.backgroundAudio.src = '/alert.mp3';
    this.backgroundAudio.volume = 0.9;
    this.backgroundAudio.loop = true;
  }

  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  playAlert(): void {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    
    // Play initial alert sound
    if (this.alertAudio) {
      this.alertAudio.currentTime = 0;
      this.alertAudio.play().catch(console.error);
    }

    // Start continuous background alarm
    if (this.backgroundAudio) {
      this.backgroundAudio.currentTime = 0;
      this.backgroundAudio.play().catch(console.error);
    }

    // Show browser notification
    this.showNotification();

    // Vibrate if supported (mobile)
    if (navigator.vibrate) {
      navigator.vibrate?.([200, 100, 200, 100, 200]);
    }

    // Stop alarm after 20 seconds
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
    }
    this.stopTimeout = window.setTimeout(() => {
      this.stopAlert();
    }, 20000);
  }

  stopAlert(): void {
    this.isPlaying = false;
    if (this.stopTimeout) {
      clearTimeout(this.stopTimeout);
      this.stopTimeout = null;
    }
    if (this.backgroundAudio) {
      this.backgroundAudio.pause();
      this.backgroundAudio.currentTime = 0;
    }
    if (this.alertAudio) {
      this.alertAudio.pause();
      this.alertAudio.currentTime = 0;
    }
  }

  private showNotification(): void {
    const phrase = this.wakePhrases[Math.floor(Math.random() * this.wakePhrases.length)];
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('FocusForge Alert!', {
        body: phrase,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'focus-alert',
        requireInteraction: true
      });
    }
  }

  getRandomPhrase(): string {
    return this.wakePhrases[Math.floor(Math.random() * this.wakePhrases.length)];
  }
}