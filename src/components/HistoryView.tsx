
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Calendar,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Image,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react';
import { useData, type MealData } from '@/contexts/DataContext';
import MealEntryForm from './MealEntryForm';

interface HistoryViewProps {
  meals: MealData[];
  isDark?: boolean;
  isLoading?: boolean;
}

type SortField = 'date' | 'calories' | 'protein' | 'food_name';
type SortDirection = 'asc' | 'desc';

const HistoryView: React.FC<HistoryViewProps> = ({
  meals,
  isDark = false,
  isLoading = false
}) => {
  const { actions } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [editingMeal, setEditingMeal] = useState<MealData | null>(null);
  const [showMealEntry, setShowMealEntry] = useState(false);
  const [deletingMeals, setDeletingMeals] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  // CRUD Functions
  const handleEdit = (meal: MealData) => {
    setEditingMeal(meal);
  };

  const handleDelete = async (mealIds: string[]) => {
    setIsDeleting(true);
    setError(null);

    try {
      for (const id of mealIds) {
        await actions.deleteMeal(id);
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setSelectedMeals([]);
    } catch (error) {
      setError('Failed to delete meals. Please try again.');
      console.error('Error deleting meals:', error);
    } finally {
      setIsDeleting(false);
      setDeletingMeals([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedMeals.length > 0) {
      setDeletingMeals(selectedMeals);
    }
  };

  const handleSelectMeal = (mealId: string, checked: boolean) => {
    if (checked) {
      setSelectedMeals(prev => [...prev, mealId]);
    } else {
      setSelectedMeals(prev => prev.filter(id => id !== mealId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMeals(filteredAndSortedMeals.map(meal => meal.id));
    } else {
      setSelectedMeals([]);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Date', 'Time', 'Food Name', 'Amount', 'Calories', 'Protein (g)'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredAndSortedMeals.map(meal => [
        meal.date,
        meal.time,
        `"${meal.food_name}"`,
        `"${meal.amount}"`,
        meal.calories,
        meal.protein
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meal-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter and sort meals
  const filteredAndSortedMeals = useMemo(() => {
    let filtered = meals;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(meal =>
        meal.food_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.amount.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(meal => new Date(meal.date) >= filterDate);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(meal => new Date(meal.date) >= filterDate);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(meal => new Date(meal.date) >= filterDate);
          break;
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'date') {
        aValue = new Date(a.date + ' ' + a.time);
        bValue = new Date(b.date + ' ' + b.time);
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [meals, searchTerm, dateFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedMeals.length / itemsPerPage);
  const paginatedMeals = filteredAndSortedMeals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get nutrition summary for filtered data
  const summary = useMemo(() => {
    const totalCalories = filteredAndSortedMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = filteredAndSortedMeals.reduce((sum, meal) => sum + meal.protein, 0);
    const avgCalories = filteredAndSortedMeals.length > 0 ? Math.round(totalCalories / filteredAndSortedMeals.length) : 0;
    const avgProtein = filteredAndSortedMeals.length > 0 ? Math.round((totalProtein / filteredAndSortedMeals.length) * 10) / 10 : 0;

    return {
      totalMeals: filteredAndSortedMeals.length,
      totalCalories,
      totalProtein,
      avgCalories,
      avgProtein
    };
  }, [filteredAndSortedMeals]);

  if (isLoading) {
    return (
      <Card className={`${isDark ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm`}>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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

      {/* Action Bar */}
      <Card className={`${isDark ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm`}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={() => setShowMealEntry(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Meal
              </Button>

              {selectedMeals.length > 0 && (
                <Button
                  onClick={handleBulkDelete}
                  variant="destructive"
                  disabled={isDeleting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({selectedMeals.length})
                </Button>
              )}

              <Button onClick={exportToCSV} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              {selectedMeals.length > 0 && `${selectedMeals.length} selected • `}
              {filteredAndSortedMeals.length} meals found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={`${isDark ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm`}>
          <CardContent className="p-4">
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {summary.totalMeals}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Total Meals
            </div>
          </CardContent>
        </Card>
        
        <Card className={`${isDark ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm`}>
          <CardContent className="p-4">
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {summary.totalCalories.toLocaleString()}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Total Calories
            </div>
          </CardContent>
        </Card>
        
        <Card className={`${isDark ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm`}>
          <CardContent className="p-4">
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {summary.totalProtein}g
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Total Protein
            </div>
          </CardContent>
        </Card>
        
        <Card className={`${isDark ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm`}>
          <CardContent className="p-4">
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {summary.avgCalories}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Avg Calories/Meal
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className={`${isDark ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm`}>
        <CardHeader>
          <CardTitle className={`flex items-center justify-between ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Meal History
            </span>
            <Button
              onClick={exportToCSV}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search meals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {filteredAndSortedMeals.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-300'}`} />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                No meals found matching your criteria
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedMeals.length === filteredAndSortedMeals.length && filteredAndSortedMeals.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => handleSort('date')}
                      >
                        <div className="flex items-center gap-2">
                          Date & Time
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => handleSort('food_name')}
                      >
                        <div className="flex items-center gap-2">
                          Food
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => handleSort('calories')}
                      >
                        <div className="flex items-center gap-2">
                          Calories
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => handleSort('protein')}
                      >
                        <div className="flex items-center gap-2">
                          Protein
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedMeals.map((meal, index) => (
                      <TableRow key={`${meal.date}-${meal.time}-${index}`}>
                        <TableCell>
                          <Checkbox
                            checked={selectedMeals.includes(meal.id)}
                            onCheckedChange={(checked) => handleSelectMeal(meal.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {new Date(meal.date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {meal.time}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {meal.food_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {meal.amount}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {meal.calories} cal
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {meal.protein}g
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {meal.image_url ? (
                            <Image className="h-4 w-4 text-green-500" />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(meal)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeletingMeals([meal.id])}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredAndSortedMeals.length)} of{' '}
                    {filteredAndSortedMeals.length} meals
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Meal Entry Form */}
      {showMealEntry && (
        <MealEntryForm
          isOpen={showMealEntry}
          onClose={() => setShowMealEntry(false)}
          onSuccess={() => setShowMealEntry(false)}
        />
      )}

      {/* Edit Meal Form */}
      {editingMeal && (
        <MealEntryForm
          meal={editingMeal}
          isOpen={!!editingMeal}
          onClose={() => setEditingMeal(null)}
          onSuccess={() => setEditingMeal(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingMeals.length > 0} onOpenChange={() => setDeletingMeals([])}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Meal{deletingMeals.length > 1 ? 's' : ''}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingMeals.length} meal{deletingMeals.length > 1 ? 's' : ''}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deletingMeals)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HistoryView;
