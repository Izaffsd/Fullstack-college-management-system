'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authStore } from '@/stores/authStore'
import { api } from '@/lib/api'
import type { User } from '@/types/api'

export function useAuth() {
  const { accessToken, user, setAuth, clearAuth } = authStore()
  const router = useRouter()

  const logout = useCallback(async () => {
    if (accessToken) {
      try {
        await api('/api/auth/logout', { method: 'POST', auth: true })
      } catch {
        // ignore
      }
    }
    clearAuth()
    router.push('/login')
  }, [accessToken, clearAuth, router])

  return { accessToken, user, setAuth, clearAuth, logout }
}

export function useAuthHydration() {
  const { accessToken, user, setAuth, clearAuth } = authStore()

  useEffect(() => {
    if (accessToken && user) return

    const hydrate = async () => {
      try {
        const refreshRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/refresh`,
          { method: 'POST', credentials: 'include' }
        )
        const refreshJson = await refreshRes.json()
        if (!refreshJson.success || !refreshJson.data?.accessToken) {
          clearAuth()
          return
        }
        const token = refreshJson.data.accessToken
        authStore.getState().setToken(token)

        const meRes = await api<User>('/api/auth/me', { auth: true })
        if (meRes.success && meRes.data) {
          setAuth(token, meRes.data)
        }
      } catch {
        clearAuth()
      }
    }

    hydrate()
  }, [accessToken, user, setAuth, clearAuth])
}
