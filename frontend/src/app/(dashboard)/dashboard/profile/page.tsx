'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload'
import { PasswordForm } from '@/components/profile/PasswordForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { User } from '@/types/api'
import { User as UserIcon, Camera, Shield } from 'lucide-react'
import { QueryErrorAlert } from '@/components/ui/query-error-alert'

function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-64 rounded-lg bg-muted" />
        <div className="h-64 rounded-lg bg-muted" />
      </div>
      <div className="h-48 rounded-lg bg-muted" />
    </div>
  )
}

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const { data: user, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await api<User>('/api/auth/me', { auth: true })
      if (!res.success) throw new Error(res.message)
      return res.data!
    },
  })

  const { data: documents } = useQuery({
    queryKey: ['me', 'documents'],
    queryFn: async () => {
      const res = await api<{ fileUrl: string; category: string }[]>('/api/me/documents', { auth: true })
      return res.success ? res.data ?? [] : []
    },
    enabled: !!user,
  })

  const profilePicture = documents?.find((d) => d.category === 'PROFILE_PICTURE')

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>
        <QueryErrorAlert message={error?.message} onRetry={() => refetch()} />
      </div>
    )
  }

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>
        <ProfileSkeleton />
      </div>
    )
  }

  const profile = user.profile as {
    phoneNumber?: string | null
    gender?: string | null
    race?: string | null
    dateOfBirth?: string | null
    streetOne?: string | null
    streetTwo?: string | null
    postcode?: string | null
    city?: string | null
    state?: string | null
    address?: { streetOne?: string; streetTwo?: string; postcode?: string; city?: string; state?: string }
  } | undefined

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and personal information</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Camera className="h-4 w-4 text-primary" />
              Profile photo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfilePictureUpload
              currentUrl={profilePicture?.fileUrl}
              userName={user.name}
              onSuccess={() => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserIcon className="h-4 w-4 text-primary" />
              Personal information
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Update your name, MyKad, contact details and address
            </p>
          </CardHeader>
          <CardContent>
            <ProfileForm
              initialName={user.name}
              initialProfile={profile ? { ...profile, ...profile.address } : undefined}
              userType={user.type}
              hasStudentRecord={!!user.student}
              hasLecturerRecord={!!user.lecturer}
              mykadNumber={
                user.student?.mykadNumber ??
                user.lecturer?.mykadNumber ??
                user.headLecturer?.mykadNumber ??
                null
              }
              studentNumber={user.student?.studentNumber ?? null}
              staffNumber={user.lecturer?.staffNumber ?? user.headLecturer?.staffNumber ?? null}
              onSuccess={() => queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" />
            Security
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Change your password to keep your account secure
          </p>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
