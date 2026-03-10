'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEnums } from '@/hooks/useEnums'
import type { ApiResponse } from '@/types/api'
import type { UserType } from '@/types/api'
import { toast } from 'sonner'

type ProfileFormData = {
  name: string
  phoneNumber?: string | null
  gender?: string | null
  race?: string | null
  dateOfBirth?: string | null
  mykadNumber?: string | null
  streetOne?: string | null
  streetTwo?: string | null
  postcode?: string | null
  city?: string | null
  state?: string | null
}

/** Extract date of birth from MyKad YYMMDD. YY 00-30 = 2000s, 31-99 = 1900s. */
function mykadToDateOfBirth(mykad: string): string | null {
  const digits = mykad.trim().replace(/\D/g, '')
  if (digits.length !== 12) return null
  const yy = parseInt(digits.substring(0, 2), 10)
  const mm = parseInt(digits.substring(2, 4), 10)
  const dd = parseInt(digits.substring(4, 6), 10)
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null
  const year = yy <= 30 ? 2000 + yy : 1900 + yy
  return `${year}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
}

export function ProfileForm({
  initialName,
  initialProfile,
  userType,
  hasStudentRecord,
  hasLecturerRecord,
  mykadNumber,
  studentNumber,
  staffNumber,
  onSuccess,
}: {
  initialName: string
  initialProfile?: {
    phoneNumber?: string | null
    gender?: string | null
    race?: string | null
    dateOfBirth?: string | null
    streetOne?: string | null
    streetTwo?: string | null
    postcode?: string | null
    city?: string | null
    state?: string | null
    address?: {
      streetOne?: string | null
      streetTwo?: string | null
      postcode?: string | null
      city?: string | null
      state?: string | null
    }
  }
  userType?: UserType
  hasStudentRecord?: boolean
  hasLecturerRecord?: boolean
  mykadNumber?: string | null
  studentNumber?: string | null
  staffNumber?: string | null
  onSuccess?: () => void
}) {
  const { data: enums } = useEnums()
  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      name: initialName,
      phoneNumber: initialProfile?.phoneNumber ?? '',
      gender: initialProfile?.gender ?? null,
      race: initialProfile?.race ?? null,
      dateOfBirth: initialProfile?.dateOfBirth ? String(initialProfile.dateOfBirth).split('T')[0] : '',
      mykadNumber: mykadNumber ?? '',
      streetOne: initialProfile?.streetOne ?? initialProfile?.address?.streetOne ?? '',
      streetTwo: initialProfile?.streetTwo ?? initialProfile?.address?.streetTwo ?? '',
      postcode: initialProfile?.postcode ?? initialProfile?.address?.postcode ?? '',
      city: initialProfile?.city ?? initialProfile?.address?.city ?? '',
      state: initialProfile?.state ?? initialProfile?.address?.state ?? null,
    },
  })

  const watchedMykad = profileForm.watch('mykadNumber')
  const setValue = profileForm.setValue
  useEffect(() => {
    const dob = mykadToDateOfBirth(watchedMykad ?? '')
    if (dob) setValue('dateOfBirth', dob)
  }, [watchedMykad, setValue])

  const onSubmitProfile = async (data: ProfileFormData) => {
    const mykadVal = data.mykadNumber?.trim().replace(/\D/g, '')
    const needsMykad = (userType === 'STUDENT' && hasStudentRecord) || (userType === 'LECTURER' && hasLecturerRecord)
    if (needsMykad) {
      if (!mykadVal || mykadVal.length !== 12) {
        profileForm.setError('mykadNumber', {
          message: 'MyKad number is required (12 digits, format: YYMMDDxxxxxx)',
        })
        return
      }
      const mm = parseInt(mykadVal.substring(2, 4), 10)
      const dd = parseInt(mykadVal.substring(4, 6), 10)
      if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
        profileForm.setError('mykadNumber', {
          message: 'Invalid MyKad format (YYMMDD must be valid date)',
        })
        return
      }
    }

    const nameRes = await api<unknown>('/api/auth/me', {
      method: 'PATCH',
      body: { name: data.name },
      auth: true,
    })
    if (!nameRes.success) {
      const apiRes = nameRes as ApiResponse<unknown>
      if (apiRes.errors?.length) {
        apiRes.errors.forEach((e) => profileForm.setError(e.field as keyof ProfileFormData, { message: e.message }))
      } else {
        toast.error(apiRes.message || 'Update failed')
      }
      return
    }

    const payload: Record<string, unknown> = {}
    if (data.phoneNumber !== undefined) payload.phoneNumber = data.phoneNumber || null
    if (data.gender !== undefined) payload.gender = data.gender || null
    if (data.race !== undefined) payload.race = data.race || null
    if (data.dateOfBirth !== undefined) payload.dateOfBirth = data.dateOfBirth || null
    if (data.streetOne !== undefined) payload.streetOne = data.streetOne || null
    if (data.streetTwo !== undefined) payload.streetTwo = data.streetTwo || null
    if (data.postcode !== undefined) payload.postcode = data.postcode || null
    if (data.city !== undefined) payload.city = data.city || null
    if (data.state !== undefined) payload.state = data.state || null

    const profileRes = await api<unknown>('/api/auth/me/profile', {
      method: 'PATCH',
      body: payload,
      auth: true,
    })
    if (!profileRes.success) {
      const apiRes = profileRes as ApiResponse<unknown>
      if (apiRes.errors?.length) {
        apiRes.errors.forEach((e) => profileForm.setError(e.field as keyof ProfileFormData, { message: e.message }))
      } else {
        toast.error(apiRes.message || 'Update failed')
      }
      return
    }

    if (needsMykad && mykadVal?.length === 12) {
      const mykadPath = userType === 'STUDENT' ? '/api/me/student' : '/api/me/lecturer'
      const mykadRes = await api<unknown>(mykadPath, {
        method: 'PATCH',
        body: { mykadNumber: mykadVal },
        auth: true,
      })
      if (!mykadRes.success) {
        const apiRes = mykadRes as ApiResponse<unknown>
        if (
          apiRes.errorCode === 'STUDENT_NOT_FOUND_404' ||
          apiRes.errorCode === 'LECTURER_NOT_FOUND_404'
        ) {
          toast.error(
            userType === 'STUDENT'
              ? 'Your student profile is not set up yet. Please contact your administrator to complete registration.'
              : 'Your lecturer profile is not set up yet. Please contact your administrator to complete registration.'
          )
          profileForm.setError('mykadNumber', {
            message: 'Profile not found. Contact your administrator.',
          })
        } else if (apiRes.errors?.length) {
          apiRes.errors.forEach((e) => profileForm.setError(e.field as keyof ProfileFormData, { message: e.message }))
        } else {
          toast.error(apiRes.message || 'MyKad update failed')
        }
        return
      }
    }

    toast.success('Profile updated')
    onSuccess?.()
  }

  const showMykad =
    (userType === 'STUDENT' && hasStudentRecord) ||
    (userType === 'LECTURER' && hasLecturerRecord) ||
    userType === 'HEAD_LECTURER'
  const canEditMykad =
    (userType === 'STUDENT' && hasStudentRecord) || (userType === 'LECTURER' && hasLecturerRecord)
  const showMykadUnavailable =
    (userType === 'STUDENT' && !hasStudentRecord) || (userType === 'LECTURER' && !hasLecturerRecord)

  return (
    <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" {...profileForm.register('name')} placeholder="e.g. Ahmad bin Abdullah, O'Brien" />
          {profileForm.formState.errors.name && (
            <p className="text-sm text-accent">{profileForm.formState.errors.name.message}</p>
          )}
        </div>
        {userType === 'STUDENT' && studentNumber && (
          <div className="space-y-2">
            <Label htmlFor="studentNumber">Student number</Label>
            <Input id="studentNumber" value={studentNumber} readOnly className="bg-muted font-mono" />
          </div>
        )}
        {(userType === 'LECTURER' || userType === 'HEAD_LECTURER') && staffNumber && (
          <div className="space-y-2">
            <Label htmlFor="staffNumber">Staff number</Label>
            <Input id="staffNumber" value={staffNumber} readOnly className="bg-muted font-mono" />
          </div>
        )}
        {showMykad && (
          <div className="space-y-2">
            <Label htmlFor="mykadNumber">
              MyKad number {canEditMykad && <span className="text-accent">*</span>}
            </Label>
            <Input
              id="mykadNumber"
              {...profileForm.register('mykadNumber')}
              placeholder="e.g. 020101141234"
              maxLength={12}
              inputMode="numeric"
              readOnly={!canEditMykad}
              className={!canEditMykad ? 'bg-muted' : ''}
            />
            {profileForm.formState.errors.mykadNumber && (
              <p className="text-sm text-accent">{profileForm.formState.errors.mykadNumber.message}</p>
            )}
          </div>
        )}
        {showMykadUnavailable && (
          <div className="space-y-2 sm:col-span-2">
            <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
              To add your MyKad number, your {userType?.toLowerCase()} profile must be set up first. Please contact your administrator to complete registration.
            </p>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone</Label>
          <Input id="phoneNumber" {...profileForm.register('phoneNumber')} placeholder="+60123456789" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...profileForm.register('dateOfBirth')}
            readOnly={!!(showMykad && watchedMykad && mykadToDateOfBirth(watchedMykad))}
            className={watchedMykad && mykadToDateOfBirth(watchedMykad) ? 'bg-muted' : ''}
          />
          {showMykad && (
            <p className="text-xs text-muted-foreground">Auto-filled from MyKad (YYMMDD)</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select
            value={profileForm.watch('gender') ?? ''}
            onValueChange={(v) => profileForm.setValue('gender', (v as 'Male' | 'Female') || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {enums?.genders.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Race</Label>
          <Select
            value={profileForm.watch('race') ?? ''}
            onValueChange={(v) => profileForm.setValue('race', (v as 'Malay' | 'Chinese' | 'Indian' | 'Others') || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {enums?.races.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="streetOne">Address line 1</Label>
          <Input id="streetOne" {...profileForm.register('streetOne')} placeholder="Street address" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="streetTwo">Address line 2</Label>
          <Input id="streetTwo" {...profileForm.register('streetTwo')} placeholder="Apartment, suite, etc. (optional)" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postcode">Postcode</Label>
          <Input id="postcode" {...profileForm.register('postcode')} placeholder="e.g. 50000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...profileForm.register('city')} placeholder="City" />
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Select
            value={profileForm.watch('state') ?? ''}
            onValueChange={(v) => profileForm.setValue('state', v || null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {enums?.states.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Save profile
      </Button>
    </form>
  )
}
