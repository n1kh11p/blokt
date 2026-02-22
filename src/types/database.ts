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
      users: {
        Row: {
          user_id: string
          role: UserRole | null
          name: string | null
          trade: string | null
          phone: string | null
          email: string | null
          organization_id: string | null
          project_ids: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          user_id?: string
          role?: UserRole | null
          name?: string | null
          trade?: string | null
          phone?: string | null
          email?: string | null
          organization_id?: string | null
          project_ids?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          user_id?: string
          role?: UserRole | null
          name?: string | null
          trade?: string | null
          phone?: string | null
          email?: string | null
          organization_id?: string | null
          project_ids?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      organizations: {
        Row: {
          id: string
          organization_id: string | null
          user_ids: string[] | null
          project_ids: string[] | null
          procore_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id?: string | null
          user_ids?: string[] | null
          project_ids?: string[] | null
          procore_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string | null
          user_ids?: string[] | null
          project_ids?: string[] | null
          procore_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          location: string | null
          description: string | null
          status: 'active' | 'completed' | 'on_hold' | 'cancelled' | null
          date: string | null
          ended_date: string | null
          task_ids: string[] | null
          user_ids: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          description?: string | null
          status?: 'active' | 'completed' | 'on_hold' | 'cancelled' | null
          date?: string | null
          ended_date?: string | null
          task_ids?: string[] | null
          user_ids?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          description?: string | null
          status?: 'active' | 'completed' | 'on_hold' | 'cancelled' | null
          date?: string | null
          ended_date?: string | null
          task_ids?: string[] | null
          user_ids?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          safety_id: string | null
          name: string
          description: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'delayed' | null
          start: string | null
          end: string | null
          assignees: string[] | null
          trade: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          safety_id?: string | null
          name: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'delayed' | null
          start?: string | null
          end?: string | null
          assignees?: string[] | null
          trade?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          safety_id?: string | null
          name?: string
          description?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'delayed' | null
          start?: string | null
          end?: string | null
          assignees?: string[] | null
          trade?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      safety: {
        Row: {
          safety_id: string
          description: string | null
          uri: string | null
          task_id: string | null
          user_id: string | null
          timestamp: string | null
          safety_name: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          safety_id?: string
          description?: string | null
          uri?: string | null
          task_id?: string | null
          user_id?: string | null
          timestamp?: string | null
          safety_name?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          safety_id?: string
          description?: string | null
          uri?: string | null
          task_id?: string | null
          user_id?: string | null
          timestamp?: string | null
          safety_name?: string | null
          created_at?: string | null
        }
      }
      videos: {
        Row: {
          video_id: string
          uri: string
          user_id: string
          start: string | null
          endtime: string | null
          task_ids: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          video_id?: string
          uri: string
          user_id: string
          start?: string | null
          endtime?: string | null
          task_ids?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          video_id?: string
          uri?: string
          user_id?: string
          start?: string | null
          endtime?: string | null
          task_ids?: string[] | null
          created_at?: string | null
          updated_at?: string | null
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

export type User = Tables<'users'>
export type Organization = Tables<'organizations'>
export type Project = Tables<'projects'>
export type Task = Tables<'tasks'>
export type Safety = Tables<'safety'>
export type Video = Tables<'videos'>
