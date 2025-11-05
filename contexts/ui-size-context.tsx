'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type UISize = 'compact' | 'default' | 'comfortable'

interface UISizeContextType {
  size: UISize
  setSize: (size: UISize) => void
}

const UISizeContext = createContext<UISizeContextType | undefined>(undefined)

const UI_SIZE_KEY = 'dar-ui-size'

export function UISizeProvider({ children }: { children: React.ReactNode }) {
  const [size, setSizeState] = useState<UISize>('default')
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(UI_SIZE_KEY) as UISize | null
    if (stored && ['compact', 'default', 'comfortable'].includes(stored)) {
      setSizeState(stored)
    }
    setMounted(true)
  }, [])

  // Update localStorage and apply to document
  const setSize = (newSize: UISize) => {
    setSizeState(newSize)
    localStorage.setItem(UI_SIZE_KEY, newSize)

    // Apply size class to document root
    document.documentElement.classList.remove('ui-compact', 'ui-default', 'ui-comfortable')
    document.documentElement.classList.add(`ui-${newSize}`)
  }

  // Apply initial size class after mount
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.add(`ui-${size}`)
    }
  }, [mounted, size])

  return (
    <UISizeContext.Provider value={{ size, setSize }}>
      {children}
    </UISizeContext.Provider>
  )
}

export function useUISize() {
  const context = useContext(UISizeContext)
  if (context === undefined) {
    throw new Error('useUISize must be used within a UISizeProvider')
  }
  return context
}
