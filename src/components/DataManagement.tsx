import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  Upload, 
  Database, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Cloud,
  HardDrive
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';

const DataManagement: React.FC = () => {
  const { state, actions } = useData();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      const data = actions.exportData();
      
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nutritrack-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setError('Failed to export data');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      
      const headers = [
        'Date', 'Time', 'Food Name', 'Amount', 'Calories', 'Protein (g)', 
        'Carbs (g)', 'Fat (g)', 'Fiber (g)', 'Sugar (g)', 'Sodium (mg)', 'Image URL'
      ];
      
      const csvContent = [
        headers.join(','),
        ...state.meals.map(meal => [
          meal.date,
          meal.time,
          `"${meal.food_name}"`,
          `"${meal.amount}"`,
          meal.calories,
          meal.protein,
          meal.carbs,
          meal.fat,
          meal.fiber,
          meal.sugar,
          meal.sodium,
          meal.image_url || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `nutritrack-meals-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setError('Failed to export CSV');
      console.error('CSV export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setError(null);

      const text = await file.text();
      
      if (file.name.endsWith('.json')) {
        await actions.importData(text);
      } else if (file.name.endsWith('.csv')) {
        // Parse CSV and convert to JSON format
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        const meals = lines.slice(1)
          .filter(line => line.trim())
          .map((line, index) => {
            const values = line.split(',');
            return {
              id: `imported_${Date.now()}_${index}`,
              date: values[0],
              time: values[1],
              food_name: values[2].replace(/"/g, ''),
              amount: values[3].replace(/"/g, ''),
              calories: Number(values[4]) || 0,
              protein: Number(values[5]) || 0,
              carbs: Number(values[6]) || 0,
              fat: Number(values[7]) || 0,
              fiber: Number(values[8]) || 0,
              sugar: Number(values[9]) || 0,
              sodium: Number(values[10]) || 0,
              image_url: values[11] || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          });

        const importData = {
          meals,
          settings: state.settings,
          exportedAt: new Date().toISOString(),
        };

        await actions.importData(JSON.stringify(importData));
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV files.');
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      setError(`Failed to import file: ${(error as Error).message}`);
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const getDataStats = () => {
    const totalMeals = state.meals.length;
    const uniqueDays = new Set(state.meals.map(meal => meal.date)).size;
    const totalCalories = state.meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = state.meals.reduce((sum, meal) => sum + meal.protein, 0);

    return { totalMeals, uniqueDays, totalCalories, totalProtein };
  };

  const stats = getDataStats();

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      {showSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Operation completed successfully! 🎉
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Data Overview */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalMeals}</div>
              <div className="text-sm text-gray-500">Total Meals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.uniqueDays}</div>
              <div className="text-sm text-gray-500">Days Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalCalories.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Calories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(stats.totalProtein)}g</div>
              <div className="text-sm text-gray-500">Total Protein</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Your Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Download your nutrition data for backup or to use in other applications.
              </p>
              
              <div className="grid gap-4">
                <Button
                  onClick={handleExportJSON}
                  disabled={isExporting || state.meals.length === 0}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <HardDrive className="mr-2 h-4 w-4" />
                  Export as JSON (Complete Backup)
                  {isExporting && <div className="ml-auto animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>}
                </Button>
                
                <Button
                  onClick={handleExportCSV}
                  disabled={isExporting || state.meals.length === 0}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Export as CSV (Meals Only)
                  {isExporting && <div className="ml-auto animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>}
                </Button>
              </div>

              {state.meals.length === 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No data to export. Add some meals first!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Import nutrition data from a backup file or CSV export.
              </p>
              
              <div>
                <Label htmlFor="import-file">Select File</Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".json,.csv"
                  onChange={handleImportFile}
                  disabled={isImporting}
                  className="mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats: JSON (complete backup) or CSV (meals only)
                </p>
              </div>

              {isImporting && (
                <Alert>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <AlertDescription>
                    Importing data... Please wait.
                  </AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> Importing will merge with your existing data. 
                  Duplicate entries may be created. Consider exporting your current data first as a backup.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataManagement;
