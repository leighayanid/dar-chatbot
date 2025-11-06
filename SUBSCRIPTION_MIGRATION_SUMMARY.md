# Subscription System Migration Summary

## ✅ Migration Applied Successfully

Migration file: `supabase/migrations/20251106054122_add_subscription_system.sql`

## 📊 Database Objects Created

### 1. Tables (5)

#### `subscription_plans`
- **Purpose**: Defines available subscription tiers (Free, Pro, Team, Enterprise)
- **Key Columns**:
  - `id`, `name`, `display_name`, `description`
  - `price_monthly`, `price_yearly`
  - `features` (JSONB) - Flexible feature flags and limits
  - `stripe_product_id`, `stripe_price_monthly_id`, `stripe_price_yearly_id`
- **Seed Data**: ✅ Pre-populated with 4 plans

#### `user_subscriptions`
- **Purpose**: Individual user subscriptions and billing
- **Key Columns**:
  - `user_id`, `plan_id`, `status`, `billing_cycle`
  - `current_period_start/end`, `trial_start/end`
  - `stripe_customer_id`, `stripe_subscription_id`, `stripe_price_id`
- **Constraints**: One active subscription per user (partial unique index)

#### `team_subscriptions`
- **Purpose**: Team subscriptions with seat-based billing
- **Key Columns**:
  - `team_id`, `plan_id`, `status`, `billing_cycle`
  - `seats_total`, `seats_used`
  - `billing_email`, `stripe_customer_id`, `stripe_subscription_id`
- **Constraints**: One active subscription per team (partial unique index)

#### `usage_tracking`
- **Purpose**: Track monthly usage for metering and limits
- **Key Columns**:
  - `user_id`, `period_start`, `period_end`
  - `metrics` (JSONB) - messages, tasks, templates, reports, api_calls
- **Constraints**: One record per user per month

#### `subscription_events`
- **Purpose**: Audit log for all subscription changes
- **Key Columns**:
  - `user_id`, `subscription_id`, `subscription_type`
  - `event_type`, `event_data` (JSONB), `stripe_event_id`

### 2. Indexes (22)

Performance indexes on:
- `subscription_plans`: name, is_active
- `user_subscriptions`: user_id, status, stripe_customer_id, stripe_subscription_id, current_period_end, active_unique
- `team_subscriptions`: team_id, status, stripe_customer_id, stripe_subscription_id, active_unique
- `usage_tracking`: user_id, period, user_period
- `subscription_events`: user_id, subscription_id, created_at, stripe_event_id

### 3. RLS Policies (9)

- **subscription_plans**: Public read for active plans
- **user_subscriptions**: Users view/update own subscriptions
- **team_subscriptions**: Team members view, owners manage
- **usage_tracking**: Users view own usage
- **subscription_events**: Users view own events

### 4. Functions (8)

#### Feature Gating & Limits:
- `get_user_plan(user_id)` - Get user's active plan details
- `has_feature_access(user_id, feature_key)` - Check feature access
- `get_usage_limit(user_id, limit_key)` - Get usage limit for a metric
- `check_usage_limit(user_id, metric_key)` - Check if within limits

#### Usage Tracking:
- `increment_usage(user_id, metric_key, increment_by)` - Increment usage counter

#### Event Logging:
- `log_subscription_event(...)` - Log subscription events
- `auto_log_subscription_change()` - Trigger function for auto-logging

#### Utility:
- `update_updated_at_column()` - Auto-update timestamps

### 5. Triggers (5)

- `update_subscription_plans_updated_at`
- `update_user_subscriptions_updated_at`
- `update_team_subscriptions_updated_at`
- `update_usage_tracking_updated_at`
- `log_user_subscription_changes` - Auto-log events

### 6. View (1)

- `user_subscription_details` - Easy access to current subscription info

## 💎 Pre-Seeded Plans

### Free Plan ($0/month)
- 50 messages/month, 25 tasks, 3 templates
- 30 days history
- Basic features only

### Pro Plan ($9/month, $90/year)
- Unlimited messages, tasks, templates
- Full history
- AI insights, goal tracking (5 goals), custom reports
- Email notifications, calendar sync, priority support

### Team Plan ($15/user/month, $150/user/year)
- All Pro features
- 2-50 team members
- Team analytics, role-based access, shared templates
- Task assignment, comments, Slack integration

### Enterprise Plan ($20+/user/month, custom pricing)
- All Team features
- Unlimited members
- SSO/SAML, audit logs, SOC2 compliance
- Full API access, custom integrations
- Dedicated support, 99.9% SLA

## 🔧 How to Use

### Query User's Plan
```sql
SELECT * FROM get_user_plan('user-uuid-here');
```

### Check Feature Access
```sql
SELECT has_feature_access('user-uuid-here', 'ai_insights');
```

### Check Usage Limits
```sql
SELECT check_usage_limit('user-uuid-here', 'messages');
```

### Increment Usage
```sql
SELECT increment_usage('user-uuid-here', 'messages', 1);
```

### View Current Subscription
```sql
SELECT * FROM user_subscription_details WHERE user_id = 'user-uuid-here';
```

### View All Plans
```sql
SELECT name, display_name, price_monthly, price_yearly
FROM subscription_plans
WHERE is_active = true
ORDER BY sort_order;
```

## 📝 Next Steps

1. **Test the schema locally**:
   ```bash
   supabase db reset  # Already done! ✅
   ```

2. **Implement Stripe integration**:
   - Create products and prices in Stripe Dashboard
   - Update `stripe_product_id` and `stripe_price_*_id` in subscription_plans
   - Implement webhook handlers (see PRICING_PLAN.md)

3. **Build subscription context**:
   - Create `lib/subscription/subscription-context.tsx`
   - Hook into feature gating functions

4. **Create pricing page**:
   - Display plans from `subscription_plans` table
   - Checkout flow with Stripe Elements

5. **Add feature gates**:
   - Wrap features with `has_feature_access()` checks
   - Display upgrade prompts when limits hit

6. **Implement usage tracking**:
   - Call `increment_usage()` when users:
     - Send messages
     - Create tasks
     - Generate reports
     - Use API

7. **Deploy to production**:
   ```bash
   supabase link  # Link to production project
   supabase db push  # Push migrations
   ```

## 🎉 Success!

Your DAR app now has a complete subscription system infrastructure ready for monetization!
