// API response shapes
export interface ApiResponse<T> {
  statusCode: number
  success: boolean
  message?: string
  data?: T
  errors?: ApiErrorField[]
  errorCode?: string
  meta?: PaginationMeta
  links?: PaginationLinks
}

export interface ApiErrorField {
  field: string
  message: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginationLinks {
  self: string
  next: string | null
  prev: string | null
  first: string
  last: string
}

export type UserType = 'STUDENT' | 'LECTURER' | 'HEAD_LECTURER'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
export type Gender = 'Male' | 'Female'
export type Race = 'Malay' | 'Chinese' | 'Indian' | 'Others'
export type State =
  | 'Johor' | 'Kedah' | 'Kelantan' | 'Melaka' | 'NegeriSembilan' | 'Pahang'
  | 'Perak' | 'Perlis' | 'PulauPinang' | 'Sabah' | 'Sarawak' | 'Selangor'
  | 'Terengganu' | 'KualaLumpur' | 'Labuan' | 'Putrajaya'
export type FileCategory = 'PROFILE_PICTURE' | 'IC' | 'TRANSCRIPT' | 'DOCUMENT' | 'OTHER'

export interface Profile {
  profileId: string
  userId: string
  phoneNumber: string | null
  gender: Gender | null
  race: Race | null
  dateOfBirth: string | null
  streetOne: string | null
  streetTwo: string | null
  postcode: string | null
  city: string | null
  state: State | null
}

export interface Course {
  courseId: string
  courseCode: string
  courseName: string
  description: string | null
  isActive: boolean
}

export interface Student {
  studentId: string
  studentNumber: string
  mykadNumber: string | null
  courseId: string
  userId: string
  course?: Course
  documents?: Document[]
  user?: { userId: string; name: string; email: string; status?: string }
}

export interface Lecturer {
  lecturerId: string
  staffNumber: string
  mykadNumber: string | null
  courseId: string
  userId: string
  course?: Course
  documents?: Document[]
  user?: { userId: string; name: string; email: string; status?: string }
}

export interface HeadLecturer {
  headLecturerId: string
  staffNumber: string
  mykadNumber: string | null
  userId: string
  documents?: Document[]
  user?: { userId: string; name: string; email: string; status?: string }
}

export interface Document {
  documentId: string
  entityId: string
  entityType: string
  fileName: string
  originalName: string
  mimeType: string
  fileSize: number
  filePath: string
  fileUrl: string
  category: FileCategory
  createdAt: string
}

export interface User {
  userId: string
  email: string
  name: string
  type: UserType
  status: UserStatus
  isEmailVerified: boolean
  profile?: Profile | null
  student?: Student | null
  lecturer?: Lecturer | null
  headLecturer?: HeadLecturer | null
}

export interface EnumsResponse {
  genders: Gender[]
  races: Race[]
  states: State[]
  fileCategories: FileCategory[]
  userStatuses: UserStatus[]
  userTypes: UserType[]
}

export interface StatsResponse {
  totalStudents: number
  totalLecturers: number
  totalHeadLecturers: number
  totalCourses: number
  activeUsers: number
  studentsByCourse: { courseCode: string; courseName: string; total: number }[]
  recentRegistrations: {
    userId: string
    name: string
    type: UserType
    createdAt: string
    profilePictureUrl: string | null
  }[]
}
