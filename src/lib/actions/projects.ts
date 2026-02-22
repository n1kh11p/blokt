'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Project, Task, User } from '@/types'

// ============================================
// TYPES
// ============================================

export interface ProjectWithRelations extends Project {
  tasks?: Task[]
  users?: User[]
}

interface ApiResponse<T> {
  error: string | null
  data: T | null
}

interface MutationResponse {
  error: string | null
  success: boolean
  data?: Project
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
// GET PROJECTS
// Fetches all projects where the user is assigned
// ============================================

export async function getProjects(): Promise<ApiResponse<Project[]>> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', data: null }
  }

  try {
    // Get projects where user is in user_ids array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('projects')
      .select('*')
      .contains('user_ids', [user.id])
      .order('created_at', { ascending: false })

    if (error) {
      return { error: error.message, data: null }
    }

    return { error: null, data: data as Project[] }
  } catch (err) {
    console.error('[Projects] Error fetching projects:', err)
    return { error: err instanceof Error ? err.message : 'Failed to fetch projects', data: null }
  }
}



// ============================================
// GET PROJECT
// Fetches a single project by ID with related tasks and users
// ============================================

export async function getProject(id: string): Promise<ApiResponse<ProjectWithRelations>> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', data: null }
  }

  try {
    // Get project
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: project, error: projectError } = await (supabase as any)
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (projectError) {
      return { error: projectError.message, data: null }
    }

    // Verify user has access to this project
    if (!project.user_ids?.includes(user.id)) {
      return { error: 'Access denied to this project', data: null }
    }

    // Get tasks for this project
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tasks } = await (supabase as any)
      .from('tasks')
      .select('*')
      .in('id', project.task_ids || [])

    // Get users for this project
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: users } = await (supabase as any)
      .from('users')
      .select('*')
      .in('user_id', project.user_ids || [])

    return {
      error: null,
      data: {
        ...project,
        tasks: tasks || [],
        users: users || []
      }
    }
  } catch (err) {
    console.error('[Projects] Error fetching project:', err)
    return { error: err instanceof Error ? err.message : 'Failed to fetch project', data: null }
  }
}

// ============================================
// ADD PROJECT (CREATE)
// Creates a new project and assigns the current user
// ============================================

export async function addProject(formData: {
  name: string
  location?: string
  description?: string
  date?: string
  ended_date?: string
}): Promise<MutationResponse> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', success: false }
  }

  try {
    // Validate required fields
    if (!formData.name) {
      return { error: 'Project name is required', success: false }
    }

    const projectData = {
      name: formData.name,
      location: formData.location || null,
      description: formData.description || null,
      status: 'active' as const,
      date: formData.date || null,
      ended_date: formData.ended_date || null,
      user_ids: [user.id],
      task_ids: [],
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (error) {
      return { error: error.message, success: false }
    }

    // Update user's project_ids
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: currentUser } = await (supabase as any)
      .from('users')
      .select('project_ids')
      .eq('user_id', user.id)
      .single()

    if (currentUser) {
      const newProjectIds = [...(currentUser.project_ids || []), data.id]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('users')
        .update({ project_ids: newProjectIds })
        .eq('user_id', user.id)
    }

    revalidatePath('/projects')
    return { error: null, success: true, data }
  } catch (err) {
    console.error('[Projects] Error creating project:', err)
    return { error: err instanceof Error ? err.message : 'Failed to create project', success: false }
  }
}

// Legacy FormData version for backwards compatibility
export async function createProject(formData: FormData): Promise<MutationResponse> {
  return addProject({
    name: formData.get('name') as string,
    location: formData.get('location') as string || undefined,
    description: formData.get('description') as string || undefined,
    date: formData.get('date') as string || undefined,
    ended_date: formData.get('ended_date') as string || undefined,
  })
}

// ============================================
// UPDATE PROJECT
// Updates an existing project
// ============================================

export async function updateProject(id: string, formData: FormData): Promise<MutationResponse> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', success: false }
  }

  try {
    // Verify user has access to this project
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: project } = await (supabase as any)
      .from('projects')
      .select('user_ids')
      .eq('id', id)
      .single()

    if (!project || !project.user_ids?.includes(user.id)) {
      return { error: 'Access denied to this project', success: false }
    }

    const projectData = {
      name: formData.get('name') as string,
      location: formData.get('location') as string || null,
      description: formData.get('description') as string || null,
      status: formData.get('status') as string,
      date: formData.get('date') as string || null,
      ended_date: formData.get('ended_date') as string || null,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('projects')
      .update(projectData)
      .eq('id', id)

    if (error) {
      return { error: error.message, success: false }
    }

    revalidatePath('/projects')
    revalidatePath(`/projects/${id}`)
    return { error: null, success: true }
  } catch (err) {
    console.error('[Projects] Error updating project:', err)
    return { error: err instanceof Error ? err.message : 'Failed to update project', success: false }
  }
}

// ============================================
// DELETE PROJECT
// Deletes a project
// ============================================

export async function deleteProject(id: string): Promise<MutationResponse> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', success: false }
  }

  try {
    // Verify user has access to this project
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: project } = await (supabase as any)
      .from('projects')
      .select('user_ids')
      .eq('id', id)
      .single()

    if (!project || !project.user_ids?.includes(user.id)) {
      return { error: 'Access denied to this project', success: false }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: error.message, success: false }
    }

    revalidatePath('/projects')
    return { error: null, success: true }
  } catch (err) {
    console.error('[Projects] Error deleting project:', err)
    return { error: err instanceof Error ? err.message : 'Failed to delete project', success: false }
  }
}

// ============================================
// ADD USER TO PROJECT
// Assigns a user to a project
// ============================================

export async function addUserToProject(projectId: string, userId: string): Promise<MutationResponse> {
  const { user: currentUser, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !currentUser) {
    return { error: authError || 'Not authenticated', success: false }
  }

  try {
    // Get current project
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: project } = await (supabase as any)
      .from('projects')
      .select('user_ids')
      .eq('id', projectId)
      .single()

    if (!project) {
      return { error: 'Project not found', success: false }
    }

    // Verify current user has access to this project
    if (!project.user_ids?.includes(currentUser.id)) {
      return { error: 'Access denied to this project', success: false }
    }

    // Check if user is already assigned
    if (project.user_ids?.includes(userId)) {
      return { error: 'User already assigned to this project', success: false }
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
    const { data: user } = await (supabase as any)
      .from('users')
      .select('project_ids')
      .eq('user_id', userId)
      .single()

    if (user) {
      const newProjectIds = [...(user.project_ids || []), projectId]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('users')
        .update({ project_ids: newProjectIds })
        .eq('user_id', userId)
    }

    revalidatePath(`/projects/${projectId}`)
    return { error: null, success: true }
  } catch (err) {
    console.error('[Projects] Error adding user to project:', err)
    return { error: err instanceof Error ? err.message : 'Failed to add user to project', success: false }
  }
}

// ============================================
// REMOVE USER FROM PROJECT
// Removes a user from a project
// ============================================

export async function removeUserFromProject(projectId: string, userId: string): Promise<MutationResponse> {
  const { user: currentUser, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !currentUser) {
    return { error: authError || 'Not authenticated', success: false }
  }

  try {
    // Get current project
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: project } = await (supabase as any)
      .from('projects')
      .select('user_ids')
      .eq('id', projectId)
      .single()

    if (!project) {
      return { error: 'Project not found', success: false }
    }

    // Verify current user has access to this project
    if (!project.user_ids?.includes(currentUser.id)) {
      return { error: 'Access denied to this project', success: false }
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
    const { data: user } = await (supabase as any)
      .from('users')
      .select('project_ids')
      .eq('user_id', userId)
      .single()

    if (user) {
      const newProjectIds = (user.project_ids || []).filter((id: string) => id !== projectId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('users')
        .update({ project_ids: newProjectIds })
        .eq('user_id', userId)
    }

    revalidatePath(`/projects/${projectId}`)
    return { error: null, success: true }
  } catch (err) {
    console.error('[Projects] Error removing user from project:', err)
    return { error: err instanceof Error ? err.message : 'Failed to remove user from project', success: false }
  }
}
