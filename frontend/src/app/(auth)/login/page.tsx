'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authStore } from '@/stores/authStore'
import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const user = authStore((s) => s.user)

  useEffect(() => {
    if (user) {
      router.replace('/dashboard')
    }
  }, [user, router])

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Monash College</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-6">
          <LoginForm />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-secondary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
