
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Tables } from '@/integrations/supabase/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type Meal = Tables<'meals'>;
type Settings = Tables<'settings'>;

interface NutritionChartsProps {
  meals: Meal[];
  dailyGoals: { calories: number; protein: number };
  isDark: boolean;
}

const NutritionCharts: React.FC<NutritionChartsProps> = ({ meals, dailyGoals, isDark }) => {
  const chartData = useMemo(() => {
    // Get last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    // Calculate daily totals
    const dailyTotals = last7Days.map(date => {
      const dayMeals = meals.filter(meal => meal.date === date);
      return {
        date,
        calories: dayMeals.reduce((sum, meal) => sum + meal.calories, 0),
        protein: dayMeals.reduce((sum, meal) => sum + Number(meal.protein), 0),
      };
    });

    return {
      labels: last7Days.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });
      }),
      dailyTotals,
    };
  }, [meals]);

  const today = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter(meal => meal.date === today);
  const todayCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const todayProtein = todayMeals.reduce((sum, meal) => sum + Number(meal.protein), 0);

  const textColor = isDark ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)';
  const gridColor = isDark ? 'rgb(55, 65, 81)' : 'rgb(229, 231, 235)';

  const lineChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Calories',
        data: chartData.dailyTotals.map(d => d.calories),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Protein (g)',
        data: chartData.dailyTotals.map(d => d.protein),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
      },
    ],
  };

  const barChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Calories',
        data: chartData.dailyTotals.map(d => d.calories),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 4,
      },
    ],
  };

  const doughnutData = {
    labels: ['Consumed', 'Remaining'],
    datasets: [
      {
        data: [todayCalories, Math.max(0, dailyGoals.calories - todayCalories)],
        backgroundColor: ['rgb(34, 197, 94)', 'rgb(229, 231, 235)'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        ticks: { color: textColor },
        grid: { drawOnChartArea: false },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: textColor,
        },
      },
    },
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>📈 Weekly Nutrition Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 Daily Calories (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🎯 Today's Calorie Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
          <div className="text-center mt-4">
            <p className="text-lg font-semibold">
              {todayCalories} / {dailyGoals.calories} cal
            </p>
            <p className="text-sm text-gray-600">
              {Math.max(0, dailyGoals.calories - todayCalories)} remaining
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionCharts;
