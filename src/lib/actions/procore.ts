'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Mock Procore API response types based on their schemas
interface ProcoreProject {
  id: number
  name: string
  project_number: string
  active: boolean
  address: string
  city: string
  state_code: string
  country_code: string
  updated_at: string
}


// Mock data generators following Procore schemas
function generateMockProjects(): ProcoreProject[] {
  return [
    {
      id: 10001,
      name: "Downtown Office Tower",
      project_number: "P-2024-001",
      active: true,
      address: "500 Main Street",
      city: "Austin",
      state_code: "TX",
      country_code: "US",
      updated_at: new Date().toISOString()
    },
    {
      id: 10002,
      name: "Harbor Bridge Renovation",
      project_number: "P-2024-002",
      active: true,
      address: "1200 Harbor Blvd",
      city: "San Diego",
      state_code: "CA",
      country_code: "US",
      updated_at: new Date().toISOString()
    },
    {
      id: 10003,
      name: "Metro Station Expansion",
      project_number: "P-2024-003",
      active: true,
      address: "800 Transit Way",
      city: "Denver",
      state_code: "CO",
      country_code: "US",
      updated_at: new Date().toISOString()
    },
    {
      id: 10004,
      name: "Airport Terminal B",
      project_number: "P-2024-004",
      active: true,
      address: "1 Airport Road",
      city: "Phoenix",
      state_code: "AZ",
      country_code: "US",
      updated_at: new Date().toISOString()
    },
    {
      id: 10005,
      name: "Riverside Apartments",
      project_number: "P-2024-005",
      active: false,
      address: "250 River Road",
      city: "Portland",
      state_code: "OR",
      country_code: "US",
      updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
}


interface MockTask {
  name: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  planned_start: string
  planned_end: string
}

function generateMockTasks(): MockTask[] {
  const taskTemplates = [
    { name: "Site preparation and grading", description: "Clear and grade the construction site according to plans" },
    { name: "Foundation excavation", description: "Excavate for foundation footings and walls" },
    { name: "Pour concrete footings", description: "Form and pour concrete footings per structural drawings" },
    { name: "Install rebar reinforcement", description: "Place rebar per structural specifications" },
    { name: "Waterproofing foundation", description: "Apply waterproofing membrane to foundation walls" },
    { name: "Structural steel delivery", description: "Receive and inspect structural steel shipment" },
    { name: "Steel column installation", description: "Erect primary steel columns on foundation" },
    { name: "Steel beam placement", description: "Install steel beams and connections" },
    { name: "Metal deck installation", description: "Install metal decking on steel frame" },
    { name: "Concrete slab pour - Level 1", description: "Pour concrete slab on metal deck for first floor" },
    { name: "Electrical rough-in", description: "Install electrical conduits and boxes" },
    { name: "Plumbing rough-in", description: "Install plumbing pipes and fixtures rough-in" },
    { name: "HVAC ductwork installation", description: "Install HVAC ducts and equipment" },
    { name: "Fire sprinkler installation", description: "Install fire protection system" },
    { name: "Roofing installation", description: "Install roofing membrane and flashing" },
  ]

  return taskTemplates.map((template, idx) => {
    const startOffset = idx * 5 - 30 // Spread tasks across past and future
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + startOffset)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 4) // Each task takes ~4 days
    
    // Earlier tasks more likely to be completed
    let status: MockTask['status']
    if (startOffset < -20) {
      status = 'completed'
    } else if (startOffset < -10) {
      status = Math.random() > 0.3 ? 'completed' : 'delayed'
    } else if (startOffset < 5) {
      status = Math.random() > 0.5 ? 'in_progress' : 'pending'
    } else {
      status = 'pending'
    }

    return {
      name: template.name,
      description: template.description,
      status,
      planned_start: startDate.toISOString().split('T')[0],
      planned_end: endDate.toISOString().split('T')[0]
    }
  })
}

// Main integration function
export async function connectProcore() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', success: false }
  }

  // Get user's organization from users table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userRecord } = await (supabase as any)
    .from('users')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!userRecord?.organization_id) {
    return { error: 'No organization found. Please create an organization first.', success: false }
  }

  const orgId = userRecord.organization_id

  try {
    console.log('[Procore Mock] Starting integration...')
    
    // 1. Fetch Projects from Procore API
    console.log('[Procore Mock] GET https://api.procore.com/rest/v1.1/projects')
    const procoreProjects = generateMockProjects()
    
    // Get all users in the organization
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: orgUsers } = await (supabase as any)
      .from('users')
      .select('user_id, name, email, role')
      .eq('organization_id', orgId)
    
    const availableUserIds = orgUsers?.map((u: { user_id: string }) => u.user_id) || [user.id]
    
    // Insert projects into database with user_ids
    const insertedProjectIds: string[] = []
    for (const proj of procoreProjects) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: insertedProject, error: projectError } = await (supabase as any)
        .from('projects')
        .insert({
          name: proj.name,
          location: `${proj.address}, ${proj.city}, ${proj.state_code}`,
          status: proj.active ? 'active' : 'completed',
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          ended_date: proj.active ? null : new Date().toISOString(),
          user_ids: availableUserIds,
          task_ids: []
        })
        .select('id')
        .single()

      if (projectError) {
        console.error('[Procore Mock] Project insert error:', projectError)
      } else if (insertedProject) {
        insertedProjectIds.push(insertedProject.id)
      }
    }

    // 2. Create tasks for each project
    console.log('[Procore Mock] GET https://api.procore.com/rest/v1.0/projects/{project_id}/rfis')
    let totalTasks = 0
    
    for (const projectId of insertedProjectIds) {
      const mockTasks = generateMockTasks()
      const taskIds: string[] = []
      
      for (const task of mockTasks) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: insertedTask } = await (supabase as any)
          .from('tasks')
          .insert({
            name: task.name,
            description: task.description,
            status: task.status,
            start: task.planned_start,
            end: task.planned_end,
            assignees: availableUserIds.slice(0, 2),
            trade: ['Electrical', 'Plumbing', 'HVAC', 'Concrete', 'Steel'][Math.floor(Math.random() * 5)]
          })
          .select('id')
          .single()
        
        if (insertedTask) {
          taskIds.push(insertedTask.id)
          totalTasks++
        }
      }
      
      // Update project with task_ids
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('projects')
        .update({ task_ids: taskIds })
        .eq('id', projectId)
    }

    // Update user's project_ids
    for (const userId of availableUserIds) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingUser } = await (supabase as any)
        .from('users')
        .select('project_ids')
        .eq('user_id', userId)
        .single()
      
      const currentProjectIds = existingUser?.project_ids || []
      const updatedProjectIds = [...new Set([...currentProjectIds, ...insertedProjectIds])]
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('users')
        .update({ project_ids: updatedProjectIds })
        .eq('user_id', userId)
    }

    console.log('[Procore Mock] Integration complete!')
    
    revalidatePath('/settings')
    revalidatePath('/projects')
    revalidatePath('/dashboard')
    
    return { 
      error: null, 
      success: true,
      summary: {
        projects: procoreProjects.length,
        users: availableUserIds.length,
        tasks: totalTasks,
        manpowerLogs: 0
      }
    }
  } catch (err) {
    console.error('[Procore Mock] Error:', err)
    return { error: err instanceof Error ? err.message : 'Integration failed', success: false }
  }
}

export async function checkProcoreConnection(): Promise<{ connected: boolean; lastSync?: string }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { connected: false }
  }

  // Get user's organization from users table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userRecord } = await (supabase as any)
    .from('users')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  if (!userRecord?.organization_id) {
    return { connected: false }
  }

  // Check if we have any projects for this user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: projects } = await (supabase as any)
    .from('projects')
    .select('updated_at')
    .contains('user_ids', [user.id])
    .order('updated_at', { ascending: false })
    .limit(1)

  if (projects && projects.length > 0) {
    return { connected: true, lastSync: projects[0].updated_at }
  }

  return { connected: false }
}
