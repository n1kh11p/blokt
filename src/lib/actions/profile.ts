'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { User, Organization } from '@/types'

// ============================================
// TYPES
// ============================================

export interface UserWithOrg extends User {
  organization?: Organization | null
}

interface ApiResponse<T> {
  error: string | null
  data: T | null
}

interface MutationResponse {
  error: string | null
  success: boolean
}

// ============================================
// HELPER: Get authenticated user
// ============================================

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { user: null, supabase, error: 'Not authenticated' }
  }
  
  return { user, supabase, error: null }
}

// ============================================
// GET PROFILE
// Fetches the current user's profile with organization
// ============================================

export async function getProfile(): Promise<ApiResponse<UserWithOrg>> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', data: null }
  }

  // Fetch user record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userData, error: userError } = await (supabase as any)
    .from('users')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (userError) {
    return { error: userError.message, data: null }
  }

  // Fetch organization if user has one
  let organization: Organization | null = null
  if (userData?.organization_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: orgData } = await (supabase as any)
      .from('organizations')
      .select('*')
      .eq('id', userData.organization_id)
      .single()
    organization = orgData
  }

  return { 
    error: null, 
    data: { ...userData, organization } as UserWithOrg 
  }
}

// ============================================
// UPDATE PROFILE
// Updates the current user's profile information
// ============================================

export async function updateProfile(formData: FormData): Promise<MutationResponse> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', success: false }
  }

  const name = formData.get('name') as string
  const phone = formData.get('phone') as string | null
  const trade = formData.get('trade') as string | null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('users')
    .update({
      name: name || null,
      phone: phone || null,
      trade: trade || null,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  
  return { error: null, success: true }
}

// ============================================
// UPDATE PASSWORD
// Updates the current user's password
// ============================================

export async function updatePassword(formData: FormData): Promise<MutationResponse> {
  const { supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError) {
    return { error: authError, success: false }
  }

  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  // Validation
  if (!newPassword || !confirmPassword) {
    return { error: 'Password fields are required', success: false }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Passwords do not match', success: false }
  }

  if (newPassword.length < 6) {
    return { error: 'Password must be at least 6 characters', success: false }
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword })

  if (error) {
    return { error: error.message, success: false }
  }

  return { error: null, success: true }
}

// ============================================
// CREATE ORGANIZATION
// Creates a new organization and links the user
// ============================================

export async function createOrganization(formData: FormData): Promise<ApiResponse<Organization>> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', data: null }
  }

  const organizationId = formData.get('organization_id') as string | null
  const procoreId = formData.get('procore_id') as string | null

  // Create the organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: org, error: orgError } = await (supabase as any)
    .from('organizations')
    .insert({
      organization_id: organizationId,
      procore_id: procoreId,
      user_ids: [user.id],
      project_ids: []
    })
    .select()
    .single()

  if (orgError) {
    return { error: orgError.message, data: null }
  }

  // Link the user to the organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: userError } = await (supabase as any)
    .from('users')
    .update({ 
      organization_id: org.id,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)

  if (userError) {
    return { error: userError.message, data: null }
  }

  revalidatePath('/settings')
  revalidatePath('/projects')
  
  return { error: null, data: org as Organization }
}

// ============================================
// GET USERS
// Fetches all users (for admin/member selection)
// ============================================

export async function getUsers(): Promise<ApiResponse<User[]>> {
  const { supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError) {
    return { error: authError, data: null }
  }

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
