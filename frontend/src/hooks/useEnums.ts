'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { EnumsResponse } from '@/types/api'

export function useEnums() {
  return useQuery({
    queryKey: ['enums'],
    queryFn: async () => {
      const res = await api<EnumsResponse>('/api/enums', { auth: true })
      if (!res.success || !res.data) throw new Error(res.message || 'Failed to fetch enums')
      return res.data
    },
  })
}
