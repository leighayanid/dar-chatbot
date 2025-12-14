export type Conversation = {
  id: string
  title: string | null
  user_id: string | null
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  conversation_id: string | null
  user_id: string | null
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export type SubscriptionPlan = {
  id: string
  name: string
  display_name: string
  description: string | null
  price_monthly: number
  price_yearly: number
  stripe_product_id: string | null
  stripe_price_monthly_id: string | null
  stripe_price_yearly_id: string | null
  features: any
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type UserSubscription = {
  id: string
  user_id: string
  plan_id: string
  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  status: 'active' | 'past_due' | 'cancelled' | 'trialing'
  billing_cycle: 'monthly' | 'yearly'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      conversations: {
        Row: Conversation
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Conversation, 'id' | 'created_at' | 'updated_at'>>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Message, 'id' | 'created_at'>>
      }
      subscription_plans: {
        Row: SubscriptionPlan
        Insert: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>>
      }
      user_subscriptions: {
        Row: UserSubscription
        Insert: Omit<UserSubscription, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<UserSubscription, 'id' | 'created_at' | 'updated_at'>>
      }
      team_subscriptions: {
        Row: {
          id: string
          team_id: string
          plan_id: string
          status: string
          billing_cycle: string
          seats_total: number
          seats_used: number
          current_period_start: string | null
          current_period_end: string | null
          trial_start: string | null
          trial_end: string | null
          canceled_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          billing_email: string | null
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: Omit<{
          id: string
          team_id: string
          plan_id: string
          status: string
          billing_cycle: string
          seats_total: number
          seats_used: number
          current_period_start: string | null
          current_period_end: string | null
          trial_start: string | null
          trial_end: string | null
          canceled_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          billing_email: string | null
          metadata: any
          created_at: string
          updated_at: string
        }, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<{
          id: string
          team_id: string
          plan_id: string
          status: string
          billing_cycle: string
          seats_total: number
          seats_used: number
          current_period_start: string | null
          current_period_end: string | null
          trial_start: string | null
          trial_end: string | null
          canceled_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          billing_email: string | null
          metadata: any
          created_at: string
          updated_at: string
        }, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
