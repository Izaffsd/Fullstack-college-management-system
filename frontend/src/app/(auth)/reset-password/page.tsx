'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import Link from 'next/link'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  if (!token) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-accent">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="text-secondary hover:underline">
          Request a new reset link
        </Link>
      </div>
    )
  }

  return <ResetPasswordForm token={token} />
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your new password
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-6">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
