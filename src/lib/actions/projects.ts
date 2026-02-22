'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Project {
  id: string
  name: string
  location: string | null
  description: string | null
  status: 'active' | 'completed' | 'on_hold' | 'cancelled'
  organization_id: string
  procore_project_id: string | null
  start_date: string | null
  end_date: string | null
  created_at: string
  updated_at: string
}

export async function getProjects(): Promise<{ error: string | null, data: Project[] | null }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
    return { error: null, data: [] }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('projects')
    .select('*')
    .eq('organization_id', profile.organization_id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data: data as Project[] }
}

export async function getProject(id: string) {
  const supabase = await createClient()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('projects')
    .select(`
      *,
      project_members(
        id,
        role,
        profiles(id, full_name, email, avatar_url, role)
      ),
      planned_tasks(*, assigned_profile:profiles!assigned_to(id, full_name, email)),
      video_uploads(*),
      safety_alerts(*),
      daily_summaries(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
    return { error: 'No organization found. Please set up your organization first.' }
  }

  const projectData = {
    name: formData.get('name') as string,
    location: formData.get('location') as string || null,
    description: formData.get('description') as string || null,
    status: 'active',
    organization_id: profile.organization_id,
    start_date: formData.get('start_date') as string || null,
    end_date: formData.get('end_date') as string || null,
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

  // Add the creator as a project member
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('project_members').insert({
    project_id: data.id,
    user_id: user.id,
    role: 'project_manager',
  })

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
    start_date: formData.get('start_date') as string || null,
    end_date: formData.get('end_date') as string || null,
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
