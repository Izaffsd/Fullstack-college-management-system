'use client'

import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { getApiUrl } from '@/lib/api'

export function Header({ title }: { title?: string }) {
  const { user, logout } = useAuth()
  const profilePictureUrl =
    user?.student?.documents?.find((d: { category: string }) => d.category === 'PROFILE_PICTURE')?.fileUrl ??
    user?.lecturer?.documents?.find((d: { category: string }) => d.category === 'PROFILE_PICTURE')?.fileUrl ??
    user?.headLecturer?.documents?.find((d: { category: string }) => d.category === 'PROFILE_PICTURE')?.fileUrl

  const avatarUrl = profilePictureUrl ? getApiUrl(profilePictureUrl.startsWith('/') ? profilePictureUrl : `/${profilePictureUrl}`) : null

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      {title && <h1 className="text-lg font-semibold">{title}</h1>}
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatarUrl || undefined} alt={user?.name} />
                <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
