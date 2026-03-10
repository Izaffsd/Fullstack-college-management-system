'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ApiResponse } from '@/types/api'
import { toast } from 'sonner'

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one digit')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

const schema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function ResetPasswordForm({ token }: { token: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const res = await api<unknown>('/api/auth/reset-password', {
        method: 'POST',
        body: { token, password: data.password, confirmPassword: data.confirmPassword },
        auth: false,
      })
      if (res.success) {
        setSuccess(true)
        toast.success('Password reset successful. Please login.')
      } else {
        const apiRes = res as ApiResponse<unknown>
        if (apiRes.errors?.length) {
          apiRes.errors.forEach((e) => setError(e.field as keyof FormData, { message: e.message }))
        } else {
          toast.error(apiRes.message || 'Reset failed')
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-foreground">Password reset successful. Please login.</p>
        <a href="/login" className="text-secondary hover:underline">
          Go to login
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" type="password" {...register('password')} autoComplete="new-password" />
        {errors.password && <p className="text-sm text-accent">{errors.password.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" type="password" {...register('confirmPassword')} autoComplete="new-password" />
        {errors.confirmPassword && <p className="text-sm text-accent">{errors.confirmPassword.message}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset password'}
        </Button>
        <a href="/login" className="text-sm text-secondary hover:underline">
          Back to login
        </a>
      </div>
    </form>
  )
}
