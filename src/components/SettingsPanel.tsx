import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Target, Save, Bell, Globe, Info, CheckCircle2, Check, Database } from 'lucide-react';
import DataManagement from './DataManagement';

interface DailyGoals {
  calories: number;
  protein: number;
}

interface SettingsPanelProps {
  dailyGoals: DailyGoals;
  onGoalsUpdate: (goals: DailyGoals) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ dailyGoals, onGoalsUpdate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    calories: dailyGoals.calories,
    protein: dailyGoals.protein,
  });
  const [notifications, setNotifications] = useState({
    mealReminders: false,
    goalReminders: false,
    waterReminders: false,
  });
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const handleSaveGoals = async () => {
    setIsSubmitting(true);
    
    try {
      if (formData.calories < 1000 || formData.calories > 5000) {
        throw new Error('Calories must be between 1000 and 5000');
      }
      if (formData.protein < 50 || formData.protein > 300) {
        throw new Error('Protein must be between 50g and 300g');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      onGoalsUpdate(formData);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Failed to update goals:', error);
      alert('Error: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6 bg-white/70 backdrop-blur-sm">
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Language
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            About
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                <Target className="h-5 w-5" />
                Daily Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-900">Calories (kcal)</Label>
                    <Input
                      type="number"
                      placeholder="2000"
                      value={formData.calories}
                      onChange={(e) => setFormData(prev => ({ ...prev, calories: Number(e.target.value) }))}
                      className="bg-white transition-colors"
                    />
                    <p className="text-sm text-gray-500 mt-1">Your daily calorie target (1000-5000)</p>
                  </div>

                  <div>
                    <Label className="text-gray-900">Protein (g)</Label>
                    <Input
                      type="number"
                      placeholder="150"
                      value={formData.protein}
                      onChange={(e) => setFormData(prev => ({ ...prev, protein: Number(e.target.value) }))}
                      className="bg-white transition-colors"
                    />
                    <p className="text-sm text-gray-500 mt-1">Your daily protein target (50-300g)</p>
                  </div>
                </div>

                {showSuccess && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Goals updated successfully! 🎯
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveGoals}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <Label className="text-gray-900">Meal Reminders</Label>
                      <p className="text-sm text-gray-500">Get reminded to log your meals</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.mealReminders}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, mealReminders: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <Label className="text-gray-900">Goal Reminders</Label>
                      <p className="text-sm text-gray-500">Get notified about your daily goals</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.goalReminders}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, goalReminders: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <Label className="text-gray-900">Water Reminders</Label>
                      <p className="text-sm text-gray-500">Stay hydrated with regular reminders</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.waterReminders}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, waterReminders: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                <Globe className="h-5 w-5" />
                Language Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {languages.map((language) => (
                  <Button
                    key={language.code}
                    variant={currentLanguage === language.code ? "default" : "outline"}
                    className={`justify-between h-auto p-4 ${
                      currentLanguage === language.code 
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
                        : ''
                    }`}
                    onClick={() => setCurrentLanguage(language.code)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{language.flag}</span>
                      <span className="font-medium">{language.name}</span>
                    </div>
                    {currentLanguage === language.code && (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <DataManagement />
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                <Info className="h-5 w-5" />
                About NutriTrack
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3 text-gray-900">✨ Features</h4>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    Full CRUD operations - Create, Read, Update, Delete meals
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    Real-time nutrition tracking with progress visualization
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    Interactive charts and analytics with historical data
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    Data export/import with JSON and CSV support
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    Persistent local storage with automatic backup
                  </li>
                </ul>
              </div>
              
              <div className="p-3 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-600">
                  <strong>Version:</strong> 2.0.0 (CRUD Edition)<br />
                  <strong>Built with:</strong> React, TypeScript, Tailwind CSS<br />
                  <strong>Data Storage:</strong> Local Storage + Export/Import<br />
                  <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPanel;
