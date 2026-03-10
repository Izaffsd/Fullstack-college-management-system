'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { getApiUrl } from '@/lib/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { authStore } from '@/stores/authStore'
import type { Document } from '@/types/api'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { QueryErrorAlert } from '@/components/ui/query-error-alert'

export function DocumentList() {
  const queryClient = useQueryClient()
  const isHeadLecturer = authStore((s) => s.user?.type === 'HEAD_LECTURER')

  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const res = await api<unknown>(`/api/documents/${documentId}`, {
        method: 'DELETE',
        auth: true,
      })
      if (!res.success) throw new Error(res.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me', 'documents'] })
      toast.success('Document deleted')
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'Delete failed'),
  })
  const { data: documents, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['me', 'documents'],
    queryFn: async () => {
      const res = await api<Document[]>('/api/me/documents', { auth: true })
      return res.success ? res.data ?? [] : []
    },
  })

  if (isError) {
    return <QueryErrorAlert message={error?.message} onRetry={() => refetch()} />
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </div>
    )
  }

  if (!documents?.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No documents yet.</p>
        <p className="mt-1 text-sm text-muted-foreground">Upload a document using the button above.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
          <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Uploaded</TableHead>
          <TableHead></TableHead>
          {isHeadLecturer && <TableHead></TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.documentId}>
            <TableCell>{doc.originalName}</TableCell>
            <TableCell>{doc.category}</TableCell>
            <TableCell>{format(new Date(doc.createdAt), 'dd MMM yyyy')}</TableCell>
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
            {isHeadLecturer && (
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-accent hover:text-accent"
                  onClick={() => deleteMutation.mutate(doc.documentId)}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
