'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface VideoUpload {
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
  worker?: { id: string; full_name: string | null; email: string }
  project?: { id: string; name: string }
}

export async function getProjectVideos(projectId: string): Promise<{ error: string | null, data: VideoUpload[] | null }> {
  const supabase = await createClient()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('video_uploads')
    .select('*, worker:profiles!worker_id(id, full_name, email)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data: data as VideoUpload[] }
}

export async function getUserVideos(): Promise<{ error: string | null, data: VideoUpload[] | null }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('video_uploads')
    .select('*, project:projects!project_id(id, name), worker:profiles!worker_id(id, full_name, email)')
    .eq('worker_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data: data as VideoUpload[] }
}

export async function createVideoRecord(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const filePath = formData.get('file_path') as string
  const fileName = formData.get('file_name') as string
  const fileSize = parseInt(formData.get('file_size') as string)
  const projectId = formData.get('project_id') as string
  const recordingDate = formData.get('recording_date') as string
  const taggedTasks = formData.getAll('tagged_tasks') as string[]

  if (!filePath || !fileName || !projectId) {
    return { error: 'Missing required fields' }
  }

  // Create database record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('video_uploads')
    .insert({
      project_id: projectId,
      worker_id: user.id,
      file_path: filePath,
      file_name: fileName,
      file_size: fileSize,
      recording_date: recordingDate || null,
      tagged_tasks: taggedTasks.length > 0 ? taggedTasks : null,
      processing_status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/videos')
  revalidatePath(`/projects/${projectId}`)
  return { error: null, data }
}

export async function deleteVideo(videoId: string, projectId: string) {
  const supabase = await createClient()

  // Get file path first
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: video } = await (supabase as any)
    .from('video_uploads')
    .select('file_path')
    .eq('id', videoId)
    .single()

  if (video?.file_path) {
    // Delete from storage
    await supabase.storage.from('videos').remove([video.file_path])
  }

  // Delete database record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('video_uploads')
    .delete()
    .eq('id', videoId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/videos')
  revalidatePath(`/projects/${projectId}`)
  return { error: null }
}

export async function getVideoUrl(filePath: string): Promise<string | null> {
  const supabase = await createClient()
  
  const { data } = await supabase.storage
    .from('videos')
    .createSignedUrl(filePath, 3600) // 1 hour expiry

  return data?.signedUrl || null
}
