
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, TrendingUp, History, Settings } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { EnhancedThemeToggle } from '@/components/ThemeProvider';
import { useMobileLayout } from '@/hooks/useMobileLayout';
import NutritionCharts from '@/components/charts/NutritionCharts';
import HistoryView from '@/components/HistoryView';
import SettingsPanel from '@/components/SettingsPanel';
import MealEntryForm from '@/components/MealEntryForm';
import MealList from '@/components/MealList';
import MobileNavigation from '@/components/MobileNavigation';

const Home = () => {
  const { state, actions } = useData();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMealEntry, setShowMealEntry] = useState(false);
  const { isMobile, isTablet } = useMobileLayout();

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

  const handleAddMeal = () => {
    setShowMealEntry(true);
  };

  const handleMealSuccess = () => {
    setShowMealEntry(false);
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4 flex items-center justify-center transition-colors duration-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200 border-t-pink-500 dark:border-gray-600 dark:border-t-pink-400 mx-auto mb-6"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">Loading your nutrition data...</p>
          <div className="mt-4 text-4xl animate-bounce">🥗</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 transition-colors duration-500">
      <div className={`container mx-auto max-w-6xl ${isMobile ? 'px-4 pb-20' : 'p-4'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between mb-6 ${isMobile ? 'flex-col gap-4' : ''}`}>
          <div className={`flex items-center gap-4 ${isMobile ? 'flex-col text-center' : ''}`}>
            <div className="text-5xl animate-bounce">🥗</div>
            <div>
              <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-2`}>
                NutriTrack
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Your personal nutrition companion ✨
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <EnhancedThemeToggle className="hover:scale-110 transition-transform" />
            {!isMobile && (
              <Button
                onClick={handleAddMeal}
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Meal
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs - Desktop */}
        {!isMobile && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-pink-100 dark:border-gray-700">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white font-medium">
                <Target className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white font-medium">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white font-medium">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-medium">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Tab Content - Desktop */}
            <TabsContent value="dashboard" className="space-y-8">
              {/* Progress Cards */}
              <div className={`grid ${isTablet ? 'grid-cols-1' : 'md:grid-cols-2'} gap-8 mb-8`}>
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-2xl border-0 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 rounded-2xl border border-pink-100 dark:border-gray-700">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <span className="text-2xl">🔥</span>
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                        Calories Today
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                        {todayTotals.calories}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        of {dailyGoals.calories} goal
                      </div>
                      <div className="text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700">
                        {Math.max(0, dailyGoals.calories - todayTotals.calories)} remaining
                      </div>
                    </div>
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="url(#gradient-calories)"
                          strokeWidth="3"
                          strokeDasharray={`${caloriesProgress}, 100`}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                        <defs>
                          <linearGradient id="gradient-calories" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#ef4444" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                          {Math.round(caloriesProgress)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-2xl border-0 hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 rounded-2xl border border-blue-100 dark:border-gray-700">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <span className="text-2xl">💪</span>
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                        Protein Today
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                        {todayTotals.protein}g
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        of {dailyGoals.protein}g goal
                      </div>
                      <div className="text-sm font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700">
                        {Math.max(0, dailyGoals.protein - todayTotals.protein)}g remaining
                      </div>
                    </div>
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-gray-200 dark:text-gray-700"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="url(#gradient-protein)"
                          strokeWidth="3"
                          strokeDasharray={`${proteinProgress}, 100`}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                        <defs>
                          <linearGradient id="gradient-protein" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                          {Math.round(proteinProgress)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Today's Meals */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-2xl border-0 rounded-2xl border border-purple-100 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <span className="text-2xl">🍽️</span>
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                      Today's Meals ({todayMeals.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todayMeals.length > 0 ? (
                    <MealList meals={todayMeals} showDate={false} limit={3} />
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4 animate-pulse">🍽️</div>
                      <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">No meals logged today</p>
                      <Button
                        onClick={handleAddMeal}
                        variant="outline"
                        className="border-2 border-dashed border-purple-300 dark:border-purple-600 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium"
                        size="lg"
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Add Your First Meal
                      </Button>
                    </div>
                  )}

                  {todayMeals.length > 3 && (
                    <div className="mt-6 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('history')}
                        className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
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
        )}

        {/* Mobile Content */}
        {isMobile && (
          <div className="space-y-6">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Mobile Progress Cards - Stacked */}
                <div className="space-y-4">
                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl border border-pink-100 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-xl">🔥</span>
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                          Calories Today
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {todayTotals.calories}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          of {dailyGoals.calories} goal
                        </div>
                        <div className="text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700">
                          {Math.max(0, dailyGoals.calories - todayTotals.calories)} remaining
                        </div>
                      </div>
                      <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-gray-200 dark:text-gray-700"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="url(#gradient-calories-mobile)"
                            strokeWidth="3"
                            strokeDasharray={`${caloriesProgress}, 100`}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                          />
                          <defs>
                            <linearGradient id="gradient-calories-mobile" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#f97316" />
                              <stop offset="100%" stopColor="#ef4444" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {Math.round(caloriesProgress)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl border border-blue-100 dark:border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="text-xl">💪</span>
                        <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                          Protein Today
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                          {todayTotals.protein}g
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          of {dailyGoals.protein}g goal
                        </div>
                        <div className="text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-700">
                          {Math.max(0, dailyGoals.protein - todayTotals.protein)}g remaining
                        </div>
                      </div>
                      <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-gray-200 dark:text-gray-700"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="url(#gradient-protein-mobile)"
                            strokeWidth="3"
                            strokeDasharray={`${proteinProgress}, 100`}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                          />
                          <defs>
                            <linearGradient id="gradient-protein-mobile" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {Math.round(proteinProgress)}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Mobile Today's Meals */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-0 rounded-2xl border border-purple-100 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="text-xl">🍽️</span>
                      <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Today's Meals ({todayMeals.length})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {todayMeals.length > 0 ? (
                      <MealList meals={todayMeals} showDate={false} limit={isMobile ? 2 : 3} />
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-3 animate-pulse">🍽️</div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-base">No meals logged today</p>
                        <Button
                          onClick={handleAddMeal}
                          variant="outline"
                          className="border-2 border-dashed border-purple-300 dark:border-purple-600 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium w-full"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Meal
                        </Button>
                      </div>
                    )}

                    {todayMeals.length > 2 && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab('history')}
                          className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 w-full"
                        >
                          View All Meals ({todayMeals.length})
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'analytics' && (
              <NutritionCharts
                meals={state.meals}
                dailyGoals={dailyGoals}
                isDark={false}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                meals={state.meals}
                isDark={false}
                isLoading={state.isLoading}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPanel
                dailyGoals={dailyGoals}
                onGoalsUpdate={handleGoalsUpdate}
              />
            )}
          </div>
        )}

        {/* Mobile Navigation */}
        {isMobile && (
          <MobileNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAddMeal={handleAddMeal}
            todayMealsCount={todayMeals.length}
          />
        )}

        {/* Meal Entry Form */}
        <MealEntryForm
          isOpen={showMealEntry}
          onClose={() => setShowMealEntry(false)}
          onSuccess={handleMealSuccess}
        />
      </div>
    </div>
  );
};

export default Home;
