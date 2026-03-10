'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { Skeleton } from '@/components/ui/skeleton'
import { QueryErrorAlert } from '@/components/ui/query-error-alert'
import type { Course } from '@/types/api'
import { BookOpen } from 'lucide-react'

export default function CoursePage() {
  const { data: course, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['me', 'course'],
    queryFn: async () => {
      const res = await api<Course>('/api/me/course', { auth: true })
      if (!res.success) throw new Error(res.message)
      return res.data!
    },
  })

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Course" description="Your assigned course" />
        <QueryErrorAlert message={error?.message} onRetry={() => refetch()} />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Course" description="Your assigned course" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Course" description="Your assigned course" />
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No course assigned. Please contact your administrator.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Course" description="Your assigned course" />
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {course.courseName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Course code</p>
              <p className="mt-1 font-mono font-medium">{course.courseCode}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Course name</p>
              <p className="mt-1 font-medium">{course.courseName}</p>
            </div>
          </div>
          {course.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="mt-1 text-sm">{course.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
