'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { authStore } from '@/stores/authStore'
import { api } from '@/lib/api'
import type { User } from '@/types/api'
import { getApiUrl } from '@/lib/api'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${getApiUrl('/api/auth/verify-email')}?token=${encodeURIComponent(token)}`,
          { credentials: 'include' }
        )
        const json = await res.json()
        if (json.success && json.data?.accessToken && json.data?.user) {
          authStore.getState().setAuth(json.data.accessToken, json.data.user as User)
          setStatus('success')
          router.replace('/dashboard')
        } else {
          setStatus('error')
        }
      } catch {
        setStatus('error')
      }
    }

    verify()
  }, [token, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <h1 className="text-2xl font-semibold">Verifying email...</h1>
          <p className="text-sm text-muted-foreground">Please wait.</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <h1 className="text-2xl font-semibold">Verification failed</h1>
          <p className="text-sm text-muted-foreground">
            The verification link may be invalid or expired.
          </p>
          <Link href="/login" className="text-secondary hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return null
}
