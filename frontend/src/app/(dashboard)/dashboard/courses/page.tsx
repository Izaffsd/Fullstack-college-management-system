'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import { QueryErrorAlert } from '@/components/ui/query-error-alert'
import type { Course } from '@/types/api'
import { BookOpen } from 'lucide-react'

export default function CoursesPage() {
  const { data: courses, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await api<Course[]>('/api/courses', { auth: true })
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="View all courses"
      />
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Course list
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <QueryErrorAlert message={error?.message} onRetry={() => refetch()} />
          ) : isLoading ? (
            <TableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(courses ?? []).map((c) => (
                  <TableRow key={c.courseId}>
                    <TableCell className="font-mono font-medium">{c.courseCode}</TableCell>
                    <TableCell>{c.courseName}</TableCell>
                    <TableCell className="text-muted-foreground">{c.description ?? '-'}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
