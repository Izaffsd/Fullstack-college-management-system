'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import type { Student } from '@/types/api'
import type { PaginationMeta } from '@/types/api'
import { Users, ChevronLeft, ChevronRight } from 'lucide-react'

interface StudentWithUser extends Student {
  user: { userId: string; name: string; email: string; status?: string }
}

export default function StudentsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['students', page],
    queryFn: async () => {
      const res = await api<StudentWithUser[]>(`/api/students?page=${page}&limit=10`, { auth: true })
      if (!res.success) throw new Error(res.message)
      return { data: res.data ?? [], meta: res.meta }
    },
  })

  const students = data?.data ?? []
  const meta = data?.meta as PaginationMeta | undefined

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="View and manage students"
      />
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Student list
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <QueryErrorAlert message={error?.message} onRetry={() => refetch()} />
          ) : isLoading ? (
            <TableSkeleton />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Student number</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.studentId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                              {getInitials(s.user?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{s.user?.name ?? '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{s.user?.email ?? '-'}</TableCell>
                      <TableCell className="font-mono">{s.studentNumber}</TableCell>
                      <TableCell>{s.course?.courseName ?? s.course?.courseCode ?? '-'}</TableCell>
                      <TableCell>
                        <Link href={`/dashboard/students/${s.studentId}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {meta && (meta.hasNext || meta.hasPrev) && (
                <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {meta.page} of {meta.totalPages} ({meta.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!meta.hasPrev}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!meta.hasNext}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
