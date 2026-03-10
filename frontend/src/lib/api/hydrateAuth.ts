'use client'

import { authStore } from '@/stores/authStore'
import { api } from './client'
import type { User } from '@/types/api'

/** Hydrate auth state from refresh token + /me. Used by AuthProvider. */
export async function hydrateAuth(): Promise<void> {
  const { accessToken, user } = authStore.getState()
  if (accessToken && user) return

  try {
    const refreshRes = await api<{ accessToken: string }>('/api/auth/refresh', {
      method: 'POST',
      body: {},
      auth: false,
    })
    if (!refreshRes.success || !refreshRes.data?.accessToken) {
      authStore.getState().clearAuth()
      return
    }
    const token = refreshRes.data.accessToken
    authStore.getState().setToken(token)

    const meRes = await api<User>('/api/auth/me', { auth: true })
    if (meRes.success && meRes.data) {
      authStore.getState().setAuth(token, meRes.data)
    }
  } catch {
    authStore.getState().clearAuth()
  }
}
