import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Settings, AlertCircle, CheckCircle2, Clock, Target, Droplets } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationSettingsProps {
  isDark?: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isDark = false }) => {
  const {
    permission,
    isSupported,
    isEnabled,
    settings,
    requestPermission,
    updateSettings,
    setEnabled,
  } = useNotifications();

  const handleSettingChange = (key: string, value: boolean) => {
    updateSettings({
      ...settings,
      [key]: value,
    });
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          text: 'Granted',
          variant: 'default' as const,
          color: 'text-green-600 dark:text-green-400'
        };
      case 'denied':
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          text: 'Blocked',
          variant: 'destructive' as const,
          color: 'text-red-600 dark:text-red-400'
        };
      default:
        return {
          icon: <Clock className="h-4 w-4 text-amber-500" />,
          text: 'Not requested',
          variant: 'secondary' as const,
          color: 'text-amber-600 dark:text-amber-400'
        };
    }
  };

  const permissionStatus = getPermissionStatus();

  if (!isSupported) {
    return (
      <Card className={`${isDark ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <BellOff className="h-5 w-5" />
            Notifications Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your browser doesn't support notifications. You'll still receive in-app notifications when using the app.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${isDark ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {permissionStatus.icon}
            <div>
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Browser Permission
              </p>
              <p className={`text-sm ${permissionStatus.color}`}>
                Status: {permissionStatus.text}
              </p>
            </div>
          </div>
          
          {permission !== 'granted' && (
            <Button
              onClick={requestPermission}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Enable
            </Button>
          )}
        </div>

        {/* Master Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-blue-500" />
            <div>
              <Label htmlFor="notifications-enabled" className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Enable All Notifications
              </Label>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Master switch for all notification types
              </p>
            </div>
          </div>
          <Switch
            id="notifications-enabled"
            checked={isEnabled}
            onCheckedChange={setEnabled}
            disabled={permission !== 'granted'}
          />
        </div>

        {/* Individual Settings */}
        {isEnabled && permission === 'granted' && (
          <div className="space-y-4">
            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Notification Types
            </h4>
            
            {/* Meal Reminders */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-green-500" />
                <div>
                  <Label htmlFor="meal-reminders" className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Meal Reminders
                  </Label>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Breakfast, lunch, and dinner reminders
                  </p>
                </div>
              </div>
              <Switch
                id="meal-reminders"
                checked={settings.mealReminders || false}
                onCheckedChange={(checked) => handleSettingChange('mealReminders', checked)}
              />
            </div>

            {/* Goal Achievements */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <div>
                  <Label htmlFor="goal-achievements" className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Goal Achievements
                  </Label>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Celebrate when you reach your daily goals
                  </p>
                </div>
              </div>
              <Switch
                id="goal-achievements"
                checked={settings.goalAchievements || false}
                onCheckedChange={(checked) => handleSettingChange('goalAchievements', checked)}
              />
            </div>

            {/* Hydration Reminders */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <Droplets className="h-4 w-4 text-cyan-500" />
                <div>
                  <Label htmlFor="hydration-reminders" className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Hydration Reminders
                  </Label>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Regular reminders to drink water
                  </p>
                </div>
              </div>
              <Switch
                id="hydration-reminders"
                checked={settings.hydrationReminders || false}
                onCheckedChange={(checked) => handleSettingChange('hydrationReminders', checked)}
              />
            </div>

            {/* Weekly Progress */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-purple-500" />
                <div>
                  <Label htmlFor="weekly-progress" className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Weekly Progress
                  </Label>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Weekly summary of your nutrition tracking
                  </p>
                </div>
              </div>
              <Switch
                id="weekly-progress"
                checked={settings.weeklyProgress || false}
                onCheckedChange={(checked) => handleSettingChange('weeklyProgress', checked)}
              />
            </div>

            {/* Streak Milestones */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <span className="text-orange-500">🔥</span>
                <div>
                  <Label htmlFor="streak-milestones" className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Streak Milestones
                  </Label>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Celebrate your tracking streaks
                  </p>
                </div>
              </div>
              <Switch
                id="streak-milestones"
                checked={settings.streakMilestones || false}
                onCheckedChange={(checked) => handleSettingChange('streakMilestones', checked)}
              />
            </div>
          </div>
        )}

        {/* Help Text */}
        {permission === 'denied' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Notifications are blocked. To enable them, click the lock icon in your browser's address bar and allow notifications for this site.
            </AlertDescription>
          </Alert>
        )}

        {permission === 'default' && (
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              Click "Enable" above to receive helpful reminders and achievement notifications. You can always change this later.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
