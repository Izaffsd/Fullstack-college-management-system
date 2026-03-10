'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authStore } from '@/stores/authStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const user = authStore((s) => s.user)

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        if (!authStore.getState().user) {
          router.replace('/login')
        }
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-[250px]">
        <Header />
        <main className="mx-auto max-w-[1280px] p-6">{children}</main>
      </div>
    </div>
  )
}
