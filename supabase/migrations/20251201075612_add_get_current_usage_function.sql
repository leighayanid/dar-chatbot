-- =====================================================
-- Add get_current_usage function
-- =====================================================
-- This migration adds the missing get_current_usage function
-- that the subscription context needs to fetch usage metrics

-- Function to get current usage for a specific metric
CREATE OR REPLACE FUNCTION get_current_usage(
  user_id_param UUID,
  metric_param TEXT
)
RETURNS INTEGER AS $$
DECLARE
  usage_value INTEGER;
BEGIN
  -- Get current month's usage for the specified metric
  SELECT COALESCE(
    (metrics->metric_param)::INTEGER,
    0
  )
  INTO usage_value
  FROM usage_tracking
  WHERE user_id = user_id_param
    AND period_start = date_trunc('month', now());

  -- If no record exists for current month, return 0
  RETURN COALESCE(usage_value, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION get_current_usage IS 'Returns current month usage for a specific metric (messages, tasks, templates, reports, api_calls)';
