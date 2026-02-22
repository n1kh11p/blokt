import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  FieldWorkerShell,
  ForemanShell,
  PMShell,
  SafetyShell,
  ExecutiveShell
} from '@/components/shells'
import type { User, UserRole } from '@/types/database'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: userRecord } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .order('created_at', { ascending: false })
    .limit(10)

  const typedProfile = userRecord as User | null
  const role: UserRole = typedProfile?.role || 'field_worker'
  const userName = typedProfile?.name || undefined
  const userAvatar = undefined // Avatar removed from schema

  const projectsList = (projects as { id: string; name: string }[] || []).map(p => ({ id: p.id, name: p.name }))

  switch (role) {
    case 'field_worker':
      return (
        <FieldWorkerShell userName={userName}>
          {children}
        </FieldWorkerShell>
      )

    case 'foreman':
      return (
        <ForemanShell
          userName={userName}
          userAvatar={userAvatar}
          crewCount={8}
        >
          {children}
        </ForemanShell>
      )

    case 'project_manager':
      return (
        <PMShell
          userName={userName}
          userAvatar={userAvatar}
          projects={projectsList}
        >
          {children}
        </PMShell>
      )

    case 'safety_manager':
      return (
        <SafetyShell
          userName={userName}
          userAvatar={userAvatar}
          alertCounts={{ critical: 0, high: 2, medium: 5, low: 3 }}
        >
          {children}
        </SafetyShell>
      )

    case 'executive':
      return (
        <ExecutiveShell userName={userName} userAvatar={userAvatar}>
          {children}
        </ExecutiveShell>
      )

    default:
      return (
        <PMShell
          userName={userName}
          userAvatar={userAvatar}
          projects={projectsList}
        >
          {children}
        </PMShell>
      )
  }
}
