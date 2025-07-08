import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Plus, Settings, Target, TrendingUp } from 'lucide-react';
import MealEntry from '@/components/MealEntry';
import ProgressRing from '@/components/ProgressRing';
import MealsList from '@/components/MealsList';
import SettingsPanel from '@/components/SettingsPanel';
import DarkModeToggle from '@/components/DarkModeToggle';
import FloatingActionButton from '@/components/FloatingActionButton';
import { MealCardSkeleton, ProgressCardSkeleton } from '@/components/LoadingSkeleton';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useToast } from "@/hooks/use-toast";

interface Meal {
  id: string;
  foodName: string;
  amount: string;
  calories: number;
  protein: number;
  imageUrl?: string;
  timestamp: Date;
}

interface DailyGoals {
  calories: number;
  protein: number;
}

const Index = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [dailyGoals, setDailyGoals] = useState<DailyGoals>({ calories: 2000, protein: 150 });
  const [showMealEntry, setShowMealEntry] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const { isDark, toggleDarkMode } = useDarkMode();
  const { toast } = useToast();

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const savedMeals = localStorage.getItem('nutritionMeals');
      const savedGoals = localStorage.getItem('dailyGoals');
      
      if (savedMeals) {
        const parsedMeals = JSON.parse(savedMeals).map((meal: any) => ({
          ...meal,
          timestamp: new Date(meal.timestamp)
        }));
        setMeals(parsedMeals);
      }
      
      if (savedGoals) {
        setDailyGoals(JSON.parse(savedGoals));
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  // Save to localStorage whenever meals or goals change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('nutritionMeals', JSON.stringify(meals));
    }
  }, [meals, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('dailyGoals', JSON.stringify(dailyGoals));
    }
  }, [dailyGoals, isLoading]);

  const addMeal = (meal: Omit<Meal, 'id' | 'timestamp'>) => {
    const newMeal: Meal = {
      ...meal,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMeals(prev => [newMeal, ...prev]);
    setShowMealEntry(false);
    toast({
      title: "Meal added! 🎉",
      description: `${meal.foodName} has been logged successfully.`,
    });
  };

  const getTodaysMeals = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return meals.filter(meal => {
      const mealDate = new Date(meal.timestamp);
      mealDate.setHours(0, 0, 0, 0);
      return mealDate.getTime() === today.getTime();
    });
  };

  const todaysMeals = getTodaysMeals();
  const todayTotals = todaysMeals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein
    }),
    { calories: 0, protein: 0 }
  );

  const caloriesProgress = Math.min((todayTotals.calories / dailyGoals.calories) * 100, 100);
  const proteinProgress = Math.min((todayTotals.protein / dailyGoals.protein) * 100, 100);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-green-50 via-blue-50 to-purple-50'
    }`}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className={`text-3xl font-bold mb-1 transition-colors ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              NutriTrack
            </h1>
            <p className={`transition-colors ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Your personal nutrition companion
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DarkModeToggle isDark={isDark} onToggle={toggleDarkMode} />
            <Button
              onClick={() => setShowMealEntry(true)}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hidden sm:flex"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Meal
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full grid-cols-4 mb-8 transition-colors ${
            isDark ? 'bg-gray-800/70' : 'bg-white/70'
          } backdrop-blur-sm`}>
            <TabsTrigger value="dashboard" className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <Target className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="meals" className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <Camera className="h-4 w-4" />
              Meals
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <TrendingUp className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 animate-fade-in">
            {/* Progress Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {isLoading ? (
                <>
                  <ProgressCardSkeleton />
                  <ProgressCardSkeleton />
                </>
              ) : (
                <>
                  <Card className={`transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    isDark ? 'bg-gray-800/80' : 'bg-white/80'
                  } backdrop-blur-sm shadow-xl border-0`}>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        🔥 Calories Today
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-gray-900">
                          {todayTotals.calories}
                        </div>
                        <div className="text-sm text-gray-600">
                          of {dailyGoals.calories} goal
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          {Math.max(0, dailyGoals.calories - todayTotals.calories)} remaining
                        </div>
                      </div>
                      <ProgressRing
                        progress={caloriesProgress}
                        size={80}
                        strokeWidth={8}
                        color="from-orange-400 to-red-500"
                      />
                    </CardContent>
                  </Card>

                  <Card className={`transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    isDark ? 'bg-gray-800/80' : 'bg-white/80'
                  } backdrop-blur-sm shadow-xl border-0`}>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        💪 Protein Today
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-gray-900">
                          {todayTotals.protein}g
                        </div>
                        <div className="text-sm text-gray-600">
                          of {dailyGoals.protein}g goal
                        </div>
                        <div className="text-sm text-blue-600 font-medium">
                          {Math.max(0, dailyGoals.protein - todayTotals.protein)}g remaining
                        </div>
                      </div>
                      <ProgressRing
                        progress={proteinProgress}
                        size={80}
                        strokeWidth={8}
                        color="from-blue-400 to-purple-500"
                      />
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Today's Meals */}
            <Card className={`transition-all duration-300 ${
              isDark ? 'bg-gray-800/80' : 'bg-white/80'
            } backdrop-blur-sm shadow-xl border-0`}>
              <CardHeader>
                <CardTitle className={`text-xl font-semibold transition-colors ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Today's Meals ({todaysMeals.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <MealCardSkeleton key={i} />
                    ))}
                  </div>
                ) : todaysMeals.length === 0 ? (
                  <div className="text-center py-12">
                    <Camera className={`h-16 w-16 mx-auto mb-4 transition-colors ${
                      isDark ? 'text-gray-500' : 'text-gray-300'
                    }`} />
                    <p className={`text-lg mb-4 transition-colors ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      No meals logged today
                    </p>
                    <Button
                      onClick={() => setShowMealEntry(true)}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transition-all duration-300 hover:scale-105"
                    >
                      Log Your First Meal
                    </Button>
                  </div>
                ) : (
                  <MealsList meals={todaysMeals} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meals" className="animate-fade-in">
            <Card className={`transition-colors ${
              isDark ? 'bg-gray-800/80' : 'bg-white/80'
            } backdrop-blur-sm shadow-xl border-0`}>
              <CardHeader>
                <CardTitle className={`text-xl font-semibold transition-colors ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  All Meals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <MealCardSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <MealsList meals={meals} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            <Card className={`transition-colors ${
              isDark ? 'bg-gray-800/80' : 'bg-white/80'
            } backdrop-blur-sm shadow-xl border-0`}>
              <CardHeader>
                <CardTitle className={`text-xl font-semibold transition-colors ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Nutrition History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className={`h-16 w-16 mx-auto mb-4 transition-colors ${
                    isDark ? 'text-gray-500' : 'text-gray-300'
                  }`} />
                  <p className={`text-lg transition-colors ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Charts and analytics coming soon!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-in">
            <SettingsPanel
              dailyGoals={dailyGoals}
              onGoalsUpdate={setDailyGoals}
            />
          </TabsContent>
        </Tabs>

        {/* Floating Action Button for Mobile */}
        <div className="sm:hidden">
          <FloatingActionButton onClick={() => setShowMealEntry(true)} />
        </div>

        {/* Meal Entry Modal */}
        {showMealEntry && (
          <MealEntry
            onClose={() => setShowMealEntry(false)}
            onSubmit={addMeal}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
