import React, { createContext, useContext, useState, useEffect } from 'react'

interface AppLoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  loadingMessage: string
  setLoadingMessage: (message: string) => void
}

const AppLoadingContext = createContext<AppLoadingContextType | undefined>(undefined)

export function AppLoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('Chargement...')

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  const setLoadingMessageHandler = (message: string) => {
    setLoadingMessage(message)
  }

  // Auto-hide loading after initial app setup
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <AppLoadingContext.Provider
      value={{
        isLoading,
        setLoading,
        loadingMessage,
        setLoadingMessage: setLoadingMessageHandler,
      }}
    >
      {children}
    </AppLoadingContext.Provider>
  )
}

export function useAppLoading() {
  const context = useContext(AppLoadingContext)
  if (context === undefined) {
    throw new Error('useAppLoading must be used within an AppLoadingProvider')
  }
  return context
}

// Default export pour Expo Router
export default function AppLoadingContextPage() {
  return null // Ce fichier n'est pas une page, juste un contexte
}