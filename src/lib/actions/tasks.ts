'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Task {
  id: string
  project_id: string
  name: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  planned_start: string
  planned_end: string
  actual_start: string | null
  actual_end: string | null
  trade: string | null
  assigned_to: string | null
  assigned_profile?: { id: string; full_name: string | null; email: string } | null
  created_at: string
  updated_at: string
}

export async function getTasks(projectId: string): Promise<{ error: string | null, data: Task[] | null }> {
  const supabase = await createClient()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('planned_tasks')
    .select('*, assigned_profile:profiles!assigned_to(id, full_name, email)')
    .eq('project_id', projectId)
    .order('planned_start', { ascending: true })

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

  const assignedTo = formData.get('assigned_to') as string
  const taskData = {
    project_id: projectId,
    name: formData.get('name') as string,
    description: formData.get('description') as string || null,
    status: 'pending',
    planned_start: formData.get('planned_start') as string,
    planned_end: formData.get('planned_end') as string,
    trade: formData.get('trade') as string || null,
    assigned_to: assignedTo || null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('planned_tasks')
    .insert(taskData)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  return { error: null, data }
}

export async function updateTask(taskId: string, projectId: string, formData: FormData) {
  const supabase = await createClient()
  
  const assignedTo = formData.get('assigned_to') as string
  const taskData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string || null,
    status: formData.get('status') as string,
    planned_start: formData.get('planned_start') as string,
    planned_end: formData.get('planned_end') as string,
    trade: formData.get('trade') as string || null,
    assigned_to: assignedTo || null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('planned_tasks')
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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('planned_tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/projects/${projectId}`)
  return { error: null }
}
