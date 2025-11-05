-- Add ui_size column to user_preferences table
ALTER TABLE user_preferences
ADD COLUMN ui_size TEXT DEFAULT 'default' CHECK (ui_size IN ('compact', 'default', 'comfortable'));

-- Comment for documentation
COMMENT ON COLUMN user_preferences.ui_size IS 'User interface size preference: compact, default, or comfortable';
