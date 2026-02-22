import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ProjectCard } from '@/components/dashboard/project-card'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import {
  FolderKanban,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
} from 'lucide-react'

const mockActivities = [
  {
    id: '1',
    type: 'upload' as const,
    user: 'John Smith',
    project: 'Downtown Tower',
    description: 'uploaded 2 hours of bodycam footage',
    timestamp: '10 minutes ago',
  },
  {
    id: '2',
    type: 'task_complete' as const,
    user: 'Mike Johnson',
    project: 'Harbor Bridge',
    description: 'completed electrical conduit installation',
    timestamp: '25 minutes ago',
  },
  {
    id: '3',
    type: 'safety_alert' as const,
    user: 'System',
    project: 'Metro Station',
    description: 'detected missing hard hat violation',
    timestamp: '1 hour ago',
  },
  {
    id: '4',
    type: 'review' as const,
    user: 'Sarah Chen',
    project: 'Downtown Tower',
    description: 'reviewed and approved daily footage',
    timestamp: '2 hours ago',
  },
]

interface Project {
  id: string
  name: string
  location: string | null
  status: string
  planned_tasks?: { id: string; status: string }[]
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

  const typedProfile = profile as { full_name: string | null } | null
  const firstName = typedProfile?.full_name?.split(' ')[0] || 'there'

  // Fetch real project data with tasks
  const { data: projects } = await supabase
    .from('projects')
    .select('*, planned_tasks(id, status), project_members(id)')
    .order('created_at', { ascending: false })

  const typedProjects = (projects || []) as Project[]
  
  // Calculate real stats
  const activeProjects = typedProjects.filter(p => p.status === 'active' || p.status === 'planning')
  const allTasks = typedProjects.flatMap(p => p.planned_tasks || [])
  const completedTasks = allTasks.filter(t => t.status === 'completed')
  const pendingTasks = allTasks.filter(t => t.status === 'pending' || t.status === 'in_progress')
  const totalMembers = typedProjects.reduce((acc, p) => acc + (p.project_members?.length || 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
          Welcome back, {firstName}
        </h1>
        <p className="text-stone-600 dark:text-stone-400">
          Here&apos;s what&apos;s happening across your projects today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Projects"
          value={String(activeProjects.length)}
          description={`${typedProjects.length} total projects`}
          icon={<FolderKanban className="h-5 w-5" />}
        />
        <StatsCard
          title="Tasks Completed"
          value={String(completedTasks.length)}
          description={`of ${allTasks.length} total tasks`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatsCard
          title="Pending Tasks"
          value={String(pendingTasks.length)}
          description="awaiting completion"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatsCard
          title="Team Members"
          value={String(totalMembers)}
          description="across all projects"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-white">
              Active Projects
            </h2>
            <a
              href="/projects"
              className="text-sm font-medium text-amber-600 hover:text-amber-500"
            >
              View all →
            </a>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {activeProjects.slice(0, 4).map((project) => (
              <ProjectCard 
                key={project.id} 
                id={project.id}
                name={project.name}
                location={project.location || 'No location'}
                status={project.status}
                tasksCompleted={(project.planned_tasks || []).filter(t => t.status === 'completed').length}
                totalTasks={(project.planned_tasks || []).length}
              />
            ))}
          </div>
        </div>

        <div>
          <RecentActivity activities={mockActivities} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-white">{completedTasks.length}</p>
              <p className="text-sm text-stone-600 dark:text-stone-400">Tasks Completed</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-white">{totalMembers}</p>
              <p className="text-sm text-stone-600 dark:text-stone-400">Team Members</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-white">{allTasks.length}</p>
              <p className="text-sm text-stone-600 dark:text-stone-400">Total Tasks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
