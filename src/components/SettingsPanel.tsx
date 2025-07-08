
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface DailyGoals {
  calories: number;
  protein: number;
}

interface SettingsPanelProps {
  dailyGoals: DailyGoals;
  onGoalsUpdate: (goals: DailyGoals) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ dailyGoals, onGoalsUpdate }) => {
  const [calories, setCalories] = useState(dailyGoals.calories.toString());
  const [protein, setProtein] = useState(dailyGoals.protein.toString());
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCalories = parseInt(calories);
    const newProtein = parseFloat(protein);

    if (isNaN(newCalories) || isNaN(newProtein) || newCalories <= 0 || newProtein <= 0) {
      toast({
        title: "Invalid values",
        description: "Please enter valid positive numbers for your goals.",
        variant: "destructive",
      });
      return;
    }

    onGoalsUpdate({
      calories: newCalories,
      protein: newProtein
    });

    toast({
      title: "Goals updated!",
      description: "Your daily nutrition goals have been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Daily Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="calories-goal">Daily Calories Goal</Label>
                <Input
                  id="calories-goal"
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="2000"
                  min="1"
                  required
                />
                <p className="text-sm text-gray-500">
                  Recommended: 1800-2500 calories per day
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="protein-goal">Daily Protein Goal (g)</Label>
                <Input
                  id="protein-goal"
                  type="number"
                  step="0.1"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="150"
                  min="0.1"
                  required
                />
                <p className="text-sm text-gray-500">
                  Recommended: 0.8-2.2g per kg body weight
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Goals
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            About NutriTrack
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Features</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Track daily calories and protein intake</li>
              <li>• Add photos to your meal entries</li>
              <li>• Visual progress tracking with charts</li>
              <li>• Set personalized nutrition goals</li>
              <li>• View meal history and analytics</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Tips</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Log meals as soon as you eat them</li>
              <li>• Use a food scale for accurate portions</li>
              <li>• Take photos to track your meal quality</li>
              <li>• Adjust goals based on your activity level</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
