/** Paths that don't require authentication. Safe for Edge (middleware). */
export const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
] as const
