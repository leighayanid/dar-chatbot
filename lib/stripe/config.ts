import Stripe from 'stripe'

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
})

// Stripe price IDs for each plan and billing cycle
// These will be created in Stripe Dashboard and added to environment variables
export const STRIPE_PRICES = {
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || '',
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
  },
  team: {
    monthly: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID || '',
    yearly: process.env.STRIPE_TEAM_YEARLY_PRICE_ID || '',
  },
} as const

// Plan names that match database
export const PLAN_NAMES = {
  FREE: 'free',
  PRO: 'pro',
  TEAM: 'team',
  ENTERPRISE: 'enterprise',
} as const

export type PlanName = (typeof PLAN_NAMES)[keyof typeof PLAN_NAMES]
export type BillingCycle = 'monthly' | 'yearly'
