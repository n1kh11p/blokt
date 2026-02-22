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
    // 1. Fetch all projects this user is associated with to get their task IDs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: projects } = await (supabase as any)
      .from('projects')
      .select('task_ids')
      .contains('user_ids', [user.id])

    let projectTaskIds: string[] = []
    if (projects) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      projects.forEach((p: any) => {
        if (p.task_ids && Array.isArray(p.task_ids)) {
          projectTaskIds = [...projectTaskIds, ...p.task_ids]
        }
      })
    }

    // 2. Fetch tasks that are either explicitly assigned to the user OR 
    // belong to a project the user is a part of.
    // If we have no project tasks, just filter by assignees.
    let query = (supabase as any).from('tasks').select('*')

    if (projectTaskIds.length > 0) {
      const formattedIds = projectTaskIds.map(id => `"${id}"`).join(',')
      query = query.or(`id.in.(${formattedIds}),assignees.cs.{${user.id}}`)
    } else {
      query = query.contains('assignees', [user.id])
    }

    const { data: tasksData, error } = await query.order('created_at', { ascending: false })

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

// ============================================
// PROCESS VIDEO ANNOTATIONS (OpenAI Integration)
// ============================================

export async function processVideoAnnotations(videoId: string, taskIds: string[]) {
  const { user, supabase, error: authError } = await getAuthenticatedUser()

  if (authError || !user) {
    return { error: authError || 'Not authenticated', success: false, completedTaskIds: [] }
  }

  try {
    // 1. Read the mock annotations JSON file
    // In a real scenario, this would be generated dynamically by a vision model after upload
    let annotationsJson = {}
    try {
      const fs = await import('fs/promises')
      const path = await import('path')
      const filePath = path.join(process.cwd(), 'src', 'lib', 'video_annotated.json')
      const fileContent = await fs.readFile(filePath, 'utf-8')
      annotationsJson = JSON.parse(fileContent)
    } catch (e) {
      console.error('[Upload] Failed to read mock annotations file:', e)
      return { error: 'Failed to read video annotations', success: false, completedTaskIds: [] }
    }

    // 2. Save annotations to the video record in Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: videoUpdateError } = await (supabase as any)
      .from('videos')
      .update({ action_annotations: annotationsJson })
      .eq('video_id', videoId)

    if (videoUpdateError) {
      console.error('[Upload] Failed to update video with annotations:', videoUpdateError)
      // Continue anyway; we still want to evaluate the tasks
    }

    if (!taskIds || taskIds.length === 0) {
      return { error: null, success: true, completedTaskIds: [] }
    }

    // 3. Fetch task details for the tagged tasks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tasks, error: tasksError } = await (supabase as any)
      .from('tasks')
      .select('id, name, description')
      .in('id', taskIds)

    if (tasksError || !tasks) {
      console.error('[Upload] Failed to fetch task details:', tasksError)
      return { error: 'Failed to fetch task details for evaluation', success: false, completedTaskIds: [] }
    }

    // 4. Evaluate completions using OpenAI
    const OpenAI = (await import('openai')).default
    const openai = new OpenAI() // automatically uses OPENAI_API_KEY from env

    const prompt = `
    I have a timeline of observations recorded from a construction worker's bodycam video, represented as a JSON map of timestamps to activity descriptions.
    
    Video Annotations:
    ${JSON.stringify(annotationsJson, null, 2)}
    
    I need you to act as an objective construction progress evaluator. 
    Below is a list of tasks that the worker claimed to be working on. For each task, evaluate if there is sufficient evidence in the Video Annotations to consider the task "completed".
    
    Tasks:
    ${tasks.map((t: any) => `- Task ID: ${t.id}
      Name: ${t.name}
      Description: ${t.description || 'none'}`).join('\n')}
      
    Respond ONLY with a valid JSON array containing the EXACT Task IDs of the tasks that should be marked as completed based on the video evidence. 
    Example response format: ["task_id_1", "task_id_2"]
    If no tasks were completed, return an empty array: []
    Do not include markdown tags (\`\`\`json) or any other text in your response.
    `

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    })

    const responseText = aiResponse.choices[0]?.message?.content?.trim() || "[]"

    let completedTaskIds: string[] = []
    try {
      // Strip markdown code blocks just in case the model ignored instructions
      const cleanJson = responseText.replace(/```json\n?|\`\`\`/g, '').trim()
      completedTaskIds = JSON.parse(cleanJson)
    } catch (e) {
      console.error('[Upload] Failed to parse OpenAI response:', e, 'Response was:', responseText)
      return { error: 'AI failed to format response correctly', success: false, completedTaskIds: [] }
    }

    // 5. Update the completed tasks in the database
    if (completedTaskIds.length > 0) {
      // Ensure we only update tasks the user actually tagged
      const validIdsToUpdate = completedTaskIds.filter(id => taskIds.includes(id))

      if (validIdsToUpdate.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any)
          .from('tasks')
          .update({ status: 'completed' })
          .in('id', validIdsToUpdate)

        if (updateError) {
          console.error('[Upload] Failed to update completed tasks:', updateError)
        }
      }
    }

    revalidatePath('/dashboard')
    revalidatePath('/projects')

    return {
      error: null,
      success: true,
      completedTaskIds
    }
  } catch (err) {
    console.error('[Upload] Unexpected error processing video:', err)
    return {
      error: err instanceof Error ? err.message : 'Processing failed',
      success: false,
      completedTaskIds: []
    }
  }
}

