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
import type { HeadLecturer } from '@/types/api'
import Link from 'next/link'
import { UserCog } from 'lucide-react'

export default function HeadLecturersPage() {
  const { data: headLecturers, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['head-lecturers'],
    queryFn: async () => {
      const res = await api<HeadLecturer[]>('/api/head-lecturers?page=1&limit=100', { auth: true })
      if (!res.success) throw new Error(res.message)
      return res.data ?? []
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Head Lecturers"
        description="View and manage head lecturers"
      />
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            Head lecturer list
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
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(headLecturers ?? []).map((hl) => (
                  <TableRow key={hl.headLecturerId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                            {getInitials(hl.user?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{hl.user?.name ?? '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{hl.user?.email ?? '-'}</TableCell>
                    <TableCell className="font-mono">{hl.staffNumber}</TableCell>
                    <TableCell>
                      <Link href={`/dashboard/head-lecturers/${hl.headLecturerId}`}>
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
