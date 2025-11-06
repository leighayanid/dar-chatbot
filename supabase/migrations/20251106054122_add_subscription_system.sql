-- =====================================================
-- DAR App - Subscription System Migration
-- =====================================================
-- This migration creates the complete subscription infrastructure
-- including plans, user/team subscriptions, usage tracking, and events

-- =====================================================
-- 1. SUBSCRIPTION PLANS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- 'free', 'pro', 'team', 'enterprise'
  display_name TEXT NOT NULL, -- 'Free', 'Pro', 'Team', 'Enterprise'
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- Feature limits stored as JSONB for flexibility
  features JSONB NOT NULL DEFAULT '{}'::JSONB,

  -- Plan metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Stripe integration
  stripe_product_id TEXT,
  stripe_price_monthly_id TEXT,
  stripe_price_yearly_id TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comments for documentation
COMMENT ON TABLE subscription_plans IS 'Defines available subscription plans and their features';
COMMENT ON COLUMN subscription_plans.features IS 'JSONB object containing feature flags and limits';

-- Create indexes
CREATE INDEX idx_subscription_plans_name ON subscription_plans(name);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);

-- =====================================================
-- 2. USER SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,

  -- Billing details
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),

  -- Subscription period
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,

  -- Stripe integration
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create partial unique index to ensure one active subscription per user
CREATE UNIQUE INDEX idx_user_subscriptions_active_unique
  ON user_subscriptions(user_id)
  WHERE status = 'active';

COMMENT ON TABLE user_subscriptions IS 'Individual user subscriptions and billing information';
COMMENT ON COLUMN user_subscriptions.status IS 'Subscription status synced from Stripe';

-- Create indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX idx_user_subscriptions_stripe_subscription ON user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_subscriptions_current_period_end ON user_subscriptions(current_period_end);

-- =====================================================
-- 3. TEAM SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS team_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,

  -- Billing details
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),

  -- Seat management
  seats_total INTEGER NOT NULL DEFAULT 0,
  seats_used INTEGER NOT NULL DEFAULT 0,

  -- Subscription period
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,

  -- Stripe integration
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Billing contact
  billing_email TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create partial unique index to ensure one active subscription per team
CREATE UNIQUE INDEX idx_team_subscriptions_active_unique
  ON team_subscriptions(team_id)
  WHERE status = 'active';

COMMENT ON TABLE team_subscriptions IS 'Team subscriptions with seat-based billing';
COMMENT ON COLUMN team_subscriptions.seats_total IS 'Total paid seats';
COMMENT ON COLUMN team_subscriptions.seats_used IS 'Currently occupied seats';

-- Create indexes
CREATE INDEX idx_team_subscriptions_team_id ON team_subscriptions(team_id);
CREATE INDEX idx_team_subscriptions_status ON team_subscriptions(status);
CREATE INDEX idx_team_subscriptions_stripe_customer ON team_subscriptions(stripe_customer_id);
CREATE INDEX idx_team_subscriptions_stripe_subscription ON team_subscriptions(stripe_subscription_id);

-- =====================================================
-- 4. USAGE TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Usage period
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Usage metrics (stored as JSONB for flexibility)
  metrics JSONB NOT NULL DEFAULT '{
    "messages": 0,
    "tasks": 0,
    "templates": 0,
    "reports": 0,
    "api_calls": 0
  }'::JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Ensure one record per user per month
  UNIQUE(user_id, period_start)
);

COMMENT ON TABLE usage_tracking IS 'Tracks monthly usage for billing and limits';
COMMENT ON COLUMN usage_tracking.metrics IS 'JSONB object with usage counters';

-- Create indexes
CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_period ON usage_tracking(period_start, period_end);
CREATE INDEX idx_usage_tracking_user_period ON usage_tracking(user_id, period_start);

-- =====================================================
-- 5. SUBSCRIPTION EVENTS TABLE (Audit Log)
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID, -- Can be user_subscription or team_subscription
  subscription_type TEXT CHECK (subscription_type IN ('user', 'team')),

  -- Event details
  event_type TEXT NOT NULL, -- 'created', 'updated', 'canceled', 'renewed', 'payment_failed', etc.
  event_data JSONB DEFAULT '{}'::JSONB,

  -- Stripe event
  stripe_event_id TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE subscription_events IS 'Audit log for all subscription-related events';
COMMENT ON COLUMN subscription_events.event_type IS 'Type of subscription event that occurred';

-- Create indexes
CREATE INDEX idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX idx_subscription_events_subscription_id ON subscription_events(subscription_id);
CREATE INDEX idx_subscription_events_created_at ON subscription_events(created_at DESC);
CREATE INDEX idx_subscription_events_stripe_event ON subscription_events(stripe_event_id);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Subscription Plans: Public read, admin write
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- User Subscriptions: Users can only see their own
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Team Subscriptions: Team members can view
CREATE POLICY "Team members can view team subscriptions"
  ON team_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_subscriptions.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage team subscriptions"
  ON team_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_subscriptions.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'owner'
    )
  );

-- Usage Tracking: Users can only see their own
CREATE POLICY "Users can view their own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- Subscription Events: Users can view their own events
CREATE POLICY "Users can view their own subscription events"
  ON subscription_events FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- 7. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_subscriptions_updated_at
  BEFORE UPDATE ON team_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get user's active subscription plan
CREATE OR REPLACE FUNCTION get_user_plan(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  plan_data JSONB;
BEGIN
  SELECT jsonb_build_object(
    'plan_name', sp.name,
    'plan_display_name', sp.display_name,
    'features', sp.features,
    'status', us.status,
    'current_period_end', us.current_period_end,
    'is_trial', us.trial_end > now()
  )
  INTO plan_data
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = user_id_param
    AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;

  -- If no subscription, return free plan
  IF plan_data IS NULL THEN
    SELECT jsonb_build_object(
      'plan_name', name,
      'plan_display_name', display_name,
      'features', features,
      'status', 'active',
      'current_period_end', NULL,
      'is_trial', false
    )
    INTO plan_data
    FROM subscription_plans
    WHERE name = 'free';
  END IF;

  RETURN plan_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check feature access
CREATE OR REPLACE FUNCTION has_feature_access(
  user_id_param UUID,
  feature_key TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  plan_features JSONB;
  has_access BOOLEAN;
BEGIN
  -- Get user's plan features
  SELECT sp.features INTO plan_features
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = user_id_param
    AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;

  -- If no subscription, use free plan
  IF plan_features IS NULL THEN
    SELECT features INTO plan_features
    FROM subscription_plans
    WHERE name = 'free';
  END IF;

  -- Check if feature exists and is enabled
  has_access := COALESCE(
    (plan_features->'features'->feature_key)::BOOLEAN,
    false
  );

  RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get usage limits
CREATE OR REPLACE FUNCTION get_usage_limit(
  user_id_param UUID,
  limit_key TEXT
)
RETURNS INTEGER AS $$
DECLARE
  plan_features JSONB;
  limit_value INTEGER;
BEGIN
  -- Get user's plan features
  SELECT sp.features INTO plan_features
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = user_id_param
    AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;

  -- If no subscription, use free plan
  IF plan_features IS NULL THEN
    SELECT features INTO plan_features
    FROM subscription_plans
    WHERE name = 'free';
  END IF;

  -- Get the limit value (-1 means unlimited)
  limit_value := COALESCE(
    (plan_features->'limits'->limit_key)::INTEGER,
    0
  );

  RETURN limit_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is within usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  user_id_param UUID,
  metric_key TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  current_usage INTEGER;
  usage_limit INTEGER;
BEGIN
  -- Get current month's usage
  SELECT COALESCE(
    (metrics->metric_key)::INTEGER,
    0
  )
  INTO current_usage
  FROM usage_tracking
  WHERE user_id = user_id_param
    AND period_start = date_trunc('month', now());

  -- Get user's limit
  usage_limit := get_usage_limit(user_id_param, metric_key);

  -- -1 means unlimited
  IF usage_limit = -1 THEN
    RETURN true;
  END IF;

  -- Check if within limit
  RETURN COALESCE(current_usage, 0) < usage_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION increment_usage(
  user_id_param UUID,
  metric_key TEXT,
  increment_by INTEGER DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
  current_period_start TIMESTAMP WITH TIME ZONE;
  current_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate current billing period
  current_period_start := date_trunc('month', now());
  current_period_end := (current_period_start + INTERVAL '1 month');

  -- Insert or update usage tracking
  INSERT INTO usage_tracking (user_id, period_start, period_end, metrics)
  VALUES (
    user_id_param,
    current_period_start,
    current_period_end,
    jsonb_build_object(metric_key, increment_by)
  )
  ON CONFLICT (user_id, period_start)
  DO UPDATE SET
    metrics = jsonb_set(
      usage_tracking.metrics,
      ARRAY[metric_key],
      to_jsonb(COALESCE((usage_tracking.metrics->metric_key)::INTEGER, 0) + increment_by)
    ),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log subscription events
CREATE OR REPLACE FUNCTION log_subscription_event(
  user_id_param UUID,
  subscription_id_param UUID,
  subscription_type_param TEXT,
  event_type_param TEXT,
  event_data_param JSONB DEFAULT '{}'::JSONB,
  stripe_event_id_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO subscription_events (
    user_id,
    subscription_id,
    subscription_type,
    event_type,
    event_data,
    stripe_event_id
  )
  VALUES (
    user_id_param,
    subscription_id_param,
    subscription_type_param,
    event_type_param,
    event_data_param,
    stripe_event_id_param
  )
  RETURNING id INTO event_id;

  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-log subscription events
CREATE OR REPLACE FUNCTION auto_log_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_subscription_event(
      NEW.user_id,
      NEW.id,
      'user',
      'subscription_created',
      jsonb_build_object('plan_id', NEW.plan_id, 'status', NEW.status)
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM log_subscription_event(
      NEW.user_id,
      NEW.id,
      'user',
      'subscription_status_changed',
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_user_subscription_changes
  AFTER INSERT OR UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION auto_log_subscription_change();

-- =====================================================
-- 8. SEED DATA - DEFAULT SUBSCRIPTION PLANS
-- =====================================================

INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, features, sort_order)
VALUES
  -- Free Plan
  (
    'free',
    'Free',
    'Perfect for individuals getting started with daily reflection',
    0.00,
    0.00,
    '{
      "limits": {
        "messages": 50,
        "tasks": 25,
        "templates": 3,
        "history_days": 30
      },
      "features": {
        "ai_chat": true,
        "message_history": true,
        "data_export": "basic",
        "dark_mode": true,
        "mobile_responsive": true,
        "email_notifications": false,
        "api_access": false,
        "recurring_tasks": false,
        "task_templates": false,
        "ai_insights": false,
        "goal_tracking": 0,
        "custom_reports": false,
        "team_features": false
      }
    }'::JSONB,
    1
  ),

  -- Pro Plan
  (
    'pro',
    'Pro',
    'For professionals who want advanced personal productivity',
    9.00,
    90.00,
    '{
      "limits": {
        "messages": -1,
        "tasks": -1,
        "templates": -1,
        "history_days": -1
      },
      "features": {
        "ai_chat": true,
        "message_history": true,
        "data_export": "advanced",
        "dark_mode": true,
        "mobile_responsive": true,
        "email_notifications": true,
        "api_access": false,
        "recurring_tasks": true,
        "task_templates": true,
        "ai_insights": true,
        "goal_tracking": 5,
        "custom_reports": true,
        "team_features": false,
        "priority_support": true,
        "calendar_sync": true,
        "custom_reminders": true
      }
    }'::JSONB,
    2
  ),

  -- Team Plan
  (
    'team',
    'Team',
    'Collaboration and team management features',
    15.00,
    150.00,
    '{
      "limits": {
        "messages": -1,
        "tasks": -1,
        "templates": -1,
        "history_days": -1,
        "team_members": 50
      },
      "features": {
        "ai_chat": true,
        "message_history": true,
        "data_export": "advanced",
        "dark_mode": true,
        "mobile_responsive": true,
        "email_notifications": true,
        "api_access": "rate_limited",
        "recurring_tasks": true,
        "task_templates": true,
        "ai_insights": true,
        "goal_tracking": -1,
        "custom_reports": true,
        "team_features": true,
        "priority_support": true,
        "calendar_sync": true,
        "custom_reminders": true,
        "team_analytics": true,
        "role_based_access": true,
        "shared_templates": true,
        "task_assignment": true,
        "comments_feedback": true,
        "slack_integration": true
      }
    }'::JSONB,
    3
  ),

  -- Enterprise Plan
  (
    'enterprise',
    'Enterprise',
    'Advanced security, compliance, and dedicated support',
    20.00,
    200.00,
    '{
      "limits": {
        "messages": -1,
        "tasks": -1,
        "templates": -1,
        "history_days": -1,
        "team_members": -1
      },
      "features": {
        "ai_chat": true,
        "message_history": true,
        "data_export": "custom",
        "dark_mode": true,
        "mobile_responsive": true,
        "email_notifications": true,
        "api_access": "full",
        "recurring_tasks": true,
        "task_templates": true,
        "ai_insights": true,
        "goal_tracking": -1,
        "custom_reports": true,
        "team_features": true,
        "priority_support": true,
        "calendar_sync": true,
        "custom_reminders": true,
        "team_analytics": true,
        "role_based_access": true,
        "shared_templates": true,
        "task_assignment": true,
        "comments_feedback": true,
        "slack_integration": true,
        "sso_saml": true,
        "audit_logs": true,
        "data_retention_control": true,
        "soc2_compliance": true,
        "custom_integrations": true,
        "dedicated_support": true,
        "sla": "99.9%",
        "onboarding": "dedicated_csm"
      }
    }'::JSONB,
    4
  )
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 9. HELPER VIEW FOR EASY ACCESS
-- =====================================================

-- View to easily get user's current subscription details
CREATE OR REPLACE VIEW user_subscription_details AS
SELECT
  us.id AS subscription_id,
  us.user_id,
  sp.name AS plan_name,
  sp.display_name AS plan_display_name,
  sp.features,
  us.status,
  us.billing_cycle,
  us.current_period_start,
  us.current_period_end,
  us.trial_end,
  CASE
    WHEN us.trial_end > now() THEN true
    ELSE false
  END AS is_trial,
  us.stripe_customer_id,
  us.stripe_subscription_id
FROM user_subscriptions us
JOIN subscription_plans sp ON sp.id = us.plan_id
WHERE us.status = 'active';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Add helpful comment
COMMENT ON SCHEMA public IS 'DAR App schema with subscription system v1.0';
