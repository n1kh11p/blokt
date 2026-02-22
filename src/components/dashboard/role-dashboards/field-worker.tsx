'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  CheckCircle2, 
  Clock, 
  Upload,
  FolderKanban,
} from 'lucide-react'
import { staggerContainer, staggerItem } from '@/components/core/motion'
import type { DashboardData } from '@/types/dashboard'

interface Props {
  data: DashboardData
}

export function FieldWorkerDashboard({ data }: Props) {
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
          Welcome {data.firstName}: Field Worker
        </h1>
        <p className="text-muted-foreground">
          {data.pendingTasks.length} pending tasks across {data.projects.length} projects
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-card p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{data.pendingTasks.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-card p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{data.completedTasks.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={staggerItem} className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/upload">
            <motion.div 
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center gap-2 rounded-xl bg-primary p-4 text-center"
            >
              <Upload className="h-6 w-6 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">Upload Video</span>
            </motion.div>
          </Link>
          <Link href="/projects">
            <motion.div 
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center gap-2 rounded-xl bg-card border border-border p-4 text-center"
            >
              <FolderKanban className="h-6 w-6 text-foreground" />
              <span className="text-sm font-medium text-foreground">View Projects</span>
            </motion.div>
          </Link>
        </div>
      </motion.div>

      {/* Projects List */}
      <motion.div variants={staggerItem} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Your Projects</h2>
          <Link href="/projects" className="text-sm text-primary">View all</Link>
        </div>
        
        <div className="space-y-2">
          {data.projects.length > 0 ? (
            data.projects.slice(0, 5).map((project) => {
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
            <div className="rounded-xl bg-card p-8 border border-border text-center">
              <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="font-medium text-foreground">No projects assigned</p>
              <p className="text-sm text-muted-foreground">Check back later for assignments</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
