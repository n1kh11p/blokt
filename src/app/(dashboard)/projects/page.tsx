import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, FolderOpen } from 'lucide-react'
import { getProjects } from '@/lib/actions/projects'
import { getProfile } from '@/lib/actions/profile'
import { CreateProjectDialog } from '@/components/projects/create-project-dialog'
import { SetupOrgPrompt } from '@/components/projects/setup-org-prompt'
import { ProjectFilters } from '@/components/projects/project-filters'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  on_hold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

interface ProjectsPageProps {
  searchParams: Promise<{ search?: string; status?: string }>
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams
  const { data: profile } = await getProfile()
  const { data: projects, error } = await getProjects()

  // Filter projects based on search params
  const filteredProjects = projects?.filter((project) => {
    const matchesSearch = !params.search || 
      project.name.toLowerCase().includes(params.search.toLowerCase()) ||
      project.location?.toLowerCase().includes(params.search.toLowerCase()) ||
      project.description?.toLowerCase().includes(params.search.toLowerCase())
    
    const matchesStatus = !params.status || params.status === 'all' || project.status === params.status
    
    return matchesSearch && matchesStatus
  })

  if (!profile?.organization_id) {
    return <SetupOrgPrompt />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Projects</h1>
          <p className="text-stone-600 dark:text-stone-400">
            Manage and monitor all your construction projects
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      <ProjectFilters />

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {filteredProjects && filteredProjects.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-stone-400" />
            <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">
              No projects yet
            </h3>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              Create your first project to get started
            </p>
            <div className="mt-4">
              <CreateProjectDialog />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredProjects?.map((project) => {
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
                        {project.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {project.location}
                          </div>
                        )}
                        {project.start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Started {new Date(project.start_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {project.description && (
                        <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2">
                          {project.description}
                        </p>
                      )}
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
