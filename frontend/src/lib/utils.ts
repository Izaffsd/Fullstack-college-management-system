import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Get initials from a name (e.g. "John Doe" -> "JD") */
export function getInitials(name?: string | null): string {
  if (!name?.trim()) return "?"
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
