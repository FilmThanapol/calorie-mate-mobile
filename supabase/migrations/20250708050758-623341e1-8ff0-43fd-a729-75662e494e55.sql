
-- Create meals table to store all meal entries
CREATE TABLE public.meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  food_name TEXT NOT NULL,
  amount TEXT NOT NULL,
  calories INTEGER NOT NULL CHECK (calories >= 0),
  protein DECIMAL(5,2) NOT NULL CHECK (protein >= 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TIME NOT NULL DEFAULT CURRENT_TIME,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create settings table to store daily goals
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  daily_calories INTEGER NOT NULL DEFAULT 2000 CHECK (daily_calories > 0),
  daily_protein DECIMAL(5,2) NOT NULL DEFAULT 150.0 CHECK (daily_protein > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.settings (daily_calories, daily_protein) VALUES (2000, 150.0);

-- Enable real-time updates for meals table
ALTER TABLE public.meals REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.meals;

-- Enable real-time updates for settings table
ALTER TABLE public.settings REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.settings;

-- Create indexes for better performance
CREATE INDEX idx_meals_date ON public.meals(date);
CREATE INDEX idx_meals_created_at ON public.meals(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON public.meals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
