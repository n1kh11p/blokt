'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Safety } from '@/types'

// ============================================
// TYPES
// ============================================

interface ApiResponse<T> {
  error: string | null
  data: T | null
}

interface MutationResponse {
  error: string | null
  success: boolean
  data?: Safety
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
// GET SAFETY ENTRIES BY TASK
// Fetches safety entries for a specific task
// ============================================

export async function getSafetyEntries(taskId: string): Promise<ApiResponse<Safety[]>> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', data: null }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('safety')
      .select('*')
      .eq('task_id', taskId)
      .order('timestamp', { ascending: false })

    if (error) {
      return { error: error.message, data: null }
    }

    return { error: null, data: data as Safety[] }
  } catch (err) {
    console.error('[Safety] Error fetching safety entries:', err)
    return { error: err instanceof Error ? err.message : 'Failed to fetch safety entries', data: null }
  }
}

// ============================================
// GET ALL SAFETY ENTRIES
// Fetches all safety entries for the user's organization
// ============================================

export async function getAllSafetyEntries(): Promise<ApiResponse<Safety[]>> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', data: null }
  }

  try {
    // Get user's organization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userData } = await (supabase as any)
      .from('users')
      .select('organization_id, project_ids')
      .eq('user_id', user.id)
      .single()

    if (!userData) {
      return { error: 'User not found', data: null }
    }

    // Get all safety entries for user's projects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('safety')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100)

    if (error) {
      return { error: error.message, data: null }
    }

    return { error: null, data: data as Safety[] }
  } catch (err) {
    console.error('[Safety] Error fetching all safety entries:', err)
    return { error: err instanceof Error ? err.message : 'Failed to fetch safety entries', data: null }
  }
}

// ============================================
// CREATE SAFETY ENTRY
// Creates a new safety alert/entry
// ============================================

export async function createSafetyEntry(formData: FormData): Promise<MutationResponse> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', success: false }
  }

  try {
    const taskId = formData.get('task_id') as string
    const userId = formData.get('user_id') as string
    const safetyName = formData.get('safety_name') as string
    const description = formData.get('description') as string
    const uri = formData.get('uri') as string

    // Validate required fields
    if (!safetyName) {
      return { error: 'Safety name is required', success: false }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('safety')
      .insert({
        task_id: taskId || null,
        user_id: userId || user.id,
        safety_name: safetyName,
        description: description || null,
        uri: uri || null,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message, success: false }
    }

    // If task_id provided, update the task's safety_id
    if (taskId && data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('tasks')
        .update({ safety_id: data.safety_id })
        .eq('id', taskId)
    }

    revalidatePath('/safety')
    return { error: null, success: true, data: data as Safety }
  } catch (err) {
    console.error('[Safety] Error creating safety entry:', err)
    return { error: err instanceof Error ? err.message : 'Failed to create safety entry', success: false }
  }
}

// ============================================
// UPDATE SAFETY ENTRY
// Updates an existing safety entry
// ============================================

export async function updateSafetyEntry(safetyId: string, formData: FormData): Promise<MutationResponse> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', success: false }
  }

  try {
    const safetyData = {
      safety_name: formData.get('safety_name') as string || null,
      description: formData.get('description') as string || null,
      uri: formData.get('uri') as string || null,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('safety')
      .update(safetyData)
      .eq('safety_id', safetyId)

    if (error) {
      return { error: error.message, success: false }
    }

    revalidatePath('/safety')
    return { error: null, success: true }
  } catch (err) {
    console.error('[Safety] Error updating safety entry:', err)
    return { error: err instanceof Error ? err.message : 'Failed to update safety entry', success: false }
  }
}

// ============================================
// DELETE SAFETY ENTRY
// Deletes a safety entry
// ============================================

export async function deleteSafetyEntry(safetyId: string): Promise<MutationResponse> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', success: false }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('safety')
      .delete()
      .eq('safety_id', safetyId)

    if (error) {
      return { error: error.message, success: false }
    }

    revalidatePath('/safety')
    return { error: null, success: true }
  } catch (err) {
    console.error('[Safety] Error deleting safety entry:', err)
    return { error: err instanceof Error ? err.message : 'Failed to delete safety entry', success: false }
  }
}

// ============================================
// GET SAFETY COUNT
// Returns the total count of safety entries
// ============================================

export async function getSafetyCount(): Promise<ApiResponse<number>> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', data: null }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count, error } = await (supabase as any)
      .from('safety')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return { error: error.message, data: null }
    }

    return { error: null, data: count || 0 }
  } catch (err) {
    console.error('[Safety] Error getting safety count:', err)
    return { error: err instanceof Error ? err.message : 'Failed to get safety count', data: null }
  }
}
