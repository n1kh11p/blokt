'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

import type { Safety } from '@/types'


export async function getSafetyEntries(taskId: string): Promise<{ error: string | null, data: Safety[] | null }> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('safety')
    .select('*')
    .eq('task_id', taskId)
    .order('timestamp', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data: data as Safety[] }
}

export async function getAllSafetyEntries(): Promise<{ error: string | null, data: Safety[] | null }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('safety')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100)

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data: data as Safety[] }
}

export async function createSafetyEntry(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const taskId = formData.get('task_id') as string
  const userId = formData.get('user_id') as string
  const safetyName = formData.get('safety_name') as string
  const description = formData.get('description') as string
  const uri = formData.get('uri') as string

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('safety')
    .insert({
      task_id: taskId || null,
      user_id: userId || null,
      safety_name: safetyName || null,
      description: description || null,
      uri: uri || null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // If task_id provided, update the task's safety_id
  if (taskId && data) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('tasks')
      .update({ safety_id: data.safety_id })
      .eq('id', taskId)
  }

  revalidatePath('/safety')
  return { error: null, data }
}

export async function updateSafetyEntry(safetyId: string, formData: FormData) {
  const supabase = await createClient()

  const safetyData = {
    safety_name: formData.get('safety_name') as string || null,
    description: formData.get('description') as string || null,
    uri: formData.get('uri') as string || null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('safety')
    .update(safetyData)
    .eq('safety_id', safetyId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/safety')
  return { error: null }
}

export async function deleteSafetyEntry(safetyId: string) {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('safety')
    .delete()
    .eq('safety_id', safetyId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/safety')
  return { error: null }
}

export async function getSafetyCount(): Promise<number> {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase as any)
    .from('safety')
    .select('*', { count: 'exact', head: true })

  return count || 0
}
