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
import { EditProjectDialog } from '@/components/projects/edit-project-dialog'
import { TaskDialog } from '@/components/projects/task-dialog'
import { AddMemberDialog, EditMemberDialog } from '@/components/projects/member-dialog'

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

  if (error || !project) {
    notFound()
  }

  const statusLabel = project.status.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
  const taskCount = project.planned_tasks?.length || 0
  const completedTasks = project.planned_tasks?.filter((t: { status: string }) => t.status === 'completed').length || 0
  const memberCount = project.project_members?.length || 0
  const alertCount = project.safety_alerts?.length || 0
  const videoCount = project.video_uploads?.length || 0

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
            <Badge className={statusColors[project.status]}>
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
            {project.start_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Started {new Date(project.start_date).toLocaleDateString()}
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
                  {project.planned_tasks?.map((task: {
                    id: string
                    name: string
                    description: string | null
                    status: string
                    planned_start: string
                    planned_end: string
                    trade: string | null
                    assigned_to: string | null
                    assigned_profile?: { full_name: string | null; email: string } | null
                  }) => (
                    <TaskDialog key={task.id} projectId={project.id} task={task} mode="edit">
                      <div className="flex cursor-pointer items-center justify-between rounded-lg border border-stone-200 p-4 transition-colors hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900">
                        <div>
                          <p className="font-medium text-stone-900 dark:text-white">
                            {task.name}
                          </p>
                          <p className="text-sm text-stone-500">
                            {new Date(task.planned_start).toLocaleDateString()} - {new Date(task.planned_end).toLocaleDateString()}
                            {task.trade && ` • ${task.trade}`}
                            {task.assigned_profile && ` • ${task.assigned_profile.full_name || task.assigned_profile.email}`}
                          </p>
                        </div>
                        <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                          {task.status}
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
                  {project.project_members?.map((member: {
                    id: string
                    role: string
                    profiles: {
                      full_name: string | null
                      email: string
                      role: string
                    }
                  }) => (
                    <EditMemberDialog key={member.id} projectId={project.id} member={member}>
                      <div className="flex cursor-pointer items-center justify-between rounded-lg border border-stone-200 p-4 transition-colors hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-900">
                        <div>
                          <p className="font-medium text-stone-900 dark:text-white">
                            {member.profiles?.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-stone-500">
                            {member.profiles?.email}
                          </p>
                        </div>
                        <Badge variant="secondary">{member.role.replace('_', ' ')}</Badge>
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
                  <Link href="/upload" className="mt-4">
                    <Button className="bg-amber-500 hover:bg-amber-600">
                      Upload Video
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {project.video_uploads?.map((video: {
                    id: string
                    file_name: string
                    processing_status: string
                    created_at: string
                  }) => (
                    <div
                      key={video.id}
                      className="rounded-lg border border-stone-200 p-4 dark:border-stone-800"
                    >
                      <p className="font-medium text-stone-900 dark:text-white">
                        {video.file_name}
                      </p>
                      <p className="text-sm text-stone-500">
                        Uploaded {new Date(video.created_at).toLocaleDateString()}
                      </p>
                      <Badge className="mt-2" variant="secondary">
                        {video.processing_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety">
          <Card>
            <CardHeader>
              <CardTitle>Safety Alerts</CardTitle>
              <CardDescription>OSHA compliance violations detected</CardDescription>
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
                  {project.safety_alerts?.map((alert: {
                    id: string
                    violation_type: string
                    severity: string
                    description: string
                    timestamp: string
                  }) => (
                    <div
                      key={alert.id}
                      className="rounded-lg border border-stone-200 p-4 dark:border-stone-800"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-stone-900 dark:text-white">
                            {alert.violation_type}
                          </p>
                          <p className="text-sm text-stone-500">
                            {alert.description}
                          </p>
                          <p className="mt-1 text-xs text-stone-400">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge
                          className={
                            alert.severity === 'critical'
                              ? 'bg-red-100 text-red-700'
                              : alert.severity === 'high'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>
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
