import { createClient } from '@/lib/supabase/server'
import { FieldWorkerDashboard } from '@/components/dashboard/role-dashboards/field-worker'
import { ForemanDashboard } from '@/components/dashboard/role-dashboards/foreman'
import { PMDashboard } from '@/components/dashboard/role-dashboards/pm'
import { SafetyDashboard } from '@/components/dashboard/role-dashboards/safety'
import { ExecutiveDashboard } from '@/components/dashboard/role-dashboards/executive'
import type { Profile, UserRole } from '@/types/database'

interface Project {
  id: string
  name: string
  location: string | null
  status: string
  planned_tasks?: { id: string; status: string; name: string }[]
  project_members?: { id: string }[]
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id || '')
    .single()

  const typedProfile = profile as Profile | null
  const role: UserRole = typedProfile?.role || 'field_worker'
  const firstName = typedProfile?.full_name?.split(' ')[0] || 'there'

  const { data: projects } = await supabase
    .from('projects')
    .select('*, planned_tasks(id, status, name), project_members(id)')
    .order('created_at', { ascending: false })

  const typedProjects = (projects || []) as Project[]
  
  const activeProjects = typedProjects.filter(p => p.status === 'active' || p.status === 'planning')
  const allTasks = typedProjects.flatMap(p => p.planned_tasks || [])
  const completedTasks = allTasks.filter(t => t.status === 'completed')
  const pendingTasks = allTasks.filter(t => t.status === 'pending' || t.status === 'in_progress')
  const totalMembers = typedProjects.reduce((acc, p) => acc + (p.project_members?.length || 0), 0)

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
