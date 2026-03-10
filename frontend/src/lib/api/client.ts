'use client'

import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { authStore } from '@/stores/authStore'
import { API_URL } from '@/lib/constants'
import type { ApiResponse } from '@/types/api'

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function refreshToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise
  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const res = await axios.post<ApiResponse<{ accessToken: string }>>(
        `${API_URL}/api/auth/refresh`,
        {},
        { withCredentials: true }
      )
      const json = res.data
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

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: () => true,
})

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStore.getState().accessToken
  const skipAuth = (config as InternalAxiosRequestConfig & { skipAuth?: boolean }).skipAuth
  if (!skipAuth && token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

axiosInstance.interceptors.response.use(
  async (response) => {
    if (response.status !== 401) return response

    const config = response.config as InternalAxiosRequestConfig & { skipAuth?: boolean }
    if (config.skipAuth) return response

    const newToken = await refreshToken()
    if (newToken) {
      config.headers.Authorization = `Bearer ${newToken}`
      return axiosInstance.request(config)
    }

    authStore.getState().clearAuth()
    if (typeof window !== 'undefined') window.location.href = '/login'
    return Promise.reject(new Error('Session expired'))
  },
  (error) => Promise.reject(error)
)

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: Record<string, unknown> | FormData
  auth?: boolean
}

export async function api<T>(
  path: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { body, auth = true, method = 'GET' } = options
  const url = path.startsWith('/') ? path : `/${path}`

  const config = {
    url,
    method,
    skipAuth: !auth,
    data: body,
  } as InternalAxiosRequestConfig & { skipAuth?: boolean }

  const res = await axiosInstance.request<ApiResponse<T>>(config)

  if (res.status === 204) {
    return { statusCode: 204, success: true } as ApiResponse<T>
  }

  return res.data
}

/** Build full URL for API paths or static files. */
export function getApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const base = API_URL.replace(/\/$/, '')
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
}
