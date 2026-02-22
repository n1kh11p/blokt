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

// ============================================
// GET ORGANIZATION INVITE CODE
// Returns the organization ID which acts as the invite code
// ============================================

export async function getOrganizationInviteCode(): Promise<ApiResponse<{ code: string }>> {
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

    return { error: null, data: { code: currentUser.organization_id } }
  } catch (err) {
    console.error('[Team] Unexpected error getting invite code:', err)
    return { error: err instanceof Error ? err.message : 'Failed to get invite code', data: null }
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
