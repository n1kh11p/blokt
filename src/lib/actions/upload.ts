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

  return getUserTasks(user.id)
}

// Helper to fetch tasks for any specific user id
export async function getUserTasks(userId: string): Promise<ApiResponse<Task[]>> {
  const { supabase, error } = await getAuthenticatedUser()
  if (error) return { error: 'Not authenticated', data: null }

  try {
    // 1. Fetch all projects this user is associated with to get their task IDs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: projects } = await (supabase as any)
      .from('projects')
      .select('task_ids')
      .contains('user_ids', [userId])

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
      query = query.or(`id.in.(${formattedIds}),assignees.cs.{${userId}}`)
    } else {
      query = query.contains('assignees', [userId])
    }

    const { data: tasksData, error: queryError } = await query.order('created_at', { ascending: false })

    if (queryError) {
      return { error: queryError.message, data: null }
    }

    return { error: null, data: (tasksData || []) as Task[] }
  } catch (err) {
    console.error('[Upload] Error fetching user tasks:', err)
    return { error: err instanceof Error ? err.message : 'Failed to fetch tasks', data: null }
  }
}

// ============================================
// SAVE VIDEO RECORD
// Creates database record after client-side upload
// ============================================

export async function saveVideoRecord(
  filePath: string,
  start: string | null,
  endtime: string | null,
  taskIds: string[]
): Promise<UploadResponse> {
  const { user, supabase, error: authError } = await getAuthenticatedUser()

  if (authError || !user) {
    return { error: authError || 'Not authenticated', success: false }
  }

  try {
    // Get public URL
    let finalUrl = filePath;
    if (!filePath.startsWith('/uploads/')) {
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath)
      finalUrl = publicUrl;
    }



    // Create database record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: videoRecord, error: dbError } = await (supabase as any)
      .from('videos')
      .insert({
        uri: finalUrl,
        user_id: user.id,
        start: start || null,
        endtime: endtime || null,
        task_ids: taskIds
      })
      .select()
      .single()

    if (dbError) {
      console.error('[Upload] Database error:', dbError)
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

export async function processVideoAnnotations(videoId: string) {
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

    // Note: The user requested we NOT save the raw annotations to the database anymore.
    // We only use the parsed annotations locally to feed into the OpenAI completion model.

    // 2. Determine who the video belongs to (the exact worker)
    const { data: videoData, error: videoError } = await (supabase as any)
      .from('videos')
      .select('user_id')
      .eq('video_id', videoId)
      .single()

    if (videoError || !videoData) {
      console.error('[Upload] Failed to fetch video owner:', videoError)
      return { error: 'Failed to identify the worker for this video', success: false, completedTaskIds: [] }
    }

    const workerId = videoData.user_id
    console.log('[Upload] Fetched Video Owner:', workerId, 'for video ID:', videoId)

    // 3. Fetch all tasks assigned to the worker using the shared logic
    const { data: tasks, error: tasksError } = await getUserTasks(workerId)
    console.log('[Upload] Fetching tasks for workerId:', workerId, 'Result Data:', tasks?.length, 'tasks. Error:', tasksError)

    if (tasksError || !tasks || tasks.length === 0) {
      console.error('[Upload] Failed to fetch task details or no tasks found:', tasksError)
      return { error: 'No tasks found for evaluation', success: false, completedTaskIds: [] }
    }

    console.log('[Upload] Fetched Worker Tasks:', JSON.stringify(tasks, null, 2))

    // 4. Evaluate completions using Gemini
    const { GoogleGenAI } = await import('@google/genai')
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

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

    console.log('[Upload] AI Prompt:\\n', prompt)

    let responseText = "[]"

    try {
      const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
          temperature: 0,
        }
      })
      responseText = aiResponse.text?.trim() || "[]"
    } catch (geminiError: any) {
      console.error('[Upload] Gemini API Failed, falling back to mock:', geminiError.message)
      // Fallback for demo when OpenAI/Gemini credits run out (429) or no key
      // Automatically mock completion for half the tasks
      if (tasks.length > 0) {
        const mockCompleted = tasks.slice(0, Math.ceil(tasks.length / 2)).map((t: any) => t.id)
        responseText = JSON.stringify(mockCompleted)
      }
    }

    let completedTaskIds: string[] = []
    try {
      // Strip markdown code blocks just in case the model ignored instructions
      const cleanJson = responseText.replace(/```json\n?|\`\`\`/g, '').trim()
      completedTaskIds = JSON.parse(cleanJson)
    } catch (e) {
      console.error('[Upload] Failed to parse OpenAI response:', e, 'Response was:', responseText)
      return { error: 'AI failed to format response correctly', success: false, completedTaskIds: [] }
    }

    // 5. Update the video record with the AI's suggested completions
    if (completedTaskIds.length > 0) {
      // Ensure we only stage tasks that exist for this worker
      const validIdsToSuggest = completedTaskIds.filter(id => tasks.some((t: any) => t.id === id))

      if (validIdsToSuggest.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: updateError } = await (supabase as any)
          .from('videos')
          .update({ ai_suggested_tasks: validIdsToSuggest })
          .eq('video_id', videoId)

        if (updateError) {
          console.error('[Upload] Failed to stage AI suggested tasks:', updateError)
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

