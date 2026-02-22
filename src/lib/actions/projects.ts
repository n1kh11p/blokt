'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Project {
  id: string
  name: string
  location: string | null
  description: string | null
  status: string
  date: string | null
  ended_date: string | null
  task_ids: string[]
  user_ids: string[]
  created_at: string
  updated_at: string
}

export async function getProjects(): Promise<{ error: string | null, data: Project[] | null }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

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
}

export interface Task {
  id: string
  safety_id: string | null
  name: string
  description: string | null
  status: string
  start: string | null
  end: string | null
  assignees: string[]
  trade: string | null
  created_at: string
  updated_at: string
}

export interface User {
  user_id: string
  role: string | null
  name: string | null
  trade: string | null
  phone: string | null
  email: string | null
  organization_id: string | null
  project_ids: string[]
}

export interface ProjectWithRelations extends Project {
  tasks?: Task[]
  users?: User[]
}

export async function getProject(id: string): Promise<{ error: string | null, data: ProjectWithRelations | null }> {
  const supabase = await createClient()
  
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
}

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const projectData = {
    name: formData.get('name') as string,
    location: formData.get('location') as string || null,
    description: formData.get('description') as string || null,
    status: 'active',
    date: formData.get('date') as string || null,
    ended_date: formData.get('ended_date') as string || null,
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
    return { error: error.message }
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
  return { error: null, data }
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient()
  
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
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath(`/projects/${id}`)
  return { error: null }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  return { error: null }
}

export async function addUserToProject(projectId: string, userId: string) {
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
  return { error: null }
}

export async function removeUserFromProject(projectId: string, userId: string) {
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
  return { error: null }
}
