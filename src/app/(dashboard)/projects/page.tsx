import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Search, MapPin, Calendar, Users, MoreVertical } from 'lucide-react'

const mockProjects = [
  {
    id: '1',
    name: 'Downtown Tower',
    location: 'Chicago, IL',
    status: 'active',
    startDate: '2025-01-15',
    teamSize: 24,
    tasksCompleted: 45,
    totalTasks: 52,
  },
  {
    id: '2',
    name: 'Harbor Bridge Expansion',
    location: 'Seattle, WA',
    status: 'active',
    startDate: '2025-02-01',
    teamSize: 18,
    tasksCompleted: 28,
    totalTasks: 35,
  },
  {
    id: '3',
    name: 'Metro Station Renovation',
    location: 'Boston, MA',
    status: 'active',
    startDate: '2024-11-20',
    teamSize: 32,
    tasksCompleted: 12,
    totalTasks: 24,
  },
  {
    id: '4',
    name: 'Airport Terminal C',
    location: 'Denver, CO',
    status: 'on_hold',
    startDate: '2024-09-01',
    teamSize: 45,
    tasksCompleted: 89,
    totalTasks: 120,
  },
  {
    id: '5',
    name: 'Riverfront Condos',
    location: 'Austin, TX',
    status: 'completed',
    startDate: '2024-03-15',
    teamSize: 15,
    tasksCompleted: 48,
    totalTasks: 48,
  },
]

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  on_hold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default async function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Projects</h1>
          <p className="text-stone-600 dark:text-stone-400">
            Manage and monitor all your construction projects
          </p>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-600">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Search projects..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">All</Button>
          <Button variant="ghost" size="sm">Active</Button>
          <Button variant="ghost" size="sm">On Hold</Button>
          <Button variant="ghost" size="sm">Completed</Button>
        </div>
      </div>

      <div className="grid gap-4">
        {mockProjects.map((project) => {
          const progress = (project.tasksCompleted / project.totalTasks) * 100
          const statusLabel = project.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())

          return (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="transition-all hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-stone-900 dark:text-white">
                          {project.name}
                        </h3>
                        <Badge className={statusColors[project.status]}>
                          {statusLabel}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {project.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Started {new Date(project.startDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {project.teamSize} team members
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-stone-900 dark:text-white">
                          {Math.round(progress)}%
                        </p>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          {project.tasksCompleted}/{project.totalTasks} tasks
                        </p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
