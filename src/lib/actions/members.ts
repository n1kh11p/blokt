'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface User {
  user_id: string
  role: string | null
  name: string | null
  trade: string | null
  phone: string | null
  email: string | null
  organization_id: string | null
  project_ids: string[]
  created_at: string
  updated_at: string
}

export async function getProjectMembers(projectId: string): Promise<{ error: string | null, data: User[] | null }> {
  const supabase = await createClient()
  
  // Get project to get user_ids
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project } = await (supabase as any)
    .from('projects')
    .select('user_ids')
    .eq('id', projectId)
    .single()

  if (!project || !project.user_ids || project.user_ids.length === 0) {
    return { error: null, data: [] }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('users')
    .select('*')
    .in('user_id', project.user_ids)

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data: data as User[] }
}

export async function getAvailableUsers(projectId: string): Promise<{ error: string | null, data: User[] | null }> {
  const supabase = await createClient()
  
  // Get current project members
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project } = await (supabase as any)
    .from('projects')
    .select('user_ids')
    .eq('id', projectId)
    .single()

  const memberIds = project?.user_ids || []

  // Get all users that are not already members
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any).from('users').select('*')
  
  if (memberIds.length > 0) {
    query = query.not('user_id', 'in', `(${memberIds.join(',')})`)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data: data as User[] }
}

export async function addProjectMember(projectId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const userId = formData.get('user_id') as string

  if (!userId) {
    return { error: 'User ID is required' }
  }

  // Get current project
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project } = await (supabase as any)
    .from('projects')
    .select('user_ids')
    .eq('id', projectId)
    .single()

  if (!project) {
    return { error: 'Project not found' }
  }

  // Check if user is already a member
  if (project.user_ids?.includes(userId)) {
    return { error: 'User is already a member of this project' }
  }

  // Add user to project's user_ids
  const newUserIds = [...(project.user_ids || []), userId]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('projects')
    .update({ user_ids: newUserIds })
    .eq('id', projectId)

  // Add project to user's project_ids
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: targetUser } = await (supabase as any)
    .from('users')
    .select('project_ids')
    .eq('user_id', userId)
    .single()

  if (targetUser) {
    const newProjectIds = [...(targetUser.project_ids || []), projectId]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('users')
      .update({ project_ids: newProjectIds })
      .eq('user_id', userId)
  }

  revalidatePath(`/projects/${projectId}`)
  return { error: null }
}

export async function updateMemberRole(userId: string, projectId: string, formData: FormData) {
  const supabase = await createClient()
  
  const role = formData.get('role') as string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('users')
    .update({ role })
    .eq('user_id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  return { error: null }
}

export async function removeMember(userId: string, projectId: string) {
  const supabase = await createClient()
  
  // Get current project
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project } = await (supabase as any)
    .from('projects')
    .select('user_ids')
    .eq('id', projectId)
    .single()

  if (!project) {
    return { error: 'Project not found' }
  }

  // Remove user from project's user_ids
  const newUserIds = (project.user_ids || []).filter((id: string) => id !== userId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('projects')
    .update({ user_ids: newUserIds })
    .eq('id', projectId)

  // Remove project from user's project_ids
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: targetUser } = await (supabase as any)
    .from('users')
    .select('project_ids')
    .eq('user_id', userId)
    .single()

  if (targetUser) {
    const newProjectIds = (targetUser.project_ids || []).filter((id: string) => id !== projectId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('users')
      .update({ project_ids: newProjectIds })
      .eq('user_id', userId)
  }

  revalidatePath(`/projects/${projectId}`)
  return { error: null }
}
