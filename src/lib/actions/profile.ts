'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import type { User, Organization } from '@/types'


export interface UserWithOrg extends User {
  organization?: Organization | null
}

export async function getProfile(): Promise<{ error: string | null, data: UserWithOrg | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('users')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  // Get organization if user has one
  let organization = null
  if (data?.organization_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: org } = await (supabase as any)
      .from('organizations')
      .select('*')
      .eq('id', data.organization_id)
      .single()
    organization = org
  }

  return { error: null, data: { ...data, organization } as UserWithOrg }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const profileData = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string || null,
    trade: formData.get('trade') as string || null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('users')
    .update(profileData)
    .eq('user_id', user.id)

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

  const orgId = formData.get('organization_id') as string || null
  const procoreId = formData.get('procore_id') as string || null

  // Create the organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: org, error: orgError } = await (supabase as any)
    .from('organizations')
    .insert({
      organization_id: orgId,
      procore_id: procoreId,
      user_ids: [user.id],
      project_ids: []
    })
    .select()
    .single()

  if (orgError) {
    return { error: orgError.message }
  }

  // Link the user to the organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: userError } = await (supabase as any)
    .from('users')
    .update({ organization_id: org.id })
    .eq('user_id', user.id)

  if (userError) {
    return { error: userError.message }
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

export async function getUsers(): Promise<{ error: string | null, data: User[] | null }> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('users')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data: data as User[] }
}
