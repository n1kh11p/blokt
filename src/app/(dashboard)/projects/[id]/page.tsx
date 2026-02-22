import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Video
} from 'lucide-react'
import { getProject } from '@/lib/actions/projects'
import { getSafetyEntries } from '@/lib/actions/safety'
import { EditProjectDialog } from '@/components/projects/edit-project-dialog'
import { TaskDialog } from '@/components/projects/task-dialog'
import { AddMemberDialog, EditMemberDialog } from '@/components/projects/member-dialog'
import { SafetyAlertCard } from '@/components/safety/alert-card'
import { CreateSafetyAlertDialog } from '@/components/safety/create-alert-dialog'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  on_hold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const { data: project, error } = await getProject(id)
  const { data: safetyAlerts } = await getSafetyEntries(id)

  if (error || !project) {
    notFound()
  }

  const statusLabel = (project.status || 'pending').replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
  const taskCount = project.tasks?.length || 0
  const completedTasks = project.tasks?.filter((t: { status: string | null }) => t.status === 'completed').length || 0
  const memberCount = project.users?.length || 0
  const alertCount = safetyAlerts?.length || 0
  const videoCount = 0 // Videos temporarily unsupported in new schema

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
              {project.name}
            </h1>
            <Badge className={statusColors[project.status || 'pending']}>
              {statusLabel}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
            {project.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {project.location}
              </div>
            )}
            {project.date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Started {new Date(project.date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
        <EditProjectDialog project={project}>
          <Button className="bg-amber-500 hover:bg-amber-600">
            Edit Project
          </Button>
        </EditProjectDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900 dark:text-white">
                  {completedTasks}/{taskCount}
                </p>
                <p className="text-sm text-stone-500">Tasks Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900 dark:text-white">
                  {memberCount}
                </p>
                <p className="text-sm text-stone-500">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Video className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900 dark:text-white">
                  {videoCount}
                </p>
                <p className="text-sm text-stone-500">Video Uploads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900 dark:text-white">
                  {alertCount}
                </p>
                <p className="text-sm text-stone-500">Safety Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {project.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-stone-600 dark:text-stone-400">{project.description}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Planned Tasks</CardTitle>
                <CardDescription>Tasks from your lookahead schedule</CardDescription>
              </div>
              <TaskDialog projectId={project.id} mode="create">
                <Button className="bg-amber-500 hover:bg-amber-600">
                  Add Task
                </Button>
              </TaskDialog>
            </CardHeader>
            <CardContent>
              {taskCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="h-12 w-12 text-stone-400" />
                  <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">
                    No tasks yet
                  </h3>
                  <p className="mt-2 text-sm text-stone-500">
                    Add tasks manually or sync from Procore
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {project.tasks?.map((task: {
                    id: string
                    name: string
                    description: string | null
                    status: string | null
                    start: string | null
                    end: string | null
                    trade: string | null
                    assignees: string[] | null
                  }) => (
                    <TaskDialog key={task.id} projectId={project.id} task={task as any} mode="edit">
                      <div className="flex cursor-pointer items-center justify-between rounded-lg border border-stone-200 p-4 transition-colors hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900">
                        <div>
                          <p className="font-medium text-stone-900 dark:text-white">
                            {task.name}
                          </p>
                          <p className="text-sm text-stone-500">
                            {task.start && new Date(task.start).toLocaleDateString()} {task.end && `- ${new Date(task.end).toLocaleDateString()}`}
                            {task.trade && ` • ${task.trade}`}
                          </p>
                        </div>
                        <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                          {task.status || 'pending'}
                        </Badge>
                      </div>
                    </TaskDialog>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>People assigned to this project</CardDescription>
              </div>
              <AddMemberDialog projectId={project.id}>
                <Button className="bg-amber-500 hover:bg-amber-600">
                  Add Member
                </Button>
              </AddMemberDialog>
            </CardHeader>
            <CardContent>
              {memberCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-12 w-12 text-stone-400" />
                  <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">
                    No team members
                  </h3>
                  <p className="mt-2 text-sm text-stone-500">
                    Add team members to this project
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {project.users?.map((member: {
                    user_id: string
                    role: string | null
                    name: string | null
                    email: string | null
                  }) => (
                    <EditMemberDialog key={member.user_id} projectId={project.id} member={member as any}>
                      <div className="flex cursor-pointer items-center justify-between rounded-lg border border-stone-200 p-4 transition-colors hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900">
                        <div>
                          <p className="font-medium text-stone-900 dark:text-white">
                            {member.name || 'Unknown'}
                          </p>
                          <p className="text-sm text-stone-500">
                            {member.email}
                          </p>
                        </div>
                        <Badge variant="secondary">{member.role?.replace('_', ' ')}</Badge>
                      </div>
                    </EditMemberDialog>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>Video Uploads</CardTitle>
              <CardDescription>Bodycam footage from this project</CardDescription>
            </CardHeader>
            <CardContent>
              {videoCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Video className="h-12 w-12 text-stone-400" />
                  <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">
                    No videos uploaded
                  </h3>
                  <p className="mt-2 text-sm text-stone-500">
                    Upload bodycam footage to get started
                  </p>
                  <Link href="/videos" className="mt-4">
                    <Button className="bg-amber-500 hover:bg-amber-600">
                      Upload Video
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <p className="text-sm text-stone-500">Video uploads not yet migrated to new API.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Safety Alerts</CardTitle>
                <CardDescription>OSHA compliance violations detected</CardDescription>
              </div>
              <CreateSafetyAlertDialog />
            </CardHeader>
            <CardContent>
              {alertCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                  <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">
                    No safety alerts
                  </h3>
                  <p className="mt-2 text-sm text-stone-500">
                    Great job! No safety violations have been detected
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {safetyAlerts?.map((alert: any) => (
                    <SafetyAlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
