/** API base URL - from env or default for dev */
export const API_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
  'http://localhost:4000'

/** Max file size for uploads: 10 MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024

/** Allowed image MIME types for profile pictures */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/** Allowed document MIME types (images + PDF) */
export const ALLOWED_DOCUMENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const

/** Default pagination limit for list pages */
export const DEFAULT_PAGE_LIMIT = 10
