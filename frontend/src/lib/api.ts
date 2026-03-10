'use client'

import { authStore } from '@/stores/authStore'
import type { ApiResponse } from '@/types/api'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function refreshToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise
  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      const json = (await res.json()) as ApiResponse<{ accessToken: string }>
      if (json.success && json.data?.accessToken) {
        authStore.getState().setToken(json.data.accessToken)
        return json.data.accessToken
      }
      return null
    } catch {
      return null
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()
  return refreshPromise
}

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown> | FormData
  auth?: boolean
}

export async function api<T>(
  path: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { body, auth = true, ...init } = options
  const token = authStore.getState().accessToken

  const headers: Record<string, string> = {}
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  if (auth && token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const doRequest = (accessToken?: string | null) => {
    const h = { ...headers }
    if (accessToken) h['Authorization'] = `Bearer ${accessToken}`
    return fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      ...init,
      credentials: 'include',
      headers: h,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    })
  }

  let res = await doRequest(token)

  if (res.status === 401 && auth) {
    const newToken = await refreshToken()
    if (newToken) {
      res = await doRequest(newToken)
    } else {
      authStore.getState().clearAuth()
      if (typeof window !== 'undefined') window.location.href = '/login'
      throw new Error('Session expired')
    }
  }

  if (res.status === 204) {
    return { statusCode: 204, success: true } as ApiResponse<T>
  }

  const json = (await res.json()) as ApiResponse<T>
  return json
}

export function getApiUrl(path: string): string {
  const base = API_URL.replace(/\/$/, '')
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
}
