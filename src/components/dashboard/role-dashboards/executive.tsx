'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Target,
  Users,
  FolderKanban,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { staggerContainer, staggerItem } from '@/components/core/motion'
import type { DashboardData } from '@/types/dashboard'

interface Props {
  data: DashboardData
}

export function ExecutiveDashboard({ data }: Props) {
  const completionRate = data.allTasks.length > 0 
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
          Welcome {data.firstName}: Executive
        </h1>
        <p className="text-muted-foreground">
          {data.activeProjects.length} active projects • {data.totalMembers} team members
        </p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={staggerItem} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <FolderKanban className="h-6 w-6 text-primary" />
          </div>
          <p className="text-4xl font-bold text-foreground">{data.activeProjects.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">Active Projects</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <Target className="h-6 w-6 text-success" />
          </div>
          <p className="text-4xl font-bold text-foreground">{completionRate}%</p>
          <p className="mt-1 text-sm text-muted-foreground">Task Completion</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-4xl font-bold text-foreground">{data.totalMembers}</p>
          <p className="mt-1 text-sm text-muted-foreground">Team Members</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-6 w-6 text-warning" />
          </div>
          <p className="text-4xl font-bold text-foreground">{data.pendingTasks.length}</p>
          <p className="mt-1 text-sm text-muted-foreground">Pending Tasks</p>
        </div>
      </motion.div>

      {/* Projects */}
      <motion.div variants={staggerItem} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Projects</h2>
          <Link href="/projects" className="text-sm text-primary">View all</Link>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-3 gap-4 border-b border-border bg-muted/30 px-6 py-3 text-sm font-medium text-muted-foreground">
            <span>Project</span>
            <span className="text-center">Tasks</span>
            <span className="text-center">Completion</span>
          </div>

          {data.activeProjects.length > 0 ? (
            data.activeProjects.slice(0, 5).map((project, index) => {
              const projectTasks = data.allTasks.filter(t => project.task_ids?.includes(t.id))
              const completed = projectTasks.filter(t => t.status === 'completed').length
              const total = project.task_ids?.length || 0
              const progress = total > 0 ? Math.round((completed / total) * 100) : 0

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/projects/${project.id}`}>
                    <div className="grid grid-cols-3 gap-4 items-center px-6 py-4 hover:bg-muted/30 transition-colors group">
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {project.name}
                      </span>
                      <div className="text-center text-muted-foreground">
                        {completed}/{total}
                      </div>
                      <div className="text-center">
                        <span className={`font-medium ${progress >= 80 ? 'text-success' : progress >= 50 ? 'text-warning' : 'text-muted-foreground'}`}>
                          {progress}%
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })
          ) : (
            <div className="px-6 py-8 text-center text-muted-foreground">
              No active projects
            </div>
          )}
        </div>
      </motion.div>

      {/* Task Summary */}
      <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <h3 className="font-semibold text-foreground">Completed</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{data.completedTasks.length}</p>
          <p className="text-sm text-muted-foreground mt-1">tasks completed</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-warning" />
            <h3 className="font-semibold text-foreground">Pending</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{data.pendingTasks.length}</p>
          <p className="text-sm text-muted-foreground mt-1">tasks in progress</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
