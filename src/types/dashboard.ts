import type { Project, Task } from '@/types'

export interface DashboardData {
  firstName: string
  projects: Project[]
  activeProjects: Project[]
  allTasks: Task[]
  completedTasks: Task[]
  pendingTasks: Task[]
  totalMembers: number
}
