/**
 * Browser Notification Service
 * Handles push notifications, permission management, and fallback UI notifications
 */

export type NotificationType = 'meal_reminder' | 'goal_achievement' | 'hydration' | 'weekly_summary' | 'streak';

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  data?: any;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationSchedule {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  scheduledTime: Date;
  recurring?: 'daily' | 'weekly';
  enabled: boolean;
}

class NotificationService {
  private permission: NotificationPermission = 'default';
  private scheduledNotifications: Map<string, number> = new Map();
  private fallbackCallback?: (notification: NotificationOptions) => void;

  constructor() {
    this.checkPermission();
    this.setupServiceWorker();
  }

  /**
   * Check current notification permission status
   */
  private checkPermission(): void {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (this.permission === 'granted') {
      return 'granted';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      // Store permission preference
      localStorage.setItem('notification-permission-requested', 'true');
      localStorage.setItem('notification-permission', permission);
      
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  /**
   * Check if notifications are supported and permitted
   */
  isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.isSupported() && this.permission === 'granted';
  }

  /**
   * Set fallback callback for when notifications are not available
   */
  setFallbackCallback(callback: (notification: NotificationOptions) => void): void {
    this.fallbackCallback = callback;
  }

  /**
   * Show a notification
   */
  async show(options: NotificationOptions): Promise<boolean> {
    // Check if we should show notifications
    const notificationsEnabled = localStorage.getItem('notifications-enabled') !== 'false';
    if (!notificationsEnabled) {
      return false;
    }

    // Try browser notification first
    if (this.isEnabled()) {
      try {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || '/favicon.ico',
          badge: options.badge || '/favicon.ico',
          tag: options.tag,
          requireInteraction: options.requireInteraction || false,
          silent: options.silent || false,
          data: options.data,
        });

        // Handle notification click
        notification.onclick = () => {
          window.focus();
          notification.close();
          
          // Handle custom actions
          if (options.data?.action) {
            this.handleNotificationAction(options.data.action, options.data);
          }
        };

        // Auto-close after 5 seconds unless requireInteraction is true
        if (!options.requireInteraction) {
          setTimeout(() => {
            notification.close();
          }, 5000);
        }

        return true;
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }

    // Fallback to UI notification
    if (this.fallbackCallback) {
      this.fallbackCallback(options);
      return true;
    }

    return false;
  }

  /**
   * Schedule a notification
   */
  scheduleNotification(schedule: NotificationSchedule): void {
    if (!schedule.enabled) {
      return;
    }

    const now = new Date();
    const delay = schedule.scheduledTime.getTime() - now.getTime();

    if (delay <= 0) {
      // If time has passed, schedule for next occurrence
      if (schedule.recurring === 'daily') {
        const nextDay = new Date(schedule.scheduledTime);
        nextDay.setDate(nextDay.getDate() + 1);
        schedule.scheduledTime = nextDay;
        this.scheduleNotification(schedule);
      }
      return;
    }

    const timeoutId = window.setTimeout(() => {
      this.show({
        title: schedule.title,
        body: schedule.body,
        tag: schedule.id,
        data: { type: schedule.type, scheduleId: schedule.id }
      });

      // Reschedule if recurring
      if (schedule.recurring === 'daily') {
        const nextDay = new Date(schedule.scheduledTime);
        nextDay.setDate(nextDay.getDate() + 1);
        schedule.scheduledTime = nextDay;
        this.scheduleNotification(schedule);
      } else if (schedule.recurring === 'weekly') {
        const nextWeek = new Date(schedule.scheduledTime);
        nextWeek.setDate(nextWeek.getDate() + 7);
        schedule.scheduledTime = nextWeek;
        this.scheduleNotification(schedule);
      }
    }, delay);

    this.scheduledNotifications.set(schedule.id, timeoutId);
  }

  /**
   * Cancel a scheduled notification
   */
  cancelScheduledNotification(scheduleId: string): void {
    const timeoutId = this.scheduledNotifications.get(scheduleId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(scheduleId);
    }
  }

  /**
   * Handle notification actions
   */
  private handleNotificationAction(action: string, data: any): void {
    switch (action) {
      case 'log_meal':
        // Trigger meal logging UI
        window.dispatchEvent(new CustomEvent('show-meal-entry'));
        break;
      case 'view_progress':
        // Navigate to analytics
        window.dispatchEvent(new CustomEvent('navigate-to-analytics'));
        break;
      case 'dismiss':
        // Do nothing
        break;
      default:
        console.log('Unknown notification action:', action);
    }
  }

  /**
   * Setup service worker for background notifications (if available)
   */
  private async setupServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        // Register service worker for future push notifications
        // This is a placeholder for future implementation
        console.log('Service worker support detected');
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  }

  /**
   * Predefined notification templates
   */
  static templates = {
    mealReminder: (mealType: string): NotificationOptions => ({
      title: `Time for ${mealType}! 🍽️`,
      body: `Don't forget to log your ${mealType.toLowerCase()} to stay on track with your nutrition goals.`,
      tag: 'meal-reminder',
      data: { action: 'log_meal', mealType }
    }),

    goalAchieved: (goalType: 'calories' | 'protein', value: number): NotificationOptions => ({
      title: `Goal Achieved! 🎉`,
      body: `Congratulations! You've reached your daily ${goalType} goal of ${value}${goalType === 'protein' ? 'g' : ' calories'}.`,
      tag: 'goal-achievement',
      requireInteraction: true,
      data: { action: 'view_progress', goalType, value }
    }),

    hydrationReminder: (): NotificationOptions => ({
      title: `Stay Hydrated! 💧`,
      body: `Remember to drink water throughout the day for optimal health and performance.`,
      tag: 'hydration-reminder',
      data: { action: 'dismiss' }
    }),

    weeklyProgress: (mealsLogged: number, avgCalories: number): NotificationOptions => ({
      title: `Weekly Summary 📊`,
      body: `This week you logged ${mealsLogged} meals with an average of ${avgCalories} calories per day. Keep it up!`,
      tag: 'weekly-summary',
      requireInteraction: true,
      data: { action: 'view_progress', mealsLogged, avgCalories }
    }),

    streakMilestone: (days: number): NotificationOptions => ({
      title: `${days} Day Streak! 🔥`,
      body: `Amazing! You've been consistently tracking your nutrition for ${days} days straight.`,
      tag: 'streak-milestone',
      requireInteraction: true,
      data: { action: 'view_progress', streak: days }
    })
  };

  /**
   * Get notification settings from localStorage
   */
  getSettings(): Record<string, boolean> {
    const defaultSettings = {
      mealReminders: true,
      goalAchievements: true,
      hydrationReminders: true,
      weeklyProgress: true,
      streakMilestones: true
    };

    try {
      const saved = localStorage.getItem('notification-settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }

  /**
   * Update notification settings
   */
  updateSettings(settings: Record<string, boolean>): void {
    localStorage.setItem('notification-settings', JSON.stringify(settings));
  }

  /**
   * Enable/disable all notifications
   */
  setEnabled(enabled: boolean): void {
    localStorage.setItem('notifications-enabled', enabled.toString());
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
