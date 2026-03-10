'use client'

import { create } from 'zustand'
import type { User } from '@/types/api'

interface AuthStore {
  accessToken: string | null
  user: User | null
  setAuth: (accessToken: string, user: User) => void
  setToken: (accessToken: string) => void
  clearAuth: () => void
}

function setLoggedInCookie(value: boolean) {
  if (typeof document === 'undefined') return
  if (value) {
    document.cookie = 'loggedIn=true;path=/;max-age=604800'
  } else {
    document.cookie = 'loggedIn=;path=/;max-age=0'
  }
}

export const authStore = create<AuthStore>((set) => ({
  accessToken: null,
  user: null,
  setAuth: (accessToken, user) => {
    setLoggedInCookie(true)
    set({ accessToken, user })
  },
  setToken: (accessToken) => set((s) => ({ ...s, accessToken })),
  clearAuth: () => {
    setLoggedInCookie(false)
    set({ accessToken: null, user: null })
  },
}))
