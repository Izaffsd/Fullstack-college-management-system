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

const schema = z.object({
  email: z.string().email('Invalid email format'),
})

type FormData = z.infer<typeof schema>

export function ForgotPasswordForm() {
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
      const res = await api<unknown>('/api/auth/forgot-password', {
        method: 'POST',
        body: data,
        auth: false,
      })
      if (res.success) {
        setSuccess(true)
        toast.success('If this email is registered, a reset link has been sent.')
      } else {
        const apiRes = res as ApiResponse<unknown>
        if (apiRes.errors?.length) {
          apiRes.errors.forEach((e) => setError(e.field as keyof FormData, { message: e.message }))
        } else {
          toast.error(apiRes.message || 'Request failed')
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-foreground">
          If this email is registered, a reset link has been sent. Please check your inbox.
        </p>
        <a href="/login" className="text-secondary hover:underline">
          Back to login
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} autoComplete="email" />
        {errors.email && <p className="text-sm text-accent">{errors.email.message}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send reset link'}
        </Button>
        <a href="/login" className="text-sm text-secondary hover:underline">
          Back to login
        </a>
      </div>
    </form>
  )
}
