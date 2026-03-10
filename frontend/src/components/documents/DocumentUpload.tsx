'use client'

import { useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEnums } from '@/hooks/useEnums'
import type { FileCategory } from '@/types/api'
import { toast } from 'sonner'
import { MAX_FILE_SIZE, ALLOWED_DOCUMENT_TYPES } from '@/lib/constants'

export function DocumentUpload() {
  const [category, setCategory] = useState<FileCategory>('DOCUMENT')
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()
  const { data: enums } = useEnums()

  const categories = enums?.fileCategories?.filter((c) => c !== 'PROFILE_PICTURE') ?? [
    'IC',
    'TRANSCRIPT',
    'DOCUMENT',
    'OTHER',
  ]

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File must be under 10 MB')
      return
    }
    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type as (typeof ALLOWED_DOCUMENT_TYPES)[number])) {
      toast.error('Only JPEG, PNG, WebP, and PDF are allowed')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('category', category)
      formData.append('file', file)

      const res = await api<unknown>('/api/me/documents', {
        method: 'POST',
        body: formData,
        auth: true,
      })
      if (res.success) {
        toast.success('Document uploaded')
        queryClient.invalidateQueries({ queryKey: ['me', 'documents'] })
      } else {
        toast.error(res.message || 'Upload failed')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select value={category} onValueChange={(v) => setCategory(v as FileCategory)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </Button>
    </div>
  )
}
