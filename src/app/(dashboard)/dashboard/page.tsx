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

const mockProjects = [
  {
    id: '1',
    name: 'Downtown Tower',
    location: 'Chicago, IL',
    status: 'active',
    alignmentScore: 87,
    tasksCompleted: 45,
    totalTasks: 52,
    safetyAlerts: 2,
  },
  {
    id: '2',
    name: 'Harbor Bridge Expansion',
    location: 'Seattle, WA',
    status: 'active',
    alignmentScore: 92,
    tasksCompleted: 28,
    totalTasks: 35,
    safetyAlerts: 0,
  },
  {
    id: '3',
    name: 'Metro Station Renovation',
    location: 'Boston, MA',
    status: 'active',
    alignmentScore: 74,
    tasksCompleted: 12,
    totalTasks: 24,
    safetyAlerts: 5,
  },
]

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
          value="8"
          description="2 starting this week"
          icon={<FolderKanban className="h-5 w-5" />}
        />
        <StatsCard
          title="Today's Alignment"
          value="84%"
          trend={{ value: 3, isPositive: true }}
          description="vs yesterday"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatsCard
          title="Safety Alerts"
          value="7"
          trend={{ value: 12, isPositive: false }}
          description="this week"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <StatsCard
          title="Pending Reviews"
          value="12"
          description="4 urgent"
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
            {mockProjects.map((project) => (
              <ProjectCard key={project.id} {...project} />
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
              <p className="text-2xl font-bold text-stone-900 dark:text-white">156</p>
              <p className="text-sm text-stone-600 dark:text-stone-400">Tasks Completed Today</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-white">48</p>
              <p className="text-sm text-stone-600 dark:text-stone-400">Workers Active Today</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/30">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-white">12.4h</p>
              <p className="text-sm text-stone-600 dark:text-stone-400">Avg. Footage Uploaded</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
