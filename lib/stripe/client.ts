import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Server-side Stripe client (uses placeholder during build)
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'sk_placeholder_for_build',
  {
    apiVersion: '2025-10-29.clover',
    typescript: true,
  }
)

// Client-side Stripe instance (lazy loaded)
let stripePromise: ReturnType<typeof loadStripe>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}
