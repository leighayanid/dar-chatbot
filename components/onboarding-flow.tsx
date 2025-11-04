'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth/auth-context'
import {
  XIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  MessageSquareIcon,
  CheckSquareIcon,
  TrendingUpIcon,
  SparklesIcon,
} from 'lucide-react'

interface OnboardingState {
  completed: boolean
  current_step: number
  skipped: boolean
}

const ONBOARDING_STEPS = [
  {
    title: 'Welcome to DAR!',
    description: 'Track your daily accomplishments with AI-powered assistance',
    icon: SparklesIcon,
    color: 'from-blue-400 to-cyan-400',
    content: 'Daily Accomplishment Report (DAR) helps you capture, reflect on, and analyze your daily achievements with the help of AI. Let\'s get you started!',
  },
  {
    title: 'Chat with AI',
    description: 'Log your accomplishments in natural conversation',
    icon: MessageSquareIcon,
    color: 'from-purple-400 to-pink-400',
    content: 'Simply type what you accomplished today, and our AI assistant will help you reflect on your achievements, ask insightful questions, and provide encouragement.',
  },
  {
    title: 'Manage Tasks',
    description: 'Create and organize your todos',
    icon: CheckSquareIcon,
    color: 'from-green-400 to-emerald-400',
    content: 'Keep track of your tasks with our built-in task manager. Set priorities, categories, due dates, and even link tasks to your accomplishments.',
  },
  {
    title: 'Track Progress',
    description: 'Visualize your productivity patterns',
    icon: TrendingUpIcon,
    color: 'from-rose-400 to-orange-400',
    content: 'View detailed analytics including activity heatmaps, streaks, and statistics. See how productive you\'ve been and identify patterns in your accomplishments.',
  },
  {
    title: 'You\'re All Set!',
    description: 'Start tracking your accomplishments',
    icon: CheckCircleIcon,
    color: 'from-indigo-400 to-purple-400',
    content: 'You\'re ready to start using DAR! Begin by typing your first accomplishment in the chat below, or explore the features at your own pace.',
  },
]

export function OnboardingFlow() {
  const { user } = useAuth()
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    async function loadOnboardingState() {
      if (!user) return

      try {
        setLoading(true)

        // Check if user has onboarding record
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw error
        }

        if (data) {
          setOnboardingState(data as any)
          setCurrentStep((data as any).current_step || 0)
        } else {
          // Create onboarding record if it doesn't exist
          const { data: newData, error: insertError } = await supabase
            .from('user_onboarding')
            // @ts-ignore - Supabase type inference issue
            .insert({
              id: user.id,
              completed: false,
              current_step: 0,
              skipped: false,
            })
            .select()
            .single()

          if (insertError) throw insertError
          setOnboardingState(newData)
          setCurrentStep(0)
        }
      } catch (err) {
        console.error('Error loading onboarding state:', err)
      } finally {
        setLoading(false)
      }
    }

    loadOnboardingState()
  }, [user])

  const updateOnboardingState = async (updates: Partial<OnboardingState>) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_onboarding')
        // @ts-ignore - Supabase type inference issue
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          ...(updates.completed && { completed_at: new Date().toISOString() }),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setOnboardingState(data)
    } catch (err) {
      console.error('Error updating onboarding state:', err)
    }
  }

  const handleNext = async () => {
    const nextStep = currentStep + 1
    setCurrentStep(nextStep)

    if (nextStep >= ONBOARDING_STEPS.length) {
      // Complete onboarding
      await updateOnboardingState({ completed: true, current_step: nextStep })
    } else {
      // Update current step
      await updateOnboardingState({ current_step: nextStep })
    }
  }

  const handlePrevious = () => {
    const prevStep = Math.max(0, currentStep - 1)
    setCurrentStep(prevStep)
    updateOnboardingState({ current_step: prevStep })
  }

  const handleSkip = async () => {
    await updateOnboardingState({ skipped: true, completed: true })
  }

  const handleClose = async () => {
    await updateOnboardingState({ completed: true })
  }

  // Don't show onboarding if loading, completed, or skipped
  if (loading || !onboardingState || onboardingState.completed || onboardingState.skipped) {
    return null
  }

  const step = ONBOARDING_STEPS[currentStep]
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1
  const StepIcon = step.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-xl bg-zinc-100 p-2 text-zinc-700 transition-all hover:scale-105 hover:bg-zinc-200 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          title="Close onboarding"
        >
          <XIcon className="size-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className={`rounded-3xl bg-gradient-to-br ${step.color} p-6 shadow-lg`}>
              <StepIcon className="size-12 text-white" />
            </div>
          </div>

          {/* Title and Description */}
          <div className="mb-6 text-center">
            <h2 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {step.title}
            </h2>
            <p className="text-base font-medium text-zinc-600 dark:text-zinc-400">
              {step.description}
            </p>
          </div>

          {/* Content */}
          <div className="mb-8 rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 p-6 dark:from-zinc-800/50 dark:to-zinc-800/30">
            <p className="text-center text-base text-zinc-700 dark:text-zinc-300">
              {step.content}
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="mb-6 flex justify-center gap-2">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-gradient-to-r from-blue-500 to-indigo-500'
                    : index < currentStep
                    ? 'w-2 bg-green-500'
                    : 'w-2 bg-zinc-300 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleSkip}
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Skip Tutorial
            </button>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 rounded-xl bg-zinc-100 px-4 py-2.5 font-semibold text-zinc-700 transition-all hover:scale-105 hover:bg-zinc-200 active:scale-95 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  <ChevronLeftIcon className="size-4" />
                  Previous
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 font-semibold text-white shadow-md transition-all hover:scale-105 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-95"
              >
                {isLastStep ? 'Get Started' : 'Next'}
                {!isLastStep && <ChevronRightIcon className="size-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
