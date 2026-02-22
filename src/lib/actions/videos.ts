'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Video } from '@/types'

export async function getUserVideos(): Promise<{ error: string | null, data: Video[] | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('videos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data: data as Video[] }
}

export async function createVideoRecord(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const uri = formData.get('uri') as string
  const start = formData.get('start') as string
  const endtime = formData.get('endtime') as string

  if (!uri) {
    return { error: 'Missing required fields: uri' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('videos')
    .insert({
      uri,
      user_id: user.id,
      start: start || null,
      endtime: endtime || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/videos')
  return { error: null, data }
}

export async function deleteVideo(videoId: string) {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('videos')
    .delete()
    .eq('video_id', videoId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/videos')
  return { error: null }
}

export async function getProjectVideos(projectId: string): Promise<{ error: string | null, data: Video[] | null }> {
  // Not supported by the new schema, but returning an empty array to prevent breaking UI
  return { error: null, data: [] }
}

export async function getVideoUrl(filePath: string): Promise<string | null> {
  return null
}
