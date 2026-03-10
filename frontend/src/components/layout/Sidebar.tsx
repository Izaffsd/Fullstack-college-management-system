'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  User,
  Users,
  GraduationCap,
  UserCog,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { authStore } from '@/stores/authStore'
import type { UserType } from '@/types/api'

const navItems: { href: string; label: string; icon: React.ElementType; roles: UserType[] }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['HEAD_LECTURER'] },
  { href: '/dashboard/course', label: 'My Course', icon: BookOpen, roles: ['STUDENT'] },
  { href: '/dashboard/students', label: 'Students', icon: Users, roles: ['LECTURER', 'HEAD_LECTURER'] },
  { href: '/dashboard/courses', label: 'Courses', icon: BookOpen, roles: ['LECTURER', 'HEAD_LECTURER'] },
  { href: '/dashboard/lecturers', label: 'Lecturers', icon: GraduationCap, roles: ['HEAD_LECTURER'] },
  { href: '/dashboard/head-lecturers', label: 'Head Lecturers', icon: UserCog, roles: ['HEAD_LECTURER'] },
  { href: '/dashboard/documents', label: 'Documents', icon: FileText, roles: ['STUDENT', 'LECTURER', 'HEAD_LECTURER'] },
  { href: '/dashboard/profile', label: 'Profile', icon: User, roles: ['STUDENT', 'LECTURER', 'HEAD_LECTURER'] },
]

export function Sidebar() {
  const pathname = usePathname()
  const userType = authStore((s) => s.user?.type)

  const filtered = navItems.filter((item) => item.roles.includes(userType!))

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[250px] border-r border-border bg-surface">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b border-border px-6">
          <Link href="/dashboard" className="font-semibold">
            Monash College
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {filtered.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
                  isActive ? 'bg-primary/20 text-primary' : 'text-foreground hover:bg-surface/80'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
