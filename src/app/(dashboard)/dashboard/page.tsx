import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FieldWorkerDashboard } from '@/components/dashboard/role-dashboards/field-worker'
import { ForemanDashboard } from '@/components/dashboard/role-dashboards/foreman'
import { PMDashboard } from '@/components/dashboard/role-dashboards/pm'
import { SafetyDashboard } from '@/components/dashboard/role-dashboards/safety'
import { ExecutiveDashboard } from '@/components/dashboard/role-dashboards/executive'
import { getDashboardData } from '@/lib/actions/dashboard'
import type { User, UserRole } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user role
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: userRecord } = await (supabase as any)
    .from('users')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const typedProfile = userRecord as User | null
  console.log('[Dashboard] User record from DB:', userRecord)
  console.log('[Dashboard] Typed profile:', typedProfile)
  console.log('[Dashboard] Role from profile:', typedProfile?.role)
  
  const role: UserRole = typedProfile?.role || 'field_worker'

  // Fetch dashboard data using clean API endpoint
  const { data: dashboardData, error } = await getDashboardData()

  if (error || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Unable to load dashboard</h2>
          <p className="text-muted-foreground mt-2">{error || 'Unknown error'}</p>
        </div>
      </div>
    )
  }

  console.log('[Dashboard] Final role being used:', role)

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
