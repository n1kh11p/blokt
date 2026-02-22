'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface SafetyAlert {
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
  worker?: { id: string; full_name: string | null; email: string }
  video_upload?: { id: string; file_name: string }
  project?: { id: string; name: string }
}

export async function getProjectSafetyAlerts(projectId: string): Promise<{ error: string | null, data: SafetyAlert[] | null }> {
  const supabase = await createClient()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('safety_alerts')
    .select(`
      *,
      worker:profiles!worker_id(id, full_name, email),
      video_upload:video_uploads!video_upload_id(id, file_name)
    `)
    .eq('project_id', projectId)
    .order('timestamp', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data: data as SafetyAlert[] }
}

export async function getAllSafetyAlerts(): Promise<{ error: string | null, data: SafetyAlert[] | null }> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // Get user's organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  // Get all projects for the user's organization
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orgProjects } = await (supabase as any)
    .from('projects')
    .select('id')
    .eq('organization_id', profile?.organization_id)

  const projectIds = orgProjects?.map((p: { id: string }) => p.id) || []

  if (projectIds.length === 0) {
    return { error: null, data: [] }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('safety_alerts')
    .select(`
      *,
      worker:profiles!worker_id(id, full_name, email),
      video_upload:video_uploads!video_upload_id(id, file_name),
      project:projects!project_id(id, name)
    `)
    .in('project_id', projectIds)
    .order('timestamp', { ascending: false })
    .limit(100)

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data: data as SafetyAlert[] }
}

export async function createSafetyAlert(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const projectId = formData.get('project_id') as string
  const workerId = formData.get('worker_id') as string
  const videoUploadId = formData.get('video_upload_id') as string
  const violationType = formData.get('violation_type') as string
  const description = formData.get('description') as string
  const severity = formData.get('severity') as string
  const confidenceScore = formData.get('confidence_score') as string

  if (!projectId || !violationType || !severity) {
    return { error: 'Project, violation type, and severity are required' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('safety_alerts')
    .insert({
      project_id: projectId,
      worker_id: workerId || null,
      video_upload_id: videoUploadId || null,
      violation_type: violationType,
      description: description || null,
      severity: severity,
      confidence_score: confidenceScore ? parseFloat(confidenceScore) : null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/safety')
  revalidatePath(`/projects/${projectId}`)
  return { error: null, data }
}

export async function acknowledgeSafetyAlert(alertId: string, projectId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('safety_alerts')
    .update({
      acknowledged: true,
      acknowledged_by: user.id,
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', alertId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/safety')
  revalidatePath(`/projects/${projectId}`)
  return { error: null }
}

export async function deleteSafetyAlert(alertId: string, projectId: string) {
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('safety_alerts')
    .delete()
    .eq('id', alertId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/safety')
  revalidatePath(`/projects/${projectId}`)
  return { error: null }
}

export async function getUnacknowledgedAlertsCount(): Promise<number> {
  const supabase = await createClient()
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase as any)
    .from('safety_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('acknowledged', false)

  return count || 0
}
