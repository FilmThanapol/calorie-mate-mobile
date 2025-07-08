import { useState, useEffect, useCallback } from 'react';
import { notificationService, type NotificationOptions, type NotificationSchedule } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

interface UseNotificationsReturn {
  permission: NotificationPermission;
  isSupported: boolean;
  isEnabled: boolean;
  settings: Record<string, boolean>;
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (options: NotificationOptions) => Promise<boolean>;
  updateSettings: (settings: Record<string, boolean>) => void;
  setEnabled: (enabled: boolean) => void;
  scheduleReminders: (dailyGoals: { calories: number; protein: number }) => void;
  cancelAllReminders: () => void;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<Record<string, boolean>>({});
  const [isEnabled, setIsEnabled] = useState(true);
  const { toast } = useToast();

  // Initialize notification service
  useEffect(() => {
    setPermission(Notification.permission);
    setSettings(notificationService.getSettings());
    
    const enabled = localStorage.getItem('notifications-enabled') !== 'false';
    setIsEnabled(enabled);

    // Set up fallback callback for UI notifications
    notificationService.setFallbackCallback((notification) => {
      toast({
        title: notification.title,
        description: notification.body,
        duration: 5000,
      });
    });

    // Listen for custom events from notifications
    const handleShowMealEntry = () => {
      window.dispatchEvent(new CustomEvent('show-meal-entry-from-notification'));
    };

    const handleNavigateToAnalytics = () => {
      window.dispatchEvent(new CustomEvent('navigate-to-analytics-from-notification'));
    };

    window.addEventListener('show-meal-entry', handleShowMealEntry);
    window.addEventListener('navigate-to-analytics', handleNavigateToAnalytics);

    return () => {
      window.removeEventListener('show-meal-entry', handleShowMealEntry);
      window.removeEventListener('navigate-to-analytics', handleNavigateToAnalytics);
    };
  }, [toast]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    try {
      const newPermission = await notificationService.requestPermission();
      setPermission(newPermission);
      
      if (newPermission === 'granted') {
        toast({
          title: "Notifications enabled! 🔔",
          description: "You'll now receive helpful reminders and achievement notifications.",
        });
      } else if (newPermission === 'denied') {
        toast({
          title: "Notifications blocked",
          description: "You can enable notifications in your browser settings if you change your mind.",
          variant: "destructive",
        });
      }
      
      return newPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }, [toast]);

  // Show notification
  const showNotification = useCallback(async (options: NotificationOptions): Promise<boolean> => {
    return await notificationService.show(options);
  }, []);

  // Update notification settings
  const updateSettings = useCallback((newSettings: Record<string, boolean>) => {
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
    
    toast({
      title: "Settings updated",
      description: "Your notification preferences have been saved.",
    });
  }, [toast]);

  // Enable/disable all notifications
  const setEnabledCallback = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    notificationService.setEnabled(enabled);
    
    if (enabled) {
      toast({
        title: "Notifications enabled",
        description: "You'll receive helpful reminders and updates.",
      });
    } else {
      toast({
        title: "Notifications disabled",
        description: "You won't receive any notifications.",
      });
    }
  }, [toast]);

  // Schedule meal reminders based on user preferences
  const scheduleReminders = useCallback((dailyGoals: { calories: number; protein: number }) => {
    if (!settings.mealReminders || !isEnabled) {
      return;
    }

    // Cancel existing reminders
    cancelAllReminders();

    // Schedule breakfast reminder (8:00 AM)
    const breakfastTime = new Date();
    breakfastTime.setHours(8, 0, 0, 0);
    if (breakfastTime.getTime() <= Date.now()) {
      breakfastTime.setDate(breakfastTime.getDate() + 1);
    }

    const breakfastReminder: NotificationSchedule = {
      id: 'breakfast-reminder',
      type: 'meal_reminder',
      title: 'Good morning! 🌅',
      body: 'Start your day right with a nutritious breakfast. Don\'t forget to log it!',
      scheduledTime: breakfastTime,
      recurring: 'daily',
      enabled: true
    };

    // Schedule lunch reminder (12:30 PM)
    const lunchTime = new Date();
    lunchTime.setHours(12, 30, 0, 0);
    if (lunchTime.getTime() <= Date.now()) {
      lunchTime.setDate(lunchTime.getDate() + 1);
    }

    const lunchReminder: NotificationSchedule = {
      id: 'lunch-reminder',
      type: 'meal_reminder',
      title: 'Lunch time! 🥗',
      body: 'Time for a healthy lunch to fuel your afternoon. Remember to track it!',
      scheduledTime: lunchTime,
      recurring: 'daily',
      enabled: true
    };

    // Schedule dinner reminder (6:30 PM)
    const dinnerTime = new Date();
    dinnerTime.setHours(18, 30, 0, 0);
    if (dinnerTime.getTime() <= Date.now()) {
      dinnerTime.setDate(dinnerTime.getDate() + 1);
    }

    const dinnerReminder: NotificationSchedule = {
      id: 'dinner-reminder',
      type: 'meal_reminder',
      title: 'Dinner time! 🍽️',
      body: 'End your day with a balanced dinner. Don\'t forget to log your meal!',
      scheduledTime: dinnerTime,
      recurring: 'daily',
      enabled: true
    };

    // Schedule hydration reminders (every 2 hours from 9 AM to 7 PM)
    if (settings.hydrationReminders) {
      for (let hour = 9; hour <= 19; hour += 2) {
        const hydrationTime = new Date();
        hydrationTime.setHours(hour, 0, 0, 0);
        if (hydrationTime.getTime() <= Date.now()) {
          hydrationTime.setDate(hydrationTime.getDate() + 1);
        }

        const hydrationReminder: NotificationSchedule = {
          id: `hydration-reminder-${hour}`,
          type: 'hydration',
          title: 'Stay hydrated! 💧',
          body: 'Remember to drink water throughout the day for optimal health.',
          scheduledTime: hydrationTime,
          recurring: 'daily',
          enabled: true
        };

        notificationService.scheduleNotification(hydrationReminder);
      }
    }

    // Schedule the meal reminders
    notificationService.scheduleNotification(breakfastReminder);
    notificationService.scheduleNotification(lunchReminder);
    notificationService.scheduleNotification(dinnerReminder);
  }, [settings, isEnabled]);

  // Cancel all scheduled reminders
  const cancelAllReminders = useCallback(() => {
    const reminderIds = [
      'breakfast-reminder',
      'lunch-reminder', 
      'dinner-reminder',
      ...Array.from({ length: 6 }, (_, i) => `hydration-reminder-${9 + i * 2}`)
    ];

    reminderIds.forEach(id => {
      notificationService.cancelScheduledNotification(id);
    });
  }, []);

  // Check for goal achievements
  const checkGoalAchievements = useCallback((
    todayTotals: { calories: number; protein: number },
    dailyGoals: { calories: number; protein: number }
  ) => {
    if (!settings.goalAchievements || !isEnabled) {
      return;
    }

    // Check if calorie goal was just achieved
    if (todayTotals.calories >= dailyGoals.calories) {
      const lastCalorieNotification = localStorage.getItem('last-calorie-goal-notification');
      const today = new Date().toDateString();
      
      if (lastCalorieNotification !== today) {
        showNotification({
          title: '🎉 Calorie Goal Achieved!',
          body: `Congratulations! You've reached your daily calorie goal of ${dailyGoals.calories} calories.`,
          icon: '🎯',
          tag: 'calorie-goal'
        });
        localStorage.setItem('last-calorie-goal-notification', today);
      }
    }

    // Check if protein goal was just achieved
    if (todayTotals.protein >= dailyGoals.protein) {
      const lastProteinNotification = localStorage.getItem('last-protein-goal-notification');
      const today = new Date().toDateString();
      
      if (lastProteinNotification !== today) {
        showNotification({
          title: '💪 Protein Goal Achieved!',
          body: `Amazing! You've reached your daily protein goal of ${dailyGoals.protein}g.`,
          icon: '🥩',
          tag: 'protein-goal'
        });
        localStorage.setItem('last-protein-goal-notification', today);
      }
    }
  }, [settings, isEnabled, showNotification]);

  return {
    permission,
    isSupported: notificationService.isSupported(),
    isEnabled: notificationService.isEnabled() && isEnabled,
    settings,
    requestPermission,
    showNotification,
    updateSettings,
    setEnabled: setEnabledCallback,
    scheduleReminders,
    cancelAllReminders,
  };
};
