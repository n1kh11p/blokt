'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FolderKanban,
  Users,
  ArrowRight,
  Target,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { staggerContainer, staggerItem } from '@/components/core/motion'

interface DashboardData {
  firstName: string
  projects: Array<{
    id: string
    name: string
    location: string | null
    status: string
    planned_tasks?: Array<{ id: string; status: string; name: string }>
    project_members?: Array<{ id: string }>
  }>
  activeProjects: Array<{
    id: string
    name: string
    location: string | null
    status: string
    planned_tasks?: Array<{ id: string; status: string; name: string }>
  }>
  allTasks: Array<{ id: string; status: string; name: string }>
  completedTasks: Array<{ id: string; status: string; name: string }>
  pendingTasks: Array<{ id: string; status: string; name: string }>
  totalMembers: number
}

interface Props {
  data: DashboardData
}

export function PMDashboard({ data }: Props) {
  const alignmentScore = data.allTasks.length > 0 
    ? Math.round((data.completedTasks.length / data.allTasks.length) * 100) 
    : 0

  return (
    <motion.div 
      className="space-y-8"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {data.firstName}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s your workspace overview
        </p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Active Projects</span>
            <FolderKanban className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">{data.activeProjects.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Completion Rate</span>
            <Target className="h-5 w-5 text-success" />
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">{alignmentScore}%</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pending Tasks</span>
            <Clock className="h-5 w-5 text-warning" />
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">{data.pendingTasks.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Team Members</span>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">{data.totalMembers}</p>
        </div>
      </motion.div>

      {/* Projects Grid */}
      <motion.div variants={staggerItem} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Active Projects</h2>
          <Link href="/projects" className="flex items-center gap-1 text-sm text-primary hover:underline">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.activeProjects.slice(0, 6).map((project, index) => {
            const completed = project.planned_tasks?.filter(t => t.status === 'completed').length || 0
            const total = project.planned_tasks?.length || 0
            const progress = total > 0 ? (completed / total) * 100 : 0

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/projects/${project.id}`}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="group relative rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-lg hover:shadow-primary/5"
                  >
                    {/* Progress bar */}
                    <div className="absolute left-0 right-0 top-0 h-1 overflow-hidden rounded-t-xl bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-full bg-primary"
                      />
                    </div>

                    <div className="pt-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      {project.location && (
                        <p className="mt-1 text-sm text-muted-foreground truncate">
                          {project.location}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {completed}/{total} tasks
                        </span>
                        <span className="font-medium text-foreground">
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            )
          })}
        </div>

        {data.activeProjects.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
            <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="font-medium text-foreground">No active projects</p>
            <p className="text-sm text-muted-foreground">Create a new project to get started</p>
          </div>
        )}
      </motion.div>

      {/* Task Summary */}
      <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <h3 className="font-semibold text-foreground">Task Overview</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed</span>
              <span className="text-sm font-medium text-success">{data.completedTasks.length}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${alignmentScore}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-success rounded-full"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">In Progress</span>
              <span className="text-sm font-medium text-primary">
                {data.pendingTasks.filter(t => t.status === 'in_progress').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending</span>
              <span className="text-sm font-medium text-warning">
                {data.pendingTasks.filter(t => t.status === 'pending').length}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-warning" />
            <h3 className="font-semibold text-foreground">All Tasks</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{data.allTasks.length}</p>
          <p className="text-sm text-muted-foreground mt-1">total tasks across projects</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
