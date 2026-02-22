'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ProfileWithOrg {
  id: string
  email: string
  full_name: string | null
  role: string
  organization_id: string | null
  trade: string | null
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  organizations: {
    id: string
    name: string
    type: string | null
  } | null
}

export async function getProfile(): Promise<{ error: string | null, data: ProfileWithOrg | null }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('profiles')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data: data as ProfileWithOrg }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const profileData = {
    full_name: formData.get('full_name') as string,
    phone: formData.get('phone') as string || null,
    trade: formData.get('trade') as string || null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .update(profileData)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { error: null }
}

export async function createOrganization(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const orgName = formData.get('name') as string
  const orgType = formData.get('type') as string || null

  // Create the organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: org, error: orgError } = await (supabase as any)
    .from('organizations')
    .insert({ name: orgName, type: orgType })
    .select()
    .single()

  if (orgError) {
    return { error: orgError.message }
  }

  // Link the user to the organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await (supabase as any)
    .from('profiles')
    .update({ organization_id: org.id })
    .eq('id', user.id)

  if (profileError) {
    return { error: profileError.message }
  }

  revalidatePath('/settings')
  revalidatePath('/projects')
  return { error: null, data: org }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}
