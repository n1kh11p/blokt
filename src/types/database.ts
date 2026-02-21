export type UserRole = 'project_manager' | 'foreman' | 'field_worker' | 'safety_manager' | 'executive'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: UserRole
          organization_id: string | null
          trade: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: UserRole
          organization_id?: string | null
          trade?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: UserRole
          organization_id?: string | null
          trade?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          type: string | null
          procore_company_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type?: string | null
          procore_company_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string | null
          procore_company_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          location: string | null
          description: string | null
          status: 'active' | 'completed' | 'on_hold' | 'cancelled'
          organization_id: string
          procore_project_id: string | null
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          description?: string | null
          status?: 'active' | 'completed' | 'on_hold' | 'cancelled'
          organization_id: string
          procore_project_id?: string | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          description?: string | null
          status?: 'active' | 'completed' | 'on_hold' | 'cancelled'
          organization_id?: string
          procore_project_id?: string | null
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: UserRole
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role: UserRole
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: UserRole
          created_at?: string
        }
      }
      planned_tasks: {
        Row: {
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
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          planned_start: string
          planned_end: string
          location_context?: string | null
          trade?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'delayed'
          procore_task_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string | null
          planned_start?: string
          planned_end?: string
          location_context?: string | null
          trade?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'delayed'
          procore_task_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      observed_events: {
        Row: {
          id: string
          project_id: string
          worker_id: string
          task_id: string | null
          start_time: string
          end_time: string | null
          duration_seconds: number | null
          confidence_score: number | null
          safety_flags: string[] | null
          source: 'video_ai' | 'manual' | 'verbal'
          video_upload_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          worker_id: string
          task_id?: string | null
          start_time: string
          end_time?: string | null
          duration_seconds?: number | null
          confidence_score?: number | null
          safety_flags?: string[] | null
          source?: 'video_ai' | 'manual' | 'verbal'
          video_upload_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          worker_id?: string
          task_id?: string | null
          start_time?: string
          end_time?: string | null
          duration_seconds?: number | null
          confidence_score?: number | null
          safety_flags?: string[] | null
          source?: 'video_ai' | 'manual' | 'verbal'
          video_upload_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      video_uploads: {
        Row: {
          id: string
          project_id: string
          worker_id: string
          file_path: string
          file_name: string
          file_size: number
          duration_seconds: number | null
          upload_date: string
          recording_date: string | null
          processing_status: 'pending' | 'processing' | 'completed' | 'failed'
          tagged_tasks: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          worker_id: string
          file_path: string
          file_name: string
          file_size: number
          duration_seconds?: number | null
          upload_date?: string
          recording_date?: string | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          tagged_tasks?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          worker_id?: string
          file_path?: string
          file_name?: string
          file_size?: number
          duration_seconds?: number | null
          upload_date?: string
          recording_date?: string | null
          processing_status?: 'pending' | 'processing' | 'completed' | 'failed'
          tagged_tasks?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      safety_alerts: {
        Row: {
          id: string
          project_id: string
          worker_id: string | null
          video_upload_id: string | null
          violation_type: string
          description: string | null
          severity: 'low' | 'medium' | 'high' | 'critical'
          confidence_score: number | null
          timestamp: string
          acknowledged: boolean
          acknowledged_by: string | null
          acknowledged_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          worker_id?: string | null
          video_upload_id?: string | null
          violation_type: string
          description?: string | null
          severity?: 'low' | 'medium' | 'high' | 'critical'
          confidence_score?: number | null
          timestamp?: string
          acknowledged?: boolean
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          worker_id?: string | null
          video_upload_id?: string | null
          violation_type?: string
          description?: string | null
          severity?: 'low' | 'medium' | 'high' | 'critical'
          confidence_score?: number | null
          timestamp?: string
          acknowledged?: boolean
          acknowledged_by?: string | null
          acknowledged_at?: string | null
          created_at?: string
        }
      }
      daily_summaries: {
        Row: {
          id: string
          project_id: string
          date: string
          alignment_score: number | null
          efficiency_score: number | null
          safety_compliance_rate: number | null
          tasks_planned: number
          tasks_completed: number
          total_labor_hours: number | null
          safety_incidents: number
          weather_impact: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          date: string
          alignment_score?: number | null
          efficiency_score?: number | null
          safety_compliance_rate?: number | null
          tasks_planned?: number
          tasks_completed?: number
          total_labor_hours?: number | null
          safety_incidents?: number
          weather_impact?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          date?: string
          alignment_score?: number | null
          efficiency_score?: number | null
          safety_compliance_rate?: number | null
          tasks_planned?: number
          tasks_completed?: number
          total_labor_hours?: number | null
          safety_incidents?: number
          weather_impact?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      project_status: 'active' | 'completed' | 'on_hold' | 'cancelled'
      task_status: 'pending' | 'in_progress' | 'completed' | 'delayed'
      event_source: 'video_ai' | 'manual' | 'verbal'
      processing_status: 'pending' | 'processing' | 'completed' | 'failed'
      severity_level: 'low' | 'medium' | 'high' | 'critical'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type Organization = Tables<'organizations'>
export type Project = Tables<'projects'>
export type ProjectMember = Tables<'project_members'>
export type PlannedTask = Tables<'planned_tasks'>
export type ObservedEvent = Tables<'observed_events'>
export type VideoUpload = Tables<'video_uploads'>
export type SafetyAlert = Tables<'safety_alerts'>
export type DailySummary = Tables<'daily_summaries'>
