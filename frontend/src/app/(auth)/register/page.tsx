'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authStore } from '@/stores/authStore'
import { RegisterForm } from '@/components/auth/RegisterForm'
import Link from 'next/link'

export default function RegisterPage() {
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
          <p className="mt-1 text-sm text-muted-foreground">Create an account</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-6">
          <RegisterForm />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-secondary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
