'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { User, UserRole } from '@/types/database'

// ============================================
// TYPES
// ============================================

export interface TeamMember extends User {
  projectCount?: number
  projects?: Array<{ id: string; name: string }>
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
// GET ORGANIZATION MEMBERS
// Fetches all users in the same organization as the current user
// ============================================

export async function getOrganizationMembers(): Promise<ApiResponse<TeamMember[]>> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', data: null }
  }

  try {
    // Get current user's organization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentUser } = await (supabase as any)
      .from('users')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!currentUser?.organization_id) {
      return { error: 'User not associated with an organization', data: null }
    }

    // Fetch all users in the same organization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: members, error } = await (supabase as any)
      .from('users')
      .select('*')
      .eq('organization_id', currentUser.organization_id)
      .order('name', { ascending: true })

    if (error) {
      return { error: error.message, data: null }
    }

    // Fetch projects to count how many each member is assigned to
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: projects } = await (supabase as any)
      .from('projects')
      .select('id, name, user_ids')

    // Enrich members with project count and project names
    const enrichedMembers = (members || []).map((member: User) => {
      const memberProjects = (projects || []).filter((p: { user_ids: string[] | null }) => 
        p.user_ids?.includes(member.user_id)
      )
      
      return {
        ...member,
        projectCount: memberProjects.length,
        projects: memberProjects.map((p: { id: string; name: string }) => ({ 
          id: p.id, 
          name: p.name 
        }))
      }
    })

    return { error: null, data: enrichedMembers as TeamMember[] }
  } catch (err) {
    console.error('[Team] Error fetching organization members:', err)
    return { error: err instanceof Error ? err.message : 'Failed to fetch members', data: null }
  }
}

// ============================================
// ADD TEAM MEMBER
// Creates a new user account and adds them to the organization
// ============================================

export async function addTeamMember(formData: {
  email: string
  name: string
  role: UserRole
  phone?: string
  trade?: string
}): Promise<MutationResponse> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', success: false }
  }

  try {
    // Validate required fields
    if (!formData.email || !formData.name || !formData.role) {
      return { error: 'Email, name, and role are required', success: false }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return { error: 'Invalid email format', success: false }
    }

    // Get current user's organization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentUser } = await (supabase as any)
      .from('users')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!currentUser?.organization_id) {
      return { error: 'User not associated with an organization', success: false }
    }

    // Check if user with this email already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingUser } = await (supabase as any)
      .from('users')
      .select('user_id')
      .eq('email', formData.email)
      .single()

    if (existingUser) {
      return { error: 'User with this email already exists', success: false }
    }

    // Create auth user with Supabase Auth Admin API
    // Note: In production, you'd use the Admin API or invite flow
    // For now, we'll create a user record directly (requires auth setup)
    const { data: authUser, error: authCreateError } = await supabase.auth.admin.createUser({
      email: formData.email,
      email_confirm: true,
      user_metadata: {
        name: formData.name,
        role: formData.role
      }
    })

    if (authCreateError || !authUser.user) {
      console.error('[Team] Auth creation error:', authCreateError)
      return { error: `Failed to create user account: ${authCreateError?.message || 'Unknown error'}`, success: false }
    }

    // Create user record in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase as any)
      .from('users')
      .insert({
        user_id: authUser.user.id,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        phone: formData.phone || null,
        trade: formData.trade || null,
        organization_id: currentUser.organization_id,
        project_ids: []
      })

    if (dbError) {
      console.error('[Team] Database error:', dbError)
      // Try to clean up auth user if database insert fails
      await supabase.auth.admin.deleteUser(authUser.user.id)
      return { error: `Failed to create user record: ${dbError.message}`, success: false }
    }

    revalidatePath('/team')
    
    return { error: null, success: true }
  } catch (err) {
    console.error('[Team] Unexpected error adding team member:', err)
    return { error: err instanceof Error ? err.message : 'Failed to add team member', success: false }
  }
}

// ============================================
// REMOVE TEAM MEMBER
// Removes a user from the organization (soft delete)
// ============================================

export async function removeTeamMember(userId: string): Promise<MutationResponse> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', success: false }
  }

  try {
    // Prevent self-deletion
    if (userId === user.id) {
      return { error: 'Cannot remove yourself from the team', success: false }
    }

    // Get current user's organization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentUser } = await (supabase as any)
      .from('users')
      .select('organization_id')
      .eq('user_id', user.id)
      .single()

    if (!currentUser?.organization_id) {
      return { error: 'User not associated with an organization', success: false }
    }

    // Verify the user to be removed is in the same organization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: targetUser } = await (supabase as any)
      .from('users')
      .select('organization_id')
      .eq('user_id', userId)
      .single()

    if (!targetUser || targetUser.organization_id !== currentUser.organization_id) {
      return { error: 'User not found in your organization', success: false }
    }

    // Delete the user (cascade will handle related records)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase as any)
      .from('users')
      .delete()
      .eq('user_id', userId)

    if (deleteError) {
      return { error: `Failed to remove team member: ${deleteError.message}`, success: false }
    }

    revalidatePath('/team')
    
    return { error: null, success: true }
  } catch (err) {
    console.error('[Team] Error removing team member:', err)
    return { error: err instanceof Error ? err.message : 'Failed to remove team member', success: false }
  }
}
