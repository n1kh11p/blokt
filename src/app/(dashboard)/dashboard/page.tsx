import { createClient } from '@/lib/supabase/server'
import { FieldWorkerDashboard } from '@/components/dashboard/role-dashboards/field-worker'
import { ForemanDashboard } from '@/components/dashboard/role-dashboards/foreman'
import { PMDashboard } from '@/components/dashboard/role-dashboards/pm'
import { SafetyDashboard } from '@/components/dashboard/role-dashboards/safety'
import { ExecutiveDashboard } from '@/components/dashboard/role-dashboards/executive'
import type { User, UserRole } from '@/types/database'

interface Project {
  id: string
  name: string
  location: string | null
  status: string
  task_ids?: string[]
  user_ids?: string[]
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: userRecord } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', user?.id || '')
    .single()

  const typedProfile = userRecord as User | null
  const role: UserRole = typedProfile?.role || 'field_worker'
  const firstName = typedProfile?.name?.split(' ')[0] || 'there'

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  const typedProjects = (projects || []) as Project[]

  const activeProjects = typedProjects.filter(p => p.status === 'active' || p.status === 'on_hold')

  // Since we don't have joined planned_tasks anymore, we need to handle it or skip it for now.
  // The schema changed so tasks is a separate table, but dashboard only needs counts.
  // We'll stub these out for now or fetch tasks independently if needed.
  const allTasks: any[] = []
  const completedTasks: any[] = []
  const pendingTasks: any[] = []
  const totalMembers = typedProjects.reduce((acc, p) => acc + (p.user_ids?.length || 0), 0)

  const dashboardData = {
    firstName,
    projects: typedProjects,
    activeProjects,
    allTasks,
    completedTasks,
    pendingTasks,
    totalMembers,
  }

  switch (role) {
    case 'field_worker':
      return <FieldWorkerDashboard data={dashboardData} />
    case 'foreman':
      return <ForemanDashboard data={dashboardData} />
    case 'project_manager':
      return <PMDashboard data={dashboardData} />
    case 'safety_manager':
      return <SafetyDashboard data={dashboardData} />
    case 'executive':
      return <ExecutiveDashboard data={dashboardData} />
    default:
      return <PMDashboard data={dashboardData} />
  }
}
