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
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email format'),
    password: passwordSchema,
    confirmPassword: z.string(),
    studentNumber: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function RegisterForm() {
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
      const body: Record<string, string> = {
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }
      if (data.studentNumber) body.studentNumber = data.studentNumber
      const res = await api<{ email: string; name: string }>('/api/auth/register', {
        method: 'POST',
        body,
        auth: false,
      })
      if (res.success) {
        setSuccess(true)
        toast.success('Registration successful. Please check your email to verify your account.')
      } else {
        const apiRes = res as ApiResponse<unknown>
        if (apiRes.errors?.length) {
          apiRes.errors.forEach((e) => setError(e.field as keyof FormData, { message: e.message }))
        } else {
          toast.error(apiRes.message || 'Registration failed')
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-foreground">
          Registration successful. Please check your email to verify your account before logging in.
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
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} autoComplete="name" />
        {errors.name && <p className="text-sm text-accent">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} autoComplete="email" />
        {errors.email && <p className="text-sm text-accent">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register('password')} autoComplete="new-password" />
        {errors.password && <p className="text-sm text-accent">{errors.password.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" type="password" {...register('confirmPassword')} autoComplete="new-password" />
        {errors.confirmPassword && <p className="text-sm text-accent">{errors.confirmPassword.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="studentNumber">Student number (optional)</Label>
        <Input id="studentNumber" {...register('studentNumber')} placeholder="MC12345" />
      </div>
      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </Button>
        <a href="/login" className="text-sm text-secondary hover:underline">
          Already have an account? Sign in
        </a>
      </div>
    </form>
  )
}
