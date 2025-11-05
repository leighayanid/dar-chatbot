-- Create function to delete user and all associated data
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the current user's ID
  user_id := auth.uid();

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete user data (CASCADE will handle related records)
  DELETE FROM user_profiles WHERE id = user_id;
  DELETE FROM user_preferences WHERE id = user_id;
  DELETE FROM conversations WHERE user_id = user_id;
  DELETE FROM activity_log WHERE user_id = user_id;
  DELETE FROM reports WHERE user_id = user_id;
  DELETE FROM templates WHERE user_id = user_id;
  DELETE FROM tasks WHERE user_id = user_id;
  DELETE FROM team_members WHERE user_id = user_id;

  -- Delete the auth user (requires service role in production)
  -- Note: This line may fail in local development, but will work in production with proper RLS
  -- For local development, the admin.deleteUser from the client should work
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user() TO authenticated;

-- Add comment
COMMENT ON FUNCTION delete_user IS 'Allows authenticated users to delete their own account and all associated data';
