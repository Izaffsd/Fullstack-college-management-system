'use client'

import { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { api, getApiUrl } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Camera } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '@/lib/constants'

export function ProfilePictureUpload({
  currentUrl,
  userName,
  onSuccess,
}: {
  currentUrl?: string | null
  userName?: string | null
  onSuccess?: () => void
}) {
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File must be under 10 MB')
      return
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      toast.error('Only JPEG, PNG, and WebP are allowed')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('category', 'PROFILE_PICTURE')
      formData.append('file', file)

      const res = await api<unknown>('/api/me/documents', {
        method: 'POST',
        body: formData,
        auth: true,
      })
      if (res.success) {
        toast.success('Profile picture updated')
        queryClient.invalidateQueries({ queryKey: ['me', 'documents'] })
        onSuccess?.()
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

  const avatarUrl = currentUrl ? getApiUrl(currentUrl) : null
  const initials = getInitials(userName)

  return (
    <button
      type="button"
      onClick={() => !isUploading && inputRef.current?.click()}
      disabled={isUploading}
      className="group relative flex cursor-pointer flex-col items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-70"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
      <Avatar className="h-24 w-24 ring-2 ring-border transition-opacity group-hover:opacity-90">
        <AvatarImage src={avatarUrl || undefined} className="object-cover" />
        <AvatarFallback className="bg-primary/10 text-lg font-medium text-primary">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Camera className="h-3.5 w-3.5" />
        {!avatarUrl ? 'Add photo' : 'Change photo'}
      </span>
      {isUploading && (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/80 text-sm">
          Uploading...
        </span>
      )}
    </button>
  )
}
