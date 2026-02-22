'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Shield,
  Users,
  FolderKanban,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { staggerContainer, staggerItem } from '@/components/core/motion'

interface DashboardData {
  firstName: string
  projects: Array<{
    id: string
    name: string
  }>
  allTasks: Array<{ id: string; status: string; name: string }>
  completedTasks: Array<{ id: string; status: string; name: string }>
  pendingTasks: Array<{ id: string; status: string; name: string }>
  totalMembers: number
}

interface Props {
  data: DashboardData
}

export function SafetyDashboard({ data }: Props) {
  const completionRate = data.allTasks.length > 0 
    ? Math.round((data.completedTasks.length / data.allTasks.length) * 100) 
    : 0

  return (
    <motion.div 
      className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold text-foreground">Safety Dashboard</h1>
        <p className="text-muted-foreground">Overview of projects and team</p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={staggerItem} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Projects</span>
            <FolderKanban className="h-5 w-5 text-primary" />
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">{data.projects.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Active projects</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Team Members</span>
            <Users className="h-5 w-5 text-success" />
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">{data.totalMembers}</p>
          <p className="mt-1 text-xs text-muted-foreground">Across all projects</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Completed Tasks</span>
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">{data.completedTasks.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">{completionRate}% completion rate</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pending Tasks</span>
            <Clock className="h-5 w-5 text-warning" />
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">{data.pendingTasks.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Awaiting completion</p>
        </div>
      </motion.div>

      {/* Projects List */}
      <motion.div variants={staggerItem} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Projects</h2>
          <Link href="/projects" className="text-sm text-primary">View all</Link>
        </div>

        <div className="space-y-2">
          {data.projects.length > 0 ? (
            data.projects.slice(0, 5).map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="flex items-center justify-between rounded-xl bg-card p-4 border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-medium text-foreground">{project.name}</p>
                  </div>
                  <FolderKanban className="h-5 w-5 text-muted-foreground" />
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
              <FolderKanban className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="font-medium text-foreground">No projects</p>
              <p className="text-sm text-muted-foreground">No projects to monitor</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
