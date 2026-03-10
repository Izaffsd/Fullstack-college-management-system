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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import { QueryErrorAlert } from '@/components/ui/query-error-alert'
import { authStore } from '@/stores/authStore'
import type { Lecturer } from '@/types/api'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function LecturersPage() {
  const userType = authStore((s) => s.user?.type)
  const isHeadLecturer = userType === 'HEAD_LECTURER'

  const { data: lecturers, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['lecturers'],
    queryFn: async () => {
      const res = await api<Lecturer[]>('/api/lecturers?page=1&limit=100', { auth: true })
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
    enabled: isHeadLecturer,
  })

  if (!isHeadLecturer) {
    return (
      <div className="space-y-6">
        <PageHeader title="Lecturers" />
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            You do not have access to this page.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lecturers"
        description="View and manage lecturers"
      />
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Lecturer list
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Staff number</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(lecturers ?? []).map((l) => (
                  <TableRow key={l.lecturerId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                            {getInitials(l.user?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{l.user?.name ?? '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{l.user?.email ?? '-'}</TableCell>
                    <TableCell className="font-mono">{l.staffNumber}</TableCell>
                    <TableCell>{l.course?.courseName ?? l.course?.courseCode ?? '-'}</TableCell>
                    <TableCell>
                      <Link href={`/dashboard/lecturers/${l.lecturerId}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
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
