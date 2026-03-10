'use client'

import { useEffect } from 'react'
import { authStore } from '@/stores/authStore'
import { api } from '@/lib/api'
import type { User } from '@/types/api'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const { accessToken, user, setAuth, setToken, clearAuth } = authStore.getState()
    if (accessToken && user) return

    const hydrate = async () => {
      try {
        const refreshRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/refresh`,
          { method: 'POST', credentials: 'include' }
        )
        const refreshJson = await refreshRes.json()
        if (!refreshJson.success || !refreshJson.data?.accessToken) {
          authStore.getState().clearAuth()
          return
        }
        const token = refreshJson.data.accessToken
        authStore.getState().setToken(token)

        const meRes = await api<User>('/api/auth/me', { auth: true })
        if (meRes.success && meRes.data) {
          authStore.getState().setAuth(token, meRes.data)
        }
      } catch {
        authStore.getState().clearAuth()
      }
    }

    hydrate()
  }, [])

  return <>{children}</>
}
