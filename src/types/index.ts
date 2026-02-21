export * from './database'

export interface User {
  id: string
  email: string
  fullName: string | null
  role: import('./database').UserRole
  organizationId: string | null
  avatarUrl: string | null
}

export interface DashboardStats {
  activeProjects: number
  todayAlignmentScore: number
  safetyAlerts: number
  pendingUploads: number
}

export interface ProjectSummary {
  id: string
  name: string
  location: string | null
  status: string
  alignmentScore: number | null
  tasksCompleted: number
  totalTasks: number
  safetyAlerts: number
}

export interface TaskWithProgress {
  id: string
  project_id: string
  name: string
  description: string | null
  planned_start: string
  planned_end: string
  location_context: string | null
  trade: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  procore_task_id: string | null
  created_at: string
  updated_at: string
  observedEvents?: import('./database').ObservedEvent[]
  progress: number
}

export interface UploadFormData {
  projectId: string
  recordingDate: string
  taggedTasks: string[]
  file: File
}

export interface VideoTimelineMarker {
  id: string
  timestamp: number
  type: 'task_start' | 'task_end' | 'safety_alert'
  label: string
  color: string
}

export interface AnalyticsDateRange {
  start: Date
  end: Date
}

export interface AlignmentMetrics {
  date: string
  planned: number
  completed: number
  score: number
}

export interface SafetyMetrics {
  date: string
  violations: number
  complianceRate: number
}
