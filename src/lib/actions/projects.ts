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

// Pre-defined team configurations for different projects
const TEAM_CONFIGS = [
  // Team A - Commercial specialists
  [
    { name: 'Sarah Johnson', role: 'project_manager' },
    { name: 'Mike Chen', role: 'foreman' },
    { name: 'David Lee', role: 'field_worker' },
    { name: 'Maria Garcia', role: 'safety_manager' },
    { name: 'James Wilson', role: 'field_worker' },
  ],
  // Team B - Residential crew
  [
    { name: 'Emily Davis', role: 'project_manager' },
    { name: 'Robert Martinez', role: 'foreman' },
    { name: 'Jennifer Brown', role: 'field_worker' },
    { name: 'Carlos Ramirez', role: 'safety_manager' },
  ],
  // Team C - Infrastructure team
  [
    { name: 'Kevin Park', role: 'project_manager' },
    { name: 'Lisa Thompson', role: 'foreman' },
    { name: 'Marcus Reed', role: 'field_worker' },
    { name: 'Rachel Kim', role: 'field_worker' },
    { name: 'Brandon Scott', role: 'safety_manager' },
    { name: 'Nicole Adams', role: 'foreman' },
  ],
  // Team D - High-rise specialists
  [
    { name: 'Derek Nguyen', role: 'project_manager' },
    { name: 'Samantha Cruz', role: 'foreman' },
    { name: 'Tyler Brooks', role: 'field_worker' },
    { name: 'Jessica Patel', role: 'safety_manager' },
    { name: 'Andrew Kim', role: 'field_worker' },
  ],
  // Team E - Mixed projects
  [
    { name: 'Michelle Torres', role: 'project_manager' },
    { name: 'Ryan Cooper', role: 'foreman' },
    { name: 'Amanda Foster', role: 'field_worker' },
    { name: 'Chris Anderson', role: 'safety_manager' },
  ],
]

function getMockTeamForProject(projectId: string): Array<{
  id: string
  role: string
  profiles: { id: string; full_name: string; email: string; avatar_url: null; role: string }
}> {
  // Use different characters from project ID to pick a team
  const idSum = projectId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const teamIndex = idSum % TEAM_CONFIGS.length
  const team = TEAM_CONFIGS[teamIndex]
  
  return team.map((member, idx) => {
    const emailName = member.name.toLowerCase().replace(' ', '.')
    return {
      id: `mock-${projectId.slice(0, 8)}-${idx}`,
      role: member.role,
      profiles: {
        id: `profile-${idSum}-${idx}`,
        full_name: member.name,
        email: `${emailName}@blokt.com`,
        avatar_url: null,
        role: member.role
      }
    }
  })
}

// Mock tasks configurations for different project types
const TASK_CONFIGS = [
  // Config A - Foundation phase
  [
    { name: 'Site clearing and grading', status: 'completed', trade: 'Earthwork' },
    { name: 'Foundation excavation', status: 'completed', trade: 'Excavation' },
    { name: 'Rebar installation - footings', status: 'completed', trade: 'Concrete' },
    { name: 'Pour concrete footings', status: 'in_progress', trade: 'Concrete' },
    { name: 'Foundation wall forming', status: 'pending', trade: 'Concrete' },
    { name: 'Waterproofing foundation', status: 'pending', trade: 'Waterproofing' },
  ],
  // Config B - Structural phase
  [
    { name: 'Steel column delivery', status: 'completed', trade: 'Steel' },
    { name: 'Erect primary steel columns', status: 'completed', trade: 'Steel' },
    { name: 'Install steel beams - Level 1', status: 'in_progress', trade: 'Steel' },
    { name: 'Metal deck installation', status: 'pending', trade: 'Steel' },
    { name: 'Concrete slab pour - Level 1', status: 'pending', trade: 'Concrete' },
    { name: 'Fireproofing steel', status: 'pending', trade: 'Fireproofing' },
    { name: 'Elevator shaft construction', status: 'pending', trade: 'Concrete' },
  ],
  // Config C - MEP rough-in
  [
    { name: 'Electrical conduit rough-in', status: 'completed', trade: 'Electrical' },
    { name: 'Plumbing rough-in - Level 1', status: 'completed', trade: 'Plumbing' },
    { name: 'HVAC ductwork installation', status: 'in_progress', trade: 'HVAC' },
    { name: 'Fire sprinkler main lines', status: 'in_progress', trade: 'Fire Protection' },
    { name: 'Low voltage wiring', status: 'pending', trade: 'Electrical' },
    { name: 'Plumbing fixtures rough-in', status: 'pending', trade: 'Plumbing' },
  ],
  // Config D - Exterior work
  [
    { name: 'Exterior wall framing', status: 'completed', trade: 'Framing' },
    { name: 'Window installation', status: 'completed', trade: 'Glazing' },
    { name: 'Roofing membrane application', status: 'in_progress', trade: 'Roofing' },
    { name: 'Exterior cladding - North', status: 'in_progress', trade: 'Facades' },
    { name: 'Exterior cladding - South', status: 'pending', trade: 'Facades' },
    { name: 'Flashing and trim', status: 'pending', trade: 'Roofing' },
    { name: 'Exterior painting prep', status: 'pending', trade: 'Painting' },
  ],
  // Config E - Interior finishes
  [
    { name: 'Drywall installation - Level 2', status: 'completed', trade: 'Drywall' },
    { name: 'Taping and mudding', status: 'in_progress', trade: 'Drywall' },
    { name: 'Interior painting - Level 1', status: 'in_progress', trade: 'Painting' },
    { name: 'Flooring installation', status: 'pending', trade: 'Flooring' },
    { name: 'Cabinet installation', status: 'pending', trade: 'Millwork' },
    { name: 'Final electrical trim', status: 'pending', trade: 'Electrical' },
    { name: 'Punch list items', status: 'pending', trade: 'General' },
  ],
]

function getMockTasksForProject(projectId: string) {
  const idSum = projectId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const configIndex = (idSum + 2) % TASK_CONFIGS.length // Offset from team selection
  const tasks = TASK_CONFIGS[configIndex]
  
  const today = new Date()
  
  return tasks.map((task, idx) => {
    const startOffset = (idx - 3) * 4 // Spread across past and future
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() + startOffset)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 3)
    
    return {
      id: `task-${projectId.slice(0, 8)}-${idx}`,
      project_id: projectId,
      name: task.name,
      description: `${task.trade} work for project phase`,
      status: task.status,
      trade: task.trade,
      planned_start: startDate.toISOString().split('T')[0],
      planned_end: endDate.toISOString().split('T')[0],
      assigned_to: null,
      assigned_profile: null,
      created_at: new Date().toISOString(),
    }
  })
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

  // Always use mock team members for demo (replaces any members without proper profiles)
  const realMembersWithProfiles = (data.project_members || []).filter(
    (m: { profiles?: { full_name?: string } }) => m.profiles?.full_name
  )
  
  if (realMembersWithProfiles.length < 3) {
    data.project_members = getMockTeamForProject(id)
  }

  // Add mock tasks if project has fewer than 3 real tasks
  if (!data.planned_tasks || data.planned_tasks.length < 3) {
    data.planned_tasks = getMockTasksForProject(id)
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
