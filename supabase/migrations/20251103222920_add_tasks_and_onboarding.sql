-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  category TEXT DEFAULT 'work', -- 'work', 'personal', 'health', 'learning', 'other'
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  position INTEGER DEFAULT 0, -- For drag-and-drop ordering
  linked_message_id UUID REFERENCES messages(id) ON DELETE SET NULL, -- Link to accomplishment
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_onboarding table to track onboarding progress
CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  current_step INTEGER DEFAULT 0,
  skipped BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_category ON tasks(category);
CREATE INDEX idx_tasks_position ON tasks(position);

-- Create trigger for updated_at column on tasks
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updated_at column on user_onboarding
CREATE TRIGGER update_user_onboarding_updated_at
  BEFORE UPDATE ON user_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

-- RLS policies for tasks
CREATE POLICY "Users can view their own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for user_onboarding
CREATE POLICY "Users can view their own onboarding"
  ON user_onboarding FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own onboarding"
  ON user_onboarding FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own onboarding"
  ON user_onboarding FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function to automatically create onboarding record for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_onboarding()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_onboarding (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create onboarding record
CREATE TRIGGER on_auth_user_created_onboarding
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_onboarding();

-- Comments for documentation
COMMENT ON TABLE tasks IS 'Stores user tasks and todos';
COMMENT ON TABLE user_onboarding IS 'Tracks user onboarding progress';
COMMENT ON COLUMN tasks.position IS 'Used for drag-and-drop ordering of tasks';
COMMENT ON COLUMN tasks.linked_message_id IS 'Links task to a specific accomplishment message';
