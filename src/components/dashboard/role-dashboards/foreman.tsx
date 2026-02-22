'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Users,
  CheckCircle2,
  Clock,
  FolderKanban,
} from 'lucide-react'
import { staggerContainer, staggerItem } from '@/components/core/motion'
import type { DashboardData } from '@/types/dashboard'

interface Props {
  data: DashboardData
}

export function ForemanDashboard({ data }: Props) {
  const inProgressTasks = data.pendingTasks.filter(t => t.status === 'in_progress')
  
  return (
    <motion.div 
      className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Greeting */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome {data.firstName}: Foreman
        </h1>
        <p className="text-muted-foreground">
          Managing {data.projects.length} projects with {data.totalMembers} team members
        </p>
      </motion.div>

      {/* Daily Summary */}
      <motion.div variants={staggerItem} className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Daily Summary</h2>
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{data.completedTasks.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{inProgressTasks.length}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">{data.pendingTasks.length - inProgressTasks.length}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-card p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{data.projects.length}</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-card p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{data.totalMembers}</p>
              <p className="text-xs text-muted-foreground">Team Members</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Projects */}
      <motion.div variants={staggerItem} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Active Projects</h2>
          <Link href="/projects" className="text-sm text-primary">View all</Link>
        </div>

        <div className="space-y-2">
          {data.projects.length > 0 ? (
            data.projects.slice(0, 4).map((project) => {
              const taskCount = project.task_ids?.length || 0
              const projectTasks = data.allTasks.filter(t => project.task_ids?.includes(t.id))
              const completedCount = projectTasks.filter(t => t.status === 'completed').length
              return (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div className="flex items-center justify-between rounded-xl bg-card p-4 border border-border hover:border-primary/50 transition-colors">
                    <div>
                      <p className="font-medium text-foreground">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {completedCount}/{taskCount} tasks completed
                      </p>
                    </div>
                    <FolderKanban className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
              <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No active projects</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Completed Tasks */}
      <motion.div variants={staggerItem} className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Recently Completed</h2>
        
        <div className="space-y-2">
          {data.completedTasks.length > 0 ? (
            data.completedTasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <p className="font-medium text-foreground truncate">{task.name}</p>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
              <Clock className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No completed tasks yet</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
