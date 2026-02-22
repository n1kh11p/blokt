'use server'

import { createClient } from '@/lib/supabase/server'
import type { User, Project, Task } from '@/types'
import type { DashboardData } from '@/types/dashboard'

// ============================================
// TYPES
// ============================================

interface ApiResponse<T> {
  error: string | null
  data: T | null
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
// MOCK DATA GENERATORS
// ============================================

function generateMockProjects(count: number = 3): Project[] {
  const mockProjects: Project[] = []
  const projectNames = [
    'Downtown Office Tower',
    'Harbor Bridge Renovation',
    'Metro Station Expansion',
    'Airport Terminal B',
    'Riverside Apartments'
  ]
  
  for (let i = 0; i < Math.min(count, projectNames.length); i++) {
    mockProjects.push({
      id: `mock-project-${i}`,
      name: projectNames[i],
      location: `${['Austin', 'San Diego', 'Denver', 'Phoenix', 'Portland'][i]}, ${['TX', 'CA', 'CO', 'AZ', 'OR'][i]}`,
      description: `Mock project for ${projectNames[i]}`,
      status: i === 0 ? 'active' : (i === 1 ? 'on_hold' : 'active'),
      date: new Date(Date.now() - (90 + i * 10) * 24 * 60 * 60 * 1000).toISOString(),
      ended_date: null,
      task_ids: [],
      user_ids: [],
      created_at: new Date(Date.now() - (90 + i * 10) * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
  }
  
  return mockProjects
}

function generateMockTasks(count: number = 15): Task[] {
  const mockTasks: Task[] = []
  const taskNames = [
    'Foundation excavation',
    'Pour concrete footings',
    'Install rebar reinforcement',
    'Structural steel delivery',
    'Steel column installation',
    'Electrical rough-in',
    'Plumbing rough-in',
    'HVAC ductwork installation',
    'Fire sprinkler installation',
    'Roofing installation',
    'Drywall installation',
    'Interior painting',
    'Flooring installation',
    'Fixture installation',
    'Final inspection'
  ]
  
  const trades = ['Concrete', 'Steel', 'Electrical', 'Plumbing', 'HVAC', 'Roofing', 'Finishing']
  
  for (let i = 0; i < Math.min(count, taskNames.length); i++) {
    const startOffset = i * 3 - 20
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + startOffset)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 5)
    
    // Earlier tasks more likely to be completed
    let status: Task['status']
    if (startOffset < -15) {
      status = 'completed'
    } else if (startOffset < -5) {
      status = Math.random() > 0.3 ? 'completed' : 'in_progress'
    } else if (startOffset < 5) {
      status = Math.random() > 0.5 ? 'in_progress' : 'pending'
    } else {
      status = 'pending'
    }
    
    mockTasks.push({
      id: `mock-task-${i}`,
      safety_id: null,
      name: taskNames[i],
      description: `Mock task: ${taskNames[i]}`,
      status,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      assignees: [],
      trade: trades[i % trades.length],
      created_at: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
  }
  
  return mockTasks
}

// ============================================
// GET DASHBOARD DATA
// Fetches all data needed for dashboard with mock fallback
// ============================================

export async function getDashboardData(): Promise<ApiResponse<DashboardData>> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', data: null }
  }

  try {
    // Fetch user record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: userRecord } = await (supabase as any)
      .from('users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const typedUser = userRecord as User | null
    const firstName = typedUser?.name?.split(' ')[0] || 'there'

    // Fetch projects where user is assigned
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: projectsData } = await (supabase as any)
      .from('projects')
      .select('*')
      .contains('user_ids', [user.id])
      .order('created_at', { ascending: false })

    let projects = (projectsData || []) as Project[]
    
    // If no projects, use mock data
    if (projects.length === 0) {
      console.log('[Dashboard] No projects found, using mock data')
      projects = generateMockProjects(3)
    }

    const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'on_hold')

    // Fetch tasks for all projects
    const allTaskIds = projects.flatMap(p => p.task_ids || [])
    let allTasks: Task[] = []
    
    if (allTaskIds.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: tasksData } = await (supabase as any)
        .from('tasks')
        .select('*')
        .in('id', allTaskIds)
      
      allTasks = (tasksData || []) as Task[]
    }
    
    // If no tasks found, use mock data
    if (allTasks.length === 0) {
      console.log('[Dashboard] No tasks found, using mock data')
      allTasks = generateMockTasks(15)
    }

    // Filter tasks by status
    const completedTasks = allTasks.filter(t => t.status === 'completed')
    const pendingTasks = allTasks.filter(t => t.status === 'pending' || t.status === 'in_progress' || t.status === 'delayed')

    // Calculate total members across all projects
    const uniqueUserIds = new Set<string>()
    projects.forEach(p => {
      (p.user_ids || []).forEach(uid => uniqueUserIds.add(uid))
    })
    const totalMembers = uniqueUserIds.size || 8 // Default to 8 if no members

    const dashboardData: DashboardData = {
      firstName,
      projects,
      activeProjects,
      allTasks,
      completedTasks,
      pendingTasks,
      totalMembers
    }

    return { error: null, data: dashboardData }
  } catch (err) {
    console.error('[Dashboard] Error fetching data:', err)
    
    // Return mock data on error
    const mockData: DashboardData = {
      firstName: 'there',
      projects: generateMockProjects(3),
      activeProjects: generateMockProjects(2),
      allTasks: generateMockTasks(15),
      completedTasks: generateMockTasks(15).filter(t => t.status === 'completed'),
      pendingTasks: generateMockTasks(15).filter(t => t.status !== 'completed'),
      totalMembers: 8
    }
    
    return { error: null, data: mockData }
  }
}
