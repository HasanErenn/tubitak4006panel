'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ReactNode } from 'react'

interface CustomThemeProviderProps {
  children: ReactNode
}

export default function ThemeProvider({ children }: CustomThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}