'use client'

import { DocumentList } from '@/components/documents/DocumentList'
import { DocumentUpload } from '@/components/documents/DocumentUpload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { FileText } from 'lucide-react'

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Documents"
          description="Upload and manage your documents"
        />
        <DocumentUpload />
      </div>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Your documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentList />
        </CardContent>
      </Card>
    </div>
  )
}
