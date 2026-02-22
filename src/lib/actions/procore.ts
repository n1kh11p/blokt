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

interface ProcoreRFI {
  id: number
  number: string
  subject: string
  status: string
  rfi_manager: { id: number; name: string }
  ball_in_court: { id: number; name: string }
  due_date: string
  attachments: { id: number; url: string }[]
}

interface ProcoreUser {
  id: number
  name: string
  email: string
  job_title: string
  is_employee: boolean
  vendor: { id: number; name: string } | null
}

interface ProcoreManpowerLog {
  id: number
  date: string
  num_workers: number
  num_hours: number
  vendor: { id: number; name: string }
  notes: string
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

function generateMockRFIs(projectId: number): ProcoreRFI[] {
  const rfis: ProcoreRFI[] = [
    {
      id: 1001,
      number: "RFI-001",
      subject: "Foundation Rebar Conflict with MEP",
      status: "Open",
      rfi_manager: { id: 1, name: "Sarah Johnson" },
      ball_in_court: { id: 2, name: "Mike Chen" },
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      attachments: [{ id: 101, url: "https://example.com/attachment1.pdf" }]
    },
    {
      id: 1002,
      number: "RFI-002",
      subject: "Structural Steel Connection Detail",
      status: "Open",
      rfi_manager: { id: 1, name: "Sarah Johnson" },
      ball_in_court: { id: 3, name: "David Lee" },
      due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      attachments: []
    },
    {
      id: 1003,
      number: "RFI-003",
      subject: "HVAC Duct Routing Clarification",
      status: "Closed",
      rfi_manager: { id: 2, name: "Mike Chen" },
      ball_in_court: { id: 1, name: "Sarah Johnson" },
      due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      attachments: [{ id: 102, url: "https://example.com/hvac-detail.pdf" }]
    }
  ]
  return rfis.map(rfi => ({ ...rfi, id: rfi.id + projectId }))
}

function generateMockUsers(projectId: number): ProcoreUser[] {
  const users: ProcoreUser[] = [
    {
      id: 2001,
      name: "Sarah Johnson",
      email: "sarah.johnson@buildco.com",
      job_title: "Project Manager",
      is_employee: true,
      vendor: null
    },
    {
      id: 2002,
      name: "Mike Chen",
      email: "mike.chen@buildco.com",
      job_title: "Site Superintendent",
      is_employee: true,
      vendor: null
    },
    {
      id: 2003,
      name: "David Lee",
      email: "david.lee@structuraleng.com",
      job_title: "Structural Engineer",
      is_employee: false,
      vendor: { id: 301, name: "Structural Engineering Associates" }
    },
    {
      id: 2004,
      name: "Maria Garcia",
      email: "maria.garcia@electricpro.com",
      job_title: "Electrical Foreman",
      is_employee: false,
      vendor: { id: 302, name: "ElectricPro Services" }
    },
    {
      id: 2005,
      name: "James Wilson",
      email: "james.wilson@concreteco.com",
      job_title: "Concrete Supervisor",
      is_employee: false,
      vendor: { id: 303, name: "Concrete Co." }
    },
    {
      id: 2006,
      name: "Emily Davis",
      email: "emily.davis@buildco.com",
      job_title: "Safety Manager",
      is_employee: true,
      vendor: null
    },
    {
      id: 2007,
      name: "Robert Martinez",
      email: "robert.martinez@plumbingplus.com",
      job_title: "Plumbing Lead",
      is_employee: false,
      vendor: { id: 304, name: "Plumbing Plus" }
    },
    {
      id: 2008,
      name: "Jennifer Brown",
      email: "jennifer.brown@hvacexperts.com",
      job_title: "HVAC Technician",
      is_employee: false,
      vendor: { id: 305, name: "HVAC Experts Inc." }
    }
  ]
  return users.map(u => ({ ...u, id: u.id + projectId }))
}

function generateMockManpowerLogs(projectId: number): ProcoreManpowerLog[] {
  const logs: ProcoreManpowerLog[] = []
  const vendors = [
    { id: 301, name: "Structural Engineering Associates" },
    { id: 302, name: "ElectricPro Services" },
    { id: 303, name: "Concrete Co." },
    { id: 304, name: "Plumbing Plus" },
    { id: 305, name: "HVAC Experts Inc." }
  ]
  
  // Generate logs for the past 14 days
  for (let i = 0; i < 14; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue
    
    vendors.forEach((vendor, idx) => {
      logs.push({
        id: 3000 + projectId + i * 10 + idx,
        date: date.toISOString().split('T')[0],
        num_workers: Math.floor(Math.random() * 8) + 2,
        num_hours: Math.floor(Math.random() * 40) + 20,
        vendor: vendor,
        notes: getRandomWorkNote()
      })
    })
  }
  
  return logs
}

function getRandomWorkNote(): string {
  const notes = [
    "Completed foundation work in Section A",
    "Installed electrical conduits on floors 3-5",
    "Poured concrete for level 2 slab",
    "HVAC ductwork installation in progress",
    "Structural steel erection continuing",
    "Plumbing rough-in for restrooms",
    "Fire protection system installation",
    "Exterior wall framing ongoing",
    "Roof membrane application started",
    "Interior partition framing",
    "Elevator shaft construction",
    "Stairwell concrete work"
  ]
  return notes[Math.floor(Math.random() * notes.length)]
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

  // Get user's organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile?.organization_id) {
    return { error: 'No organization found', success: false }
  }

  const orgId = profile.organization_id

  try {
    // Simulate API calls with delays
    console.log('[Procore Mock] Starting integration...')
    
    // 1. Fetch Projects from Procore API
    console.log('[Procore Mock] GET https://api.procore.com/rest/v1.1/projects')
    const procoreProjects = generateMockProjects()
    
    // Insert projects into database
    for (const proj of procoreProjects) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: projectError } = await (supabase as any)
        .from('projects')
        .upsert({
          id: undefined, // Let DB generate
          organization_id: orgId,
          name: proj.name,
          location: `${proj.address}, ${proj.city}, ${proj.state_code}`,
          status: proj.active ? 'active' : 'completed',
          start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          procore_id: proj.id.toString(),
        }, { onConflict: 'procore_id', ignoreDuplicates: true })

      if (projectError) {
        console.error('[Procore Mock] Project insert error:', projectError)
      }
    }

    // Get inserted projects to use their IDs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dbProjects } = await (supabase as any)
      .from('projects')
      .select('id, procore_id')
      .eq('organization_id', orgId)

    const projectMap = new Map(dbProjects?.map((p: { id: string; procore_id: string }) => [p.procore_id, p.id]) || [])

    // 2. Fetch Users/Directory from Procore API for each project
    console.log('[Procore Mock] GET https://api.procore.com/rest/v1.0/projects/{project_id}/users')
    
    // Get all existing profiles in the organization to add as project members
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: orgProfiles } = await (supabase as any)
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('organization_id', orgId)
    
    const availableUsers = orgProfiles || []
    let totalMembers = 0
    
    for (const proj of procoreProjects) {
      const dbProjectId = projectMap.get(proj.id.toString())
      if (!dbProjectId) continue

      // Add current user as project manager
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('project_members')
        .upsert({
          project_id: dbProjectId,
          user_id: user.id,
          role: 'project_manager'
        }, { onConflict: 'project_id,user_id', ignoreDuplicates: true })
      totalMembers++

      // Add other org members to the project with various roles
      const roles: Array<'foreman' | 'field_worker' | 'safety_manager'> = ['foreman', 'field_worker', 'safety_manager']
      for (const orgUser of availableUsers) {
        if (orgUser.id === user.id) continue // Skip current user, already added
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('project_members')
          .upsert({
            project_id: dbProjectId,
            user_id: orgUser.id,
            role: roles[totalMembers % roles.length]
          }, { onConflict: 'project_id,user_id', ignoreDuplicates: true })
        totalMembers++
      }
    }

    // 3. Fetch RFIs from Procore API - Store as tasks
    console.log('[Procore Mock] GET https://api.procore.com/rest/v1.0/projects/{project_id}/rfis')
    let totalTasks = 0
    for (const proj of procoreProjects) {
      const procoreRFIs = generateMockRFIs(proj.id)
      const dbProjectId = projectMap.get(proj.id.toString())
      
      if (!dbProjectId) continue

      // Add RFIs as tasks
      for (const rfi of procoreRFIs) {
        const rfiDueDate = new Date(rfi.due_date)
        const rfiStartDate = new Date(rfiDueDate)
        rfiStartDate.setDate(rfiStartDate.getDate() - 7) // RFIs typically have a week window
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('planned_tasks')
          .upsert({
            project_id: dbProjectId,
            name: `[RFI-${rfi.number}] ${rfi.subject}`,
            description: `Procore RFI: ${rfi.subject}\nManager: ${rfi.rfi_manager.name}\nBall in Court: ${rfi.ball_in_court.name}`,
            status: rfi.status === 'Closed' ? 'completed' : 'pending',
            planned_start: rfiStartDate.toISOString().split('T')[0],
            planned_end: rfi.due_date,
            procore_rfi_id: rfi.id.toString(),
          }, { onConflict: 'procore_rfi_id', ignoreDuplicates: true })
        totalTasks++
      }

      // Add regular construction tasks (derived from manpower/schedule data)
      const mockTasks = generateMockTasks()
      for (const task of mockTasks) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('planned_tasks')
          .insert({
            project_id: dbProjectId,
            name: task.name,
            description: task.description,
            status: task.status,
            planned_start: task.planned_start,
            planned_end: task.planned_end,
          })
        totalTasks++
      }
    }

    // 4. Fetch Manpower Logs from Procore API - Store as daily summaries
    console.log('[Procore Mock] GET https://api.procore.com/rest/v1.0/projects/{project_id}/manpower_logs')
    for (const proj of procoreProjects) {
      const manpowerLogs = generateMockManpowerLogs(proj.id)
      const dbProjectId = projectMap.get(proj.id.toString())
      
      if (!dbProjectId) continue

      // Aggregate logs by date
      const dateAggregates: Record<string, { workers: number; hours: number; notes: string[] }> = {}
      
      for (const log of manpowerLogs) {
        if (!dateAggregates[log.date]) {
          dateAggregates[log.date] = { workers: 0, hours: 0, notes: [] }
        }
        dateAggregates[log.date].workers += log.num_workers
        dateAggregates[log.date].hours += log.num_hours
        dateAggregates[log.date].notes.push(`${log.vendor.name}: ${log.notes}`)
      }

      for (const [date, data] of Object.entries(dateAggregates)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('daily_summaries')
          .upsert({
            project_id: dbProjectId,
            date: date,
            total_labor_hours: data.hours,
            tasks_planned: Math.floor(data.workers * 1.5),
            tasks_completed: Math.floor(data.workers * 1.2),
            alignment_score: 75 + Math.floor(Math.random() * 20),
            efficiency_score: 80 + Math.floor(Math.random() * 15),
            safety_compliance_rate: 90 + Math.floor(Math.random() * 10),
            safety_incidents: Math.random() > 0.8 ? 1 : 0,
            notes: data.notes.slice(0, 3).join('\n'),
          }, { onConflict: 'project_id,date', ignoreDuplicates: true })
      }
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
        users: totalMembers,
        tasks: totalTasks,
        manpowerLogs: procoreProjects.length * 50
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  // Check if we have any projects with procore_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: projects } = await (supabase as any)
    .from('projects')
    .select('updated_at')
    .eq('organization_id', profile?.organization_id)
    .not('procore_id', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(1)

  if (projects && projects.length > 0) {
    return { connected: true, lastSync: projects[0].updated_at }
  }

  return { connected: false }
}
