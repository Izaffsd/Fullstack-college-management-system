'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export function QueryErrorAlert({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-accent/50 bg-accent/5 p-8 text-center">
      <AlertCircle className="h-12 w-12 text-accent" />
      <div>
        <p className="font-medium text-accent">Something went wrong</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {message ?? 'Failed to load data. Please try again.'}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
