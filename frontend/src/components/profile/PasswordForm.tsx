'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ApiResponse } from '@/types/api'
import { toast } from 'sonner'
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/validations/auth'

export function PasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({ resolver: zodResolver(changePasswordSchema) })

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true)
    try {
      const res = await api<unknown>('/api/auth/me/password', {
        method: 'PATCH',
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        },
        auth: true,
      })
      if (res.success) {
        toast.success('Password changed')
        reset()
      } else {
        const apiRes = res as ApiResponse<unknown>
        if (apiRes.errors?.length) {
          apiRes.errors.forEach((e) => setError(e.field as keyof ChangePasswordFormData, { message: e.message }))
        } else {
          toast.error(apiRes.message || 'Change failed')
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Change failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input id="currentPassword" type="password" {...register('currentPassword')} />
        {errors.currentPassword && (
          <p className="text-sm text-accent">{errors.currentPassword.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input id="newPassword" type="password" {...register('newPassword')} />
        {errors.newPassword && (
          <p className="text-sm text-accent">{errors.newPassword.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
        {errors.confirmPassword && (
          <p className="text-sm text-accent">{errors.confirmPassword.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto">
        {isLoading ? 'Changing...' : 'Change password'}
      </Button>
    </form>
  )
}
