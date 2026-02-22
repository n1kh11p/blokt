'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

export async function getTasks(projectId: string): Promise<{ error: string | null, data: Task[] | null }> {
  const supabase = await createClient()
  
  // Get project to get task_ids
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project } = await (supabase as any)
    .from('projects')
    .select('task_ids')
    .eq('id', projectId)
    .single()

  if (!project || !project.task_ids || project.task_ids.length === 0) {
    return { error: null, data: [] }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('tasks')
    .select('*')
    .in('id', project.task_ids)
    .order('start', { ascending: true })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data: data as Task[] }
}

export async function createTask(projectId: string, formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const assigneesStr = formData.get('assignees') as string
  const assignees = assigneesStr ? assigneesStr.split(',').filter(Boolean) : []
  
  const taskData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string || null,
    status: 'pending',
    start: formData.get('start') as string || null,
    end: formData.get('end') as string || null,
    trade: formData.get('trade') as string || null,
    assignees: assignees,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('tasks')
    .insert(taskData)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Add task to project's task_ids
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project } = await (supabase as any)
    .from('projects')
    .select('task_ids')
    .eq('id', projectId)
    .single()

  if (project) {
    const newTaskIds = [...(project.task_ids || []), data.id]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('projects')
      .update({ task_ids: newTaskIds })
      .eq('id', projectId)
  }

  revalidatePath(`/projects/${projectId}`)
  return { error: null, data }
}

export async function updateTask(taskId: string, projectId: string, formData: FormData) {
  const supabase = await createClient()
  
  const assigneesStr = formData.get('assignees') as string
  const assignees = assigneesStr ? assigneesStr.split(',').filter(Boolean) : []
  
  const taskData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string || null,
    status: formData.get('status') as string,
    start: formData.get('start') as string || null,
    end: formData.get('end') as string || null,
    trade: formData.get('trade') as string || null,
    assignees: assignees,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('tasks')
    .update(taskData)
    .eq('id', taskId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  return { error: null }
}

export async function deleteTask(taskId: string, projectId: string) {
  const supabase = await createClient()
  
  // Remove task from project's task_ids
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: project } = await (supabase as any)
    .from('projects')
    .select('task_ids')
    .eq('id', projectId)
    .single()

  if (project) {
    const newTaskIds = (project.task_ids || []).filter((id: string) => id !== taskId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('projects')
      .update({ task_ids: newTaskIds })
      .eq('id', projectId)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  return { error: null }
}
