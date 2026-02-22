'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Task } from '@/types'

// ============================================
// TYPES
// ============================================

interface ApiResponse<T> {
  error: string | null
  data: T | null
}

interface UploadResponse {
  error: string | null
  success: boolean
  videoId?: string
}

// ============================================
// HELPER: Get authenticated user
// ============================================

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return { user: null, supabase, error: 'Not authenticated' }
  }
  
  return { user, supabase, error: null }
}

// ============================================
// GET WORKER TASKS
// Fetches all tasks assigned to the current user
// ============================================

export async function getWorkerTasks(): Promise<ApiResponse<Task[]>> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', data: null }
  }

  try {
    // Fetch all tasks where user is in assignees array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tasksData, error } = await (supabase as any)
      .from('tasks')
      .select('*')
      .contains('assignees', [user.id])
      .order('created_at', { ascending: false })

    if (error) {
      return { error: error.message, data: null }
    }

    return { error: null, data: (tasksData || []) as Task[] }
  } catch (err) {
    console.error('[Upload] Error fetching worker tasks:', err)
    return { error: err instanceof Error ? err.message : 'Failed to fetch tasks', data: null }
  }
}

// ============================================
// UPLOAD VIDEO
// Uploads video file to Supabase storage and creates database record
// ============================================

export async function uploadVideo(formData: FormData): Promise<UploadResponse> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()
  
  if (authError || !user) {
    return { error: authError || 'Not authenticated', success: false }
  }

  try {
    const file = formData.get('file') as File
    const start = formData.get('start') as string | null
    const endtime = formData.get('endtime') as string | null
    const taskIds = formData.get('task_ids') as string | null

    if (!file) {
      return { error: 'No file provided', success: false }
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      return { error: 'File must be a video', success: false }
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('[Upload] Storage error:', uploadError)
      return { error: `Upload failed: ${uploadError.message}`, success: false }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(uploadData.path)

    // Parse task IDs
    const parsedTaskIds = taskIds ? JSON.parse(taskIds) : []

    // Create database record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: videoRecord, error: dbError } = await (supabase as any)
      .from('videos')
      .insert({
        uri: publicUrl,
        user_id: user.id,
        start: start || null,
        endtime: endtime || null,
        task_ids: parsedTaskIds
      })
      .select()
      .single()

    if (dbError) {
      console.error('[Upload] Database error:', dbError)
      // Try to clean up uploaded file
      await supabase.storage.from('videos').remove([uploadData.path])
      return { error: `Failed to save video record: ${dbError.message}`, success: false }
    }

    revalidatePath('/videos')
    revalidatePath('/upload')

    return { 
      error: null, 
      success: true, 
      videoId: videoRecord.video_id 
    }
  } catch (err) {
    console.error('[Upload] Unexpected error:', err)
    return { 
      error: err instanceof Error ? err.message : 'Upload failed', 
      success: false 
    }
  }
}
