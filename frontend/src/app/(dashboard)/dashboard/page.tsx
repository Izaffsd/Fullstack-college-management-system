'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { authStore } from '@/stores/authStore'
import { api, getApiUrl } from '@/lib/api'
import { getInitials } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { QueryErrorAlert } from '@/components/ui/query-error-alert'
import type { StatsResponse } from '@/types/api'
import { Users, GraduationCap, UserCog, BookOpen, UserCheck } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const userType = authStore((s) => s.user?.type)

  useEffect(() => {
    if (!userType) return
    if (userType === 'STUDENT') {
      router.replace('/dashboard/course')
    } else if (userType === 'LECTURER') {
      router.replace('/dashboard/students')
    }
  }, [userType, router])

  if (userType === 'HEAD_LECTURER') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Overview of Monash College"
        />
        <DashboardStats />
      </div>
    )
  }

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}

const statCards = [
  { key: 'totalStudents' as const, label: 'Students', icon: Users },
  { key: 'totalLecturers' as const, label: 'Lecturers', icon: GraduationCap },
  { key: 'totalHeadLecturers' as const, label: 'Head Lecturers', icon: UserCog },
  { key: 'totalCourses' as const, label: 'Courses', icon: BookOpen },
  { key: 'activeUsers' as const, label: 'Active Users', icon: UserCheck },
]

function DashboardStats() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await api<StatsResponse>('/api/stats', { auth: true })
      if (!res.success) throw new Error(res.message)
      return res.data!
    },
  })

  if (isError) {
    return (
      <div className="space-y-6">
        <QueryErrorAlert message={error?.message} onRetry={() => refetch()} />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map(({ key, label, icon: Icon }) => (
          <Card key={key}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4" />
                {label}
              </div>
              <p className="mt-2 text-2xl font-bold">{data[key]}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {data.studentsByCourse?.length > 0 && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Students by course</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.studentsByCourse.map((c) => (
                  <div key={c.courseCode} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                    <span className="font-medium">{c.courseName} <span className="text-muted-foreground">({c.courseCode})</span></span>
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-sm font-medium text-primary">
                      {c.total}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {data.recentRegistrations?.length > 0 && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Recent registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentRegistrations.map((u) => (
                  <div key={u.userId} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
                    {u.profilePictureUrl ? (
                      <img
                        src={getApiUrl(u.profilePictureUrl)}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-border"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {getInitials(u.name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{u.name}</p>
                      <p className="text-sm text-muted-foreground">{u.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
