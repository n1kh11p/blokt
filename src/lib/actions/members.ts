'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Member {
  id: string
  project_id: string
  user_id: string
  role: string
  created_at: string
  profiles: {
    id: string
    full_name: string | null
    email: string
    role: string
  }
}

export async function getProjectMembers(projectId: string): Promise<{ error: string | null, data: Member[] | null }> {
  const supabase = await createClient()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('project_members')
    .select('*, profiles(id, full_name, email, role)')
    .eq('project_id', projectId)

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data: data as Member[] }
}

export async function getAvailableUsers(projectId: string): Promise<{ error: string | null, data: { id: string, full_name: string | null, email: string, role: string }[] | null }> {
  const supabase = await createClient()
  
  // Get current project members
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: currentMembers } = await (supabase as any)
    .from('project_members')
    .select('user_id')
    .eq('project_id', projectId)

  const memberIds = currentMembers?.map((m: { user_id: string }) => m.user_id) || []

  // Get all profiles that are not already members
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profiles, error } = await (supabase as any)
    .from('profiles')
    .select('id, full_name, email, role')
    .not('id', 'in', `(${memberIds.length > 0 ? memberIds.join(',') : '00000000-0000-0000-0000-000000000000'})`)

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data: profiles }
}

export async function addProjectMember(projectId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const userId = formData.get('user_id') as string
  const role = formData.get('role') as string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('project_members')
    .insert({
      project_id: projectId,
      user_id: userId,
      role: role,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  return { error: null }
}

export async function updateMemberRole(memberId: string, projectId: string, formData: FormData) {
  const supabase = await createClient()
  
  const role = formData.get('role') as string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('project_members')
    .update({ role })
    .eq('id', memberId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  return { error: null }
}

export async function removeMember(memberId: string, projectId: string) {
  const supabase = await createClient()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('project_members')
    .delete()
    .eq('id', memberId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  return { error: null }
}
