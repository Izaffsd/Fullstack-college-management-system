'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { getApiUrl } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { QueryErrorAlert } from '@/components/ui/query-error-alert'
import type { Student, Document } from '@/types/api'
import { ArrowLeft, FileText } from 'lucide-react'
import { getInitials } from '@/lib/utils'

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: student, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['students', id],
    queryFn: async () => {
      const res = await api<Student>(`/api/students/${id}`, { auth: true })
      if (!res.success) throw new Error(res.message)
      return res.data!
    },
  })

  const { data: documents } = useQuery({
    queryKey: ['students', id, 'documents'],
    queryFn: async () => {
      const res = await api<Document[]>(`/api/students/${id}/documents`, { auth: true })
      return res.success ? res.data ?? [] : []
    },
    enabled: !!student,
  })

  const profilePicture = documents?.find((d) => d.category === 'PROFILE_PICTURE')
  const avatarUrl = profilePicture?.fileUrl ? getApiUrl(profilePicture.fileUrl) : null

  if (isError) {
    return (
      <div className="space-y-6">
        <QueryErrorAlert message={error?.message} onRetry={() => refetch()} />
      </div>
    )
  }

  if (isLoading || !student) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const user = (student as Student & { user?: { name: string; email: string } }).user

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/students">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to students
          </Button>
        </Link>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20 ring-2 ring-border">
              <AvatarImage src={avatarUrl || undefined} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">
                {getInitials(user?.name) || 'S'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-xl font-bold">{user?.name ?? '-'}</h1>
                <p className="text-muted-foreground">{user?.email ?? '-'}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Student number</p>
                  <p className="font-mono font-medium">{student.studentNumber}</p>
                </div>
                {student.mykadNumber && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">MyKad number</p>
                    <p className="font-mono font-medium">{student.mykadNumber}</p>
                  </div>
                )}
                {student.course && (
                  <div className="sm:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Course</p>
                    <p className="font-medium">{student.course.courseName} ({student.course.courseCode})</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {documents && documents.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.documentId}>
                    <TableCell>{doc.originalName}</TableCell>
                    <TableCell>{doc.category}</TableCell>
                    <TableCell>
                      <a
                        href={getApiUrl(doc.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
