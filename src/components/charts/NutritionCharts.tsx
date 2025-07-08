import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Calendar, BarChart3 } from 'lucide-react';
import { type MealData } from '@/services/googleSheetsApi';

interface NutritionChartsProps {
  meals: MealData[];
  dailyGoals: {
    calories: number;
    protein: number;
  };
  isDark?: boolean;
}

interface DailyData {
  date: string;
  calories: number;
  protein: number;
  meals: number;
  caloriesGoal: number;
  proteinGoal: number;
}

const NutritionCharts: React.FC<NutritionChartsProps> = ({ 
  meals, 
  dailyGoals, 
  isDark = false 
}) => {
  // Process data for charts
  const processChartData = (): DailyData[] => {
    const dailyData: Record<string, DailyData> = {};
    
    // Get last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    // Initialize with zeros
    last7Days.forEach(date => {
      dailyData[date] = {
        date,
        calories: 0,
        protein: 0,
        meals: 0,
        caloriesGoal: dailyGoals.calories,
        proteinGoal: dailyGoals.protein,
      };
    });

    // Aggregate meal data
    meals.forEach(meal => {
      if (dailyData[meal.date]) {
        dailyData[meal.date].calories += meal.calories;
        dailyData[meal.date].protein += meal.protein;
        dailyData[meal.date].meals += 1;
      }
    });

    return Object.values(dailyData);
  };

  const chartData = processChartData();
  const todayData = chartData[chartData.length - 1];

  // Colors for charts
  const colors = {
    primary: isDark ? '#60a5fa' : '#3b82f6',
    secondary: isDark ? '#34d399' : '#10b981',
    accent: isDark ? '#f59e0b' : '#f59e0b',
    text: isDark ? '#e5e7eb' : '#374151',
    grid: isDark ? '#374151' : '#e5e7eb',
  };

  // Donut chart data for today's progress
  const donutData = [
    {
      name: 'Consumed',
      value: todayData?.calories || 0,
      color: colors.primary,
    },
    {
      name: 'Remaining',
      value: Math.max(0, dailyGoals.calories - (todayData?.calories || 0)),
      color: isDark ? '#374151' : '#f3f4f6',
    },
  ];

  const proteinDonutData = [
    {
      name: 'Consumed',
      value: todayData?.protein || 0,
      color: colors.secondary,
    },
    {
      name: 'Remaining',
      value: Math.max(0, dailyGoals.protein - (todayData?.protein || 0)),
      color: isDark ? '#374151' : '#f3f4f6',
    },
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-lg border ${
          isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
        }`}>
          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
              {entry.dataKey === 'protein' ? 'g' : entry.dataKey === 'calories' ? ' cal' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // No data fallback component
  const NoDataFallback = ({ icon: Icon, message }: { icon: any; message: string }) => (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <Icon className={`h-16 w-16 mb-4 ${isDark ? 'text-gray-500' : 'text-gray-300'}`} />
      <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {message}
      </p>
    </div>
  );

  const hasData = meals.length > 0;

  return (
    <div className="space-y-6">
      {/* Daily Progress Donut Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className={`${isDark ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm`}>
          <CardHeader className="pb-4">
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Target className="h-5 w-5" />
              Today's Calories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <div className="relative w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {todayData?.calories || 0}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      of {dailyGoals.calories}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <NoDataFallback icon={Target} message="No calorie data yet" />
            )}
          </CardContent>
        </Card>

        <Card className={`${isDark ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm`}>
          <CardHeader className="pb-4">
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Target className="h-5 w-5" />
              Today's Protein
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <div className="relative w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={proteinDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {proteinDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {todayData?.protein || 0}g
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      of {dailyGoals.protein}g
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <NoDataFallback icon={Target} message="No protein data yet" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Bar Chart */}
      <Card className={`${isDark ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm`}>
        <CardHeader className="pb-4">
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <BarChart3 className="h-5 w-5" />
            Weekly Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <div className="relative w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                  <XAxis 
                    dataKey="date" 
                    stroke={colors.text}
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                  />
                  <YAxis stroke={colors.text} fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="calories" fill={colors.primary} name="Calories" />
                  <Bar dataKey="protein" fill={colors.secondary} name="Protein (g)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoDataFallback icon={BarChart3} message="No weekly data available" />
          )}
        </CardContent>
      </Card>

      {/* Trend Line Chart */}
      <Card className={`${isDark ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm`}>
        <CardHeader className="pb-4">
          <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <TrendingUp className="h-5 w-5" />
            7-Day Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <div className="relative w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                  <XAxis 
                    dataKey="date" 
                    stroke={colors.text}
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke={colors.text} fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="calories" 
                    stroke={colors.primary} 
                    strokeWidth={3}
                    dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                    name="Calories"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="protein" 
                    stroke={colors.secondary} 
                    strokeWidth={3}
                    dot={{ fill: colors.secondary, strokeWidth: 2, r: 4 }}
                    name="Protein (g)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="caloriesGoal" 
                    stroke={colors.accent} 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Calorie Goal"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoDataFallback icon={TrendingUp} message="No trend data available" />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionCharts;
