'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authStore } from '@/stores/authStore'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ApiResponse, User } from '@/types/api'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const res = await api<{ accessToken: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: data,
        auth: false,
      })
      if (res.success && res.data) {
        authStore.getState().setAuth(res.data.accessToken, res.data.user)
        toast.success('Login successful')
        router.push('/dashboard')
      } else {
        const apiRes = res as ApiResponse<unknown>
        if (apiRes.errors?.length) {
          apiRes.errors.forEach((e) => setError(e.field as keyof FormData, { message: e.message }))
        } else {
          toast.error(apiRes.message || 'Login failed')
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} autoComplete="email" />
        {errors.email && (
          <p className="text-sm text-accent">{errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register('password')} autoComplete="current-password" />
        {errors.password && (
          <p className="text-sm text-accent">{errors.password.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
        <a href="/forgot-password" className="text-sm text-secondary hover:underline">
          Forgot password?
        </a>
      </div>
    </form>
  )
}
