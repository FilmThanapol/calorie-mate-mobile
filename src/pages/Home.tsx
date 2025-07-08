
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, TrendingUp, History, Settings } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import NutritionCharts from '@/components/charts/NutritionCharts';
import HistoryView from '@/components/HistoryView';
import SettingsPanel from '@/components/SettingsPanel';
import MealEntryForm from '@/components/MealEntryForm';
import MealList from '@/components/MealList';

const Home = () => {
  const { state, actions } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMealEntry, setShowMealEntry] = useState(false);

  // Calculate today's totals from real data
  const todayTotals = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = state.meals.filter(meal => meal.date === today);

    return todayMeals.reduce(
      (totals, meal) => ({
        calories: totals.calories + meal.calories,
        protein: totals.protein + Number(meal.protein),
      }),
      { calories: 0, protein: 0 }
    );
  }, [state.meals]);

  // Get today's meals for display
  const todayMeals = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.meals
      .filter(meal => meal.date === today)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [state.meals]);

  const dailyGoals = {
    calories: state.settings.daily_calories,
    protein: Number(state.settings.daily_protein),
  };
  
  const caloriesProgress = Math.min((todayTotals.calories / dailyGoals.calories) * 100, 100);
  const proteinProgress = Math.min((todayTotals.protein / dailyGoals.protein) * 100, 100);

  const handleGoalsUpdate = async (newGoals: { calories: number; protein: number }) => {
    await actions.updateSettings({ 
      daily_calories: newGoals.calories, 
      daily_protein: newGoals.protein 
    });
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your nutrition data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              🥗 NutriTrack
            </h1>
            <p className="text-gray-600">
              Your personal nutrition companion
            </p>
          </div>
          <Button
            onClick={() => setShowMealEntry(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Meal
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Progress Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
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
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="url(#gradient-calories)"
                        strokeWidth="3"
                        strokeDasharray={`${caloriesProgress}, 100`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient-calories" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-700">
                        {Math.round(caloriesProgress)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300">
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
                  <div className="relative w-20 h-20">
                    <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="url(#gradient-protein)"
                        strokeWidth="3"
                        strokeDasharray={`${proteinProgress}, 100`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient-protein" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-700">
                        {Math.round(proteinProgress)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Meals */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Today's Meals ({todayMeals.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayMeals.length > 0 ? (
                  <MealList meals={todayMeals} showDate={false} limit={3} />
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🍽️</div>
                    <p className="text-gray-600 mb-4">No meals logged today</p>
                    <Button
                      onClick={() => setShowMealEntry(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Meal
                    </Button>
                  </div>
                )}

                {todayMeals.length > 3 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('history')}
                    >
                      View All Meals ({todayMeals.length})
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <NutritionCharts
              meals={state.meals}
              dailyGoals={dailyGoals}
              isDark={false}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <HistoryView
              meals={state.meals}
              isDark={false}
              isLoading={state.isLoading}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsPanel
              dailyGoals={dailyGoals}
              onGoalsUpdate={handleGoalsUpdate}
            />
          </TabsContent>
        </Tabs>

        {/* Meal Entry Form */}
        <MealEntryForm
          isOpen={showMealEntry}
          onClose={() => setShowMealEntry(false)}
          onSuccess={() => setShowMealEntry(false)}
        />
      </div>
    </div>
  );
};

export default Home;
