'use client'

import { ThemeProvider } from 'next-themes'
import { QueryProvider } from './QueryProvider'
import { AuthProvider } from './AuthProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
