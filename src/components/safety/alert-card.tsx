'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, Eye, Video } from 'lucide-react'
import { acknowledgeSafetyAlert, deleteSafetyAlert } from '@/lib/actions/safety'
import type { SafetyAlert } from '@/lib/actions/safety'
import Link from 'next/link'

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

interface SafetyAlertCardProps {
  alert: SafetyAlert
  critical?: boolean
}

export function SafetyAlertCard({ alert, critical }: SafetyAlertCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleAcknowledge() {
    setLoading(true)
    await acknowledgeSafetyAlert(alert.id, alert.project_id)
    setLoading(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this alert?')) return
    setLoading(true)
    await deleteSafetyAlert(alert.id, alert.project_id)
    setLoading(false)
    router.refresh()
  }

  const borderClass = critical 
    ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/10'
    : 'border-stone-200 dark:border-stone-800'

  return (
    <div className={`flex items-center justify-between rounded-lg border p-4 ${borderClass}`}>
      <div className="flex items-start gap-4">
        <div className="mt-1">
          {critical ? (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          ) : alert.acknowledged ? (
            <Eye className="h-4 w-4 text-blue-500" />
          ) : (
            <Clock className="h-4 w-4 text-amber-500" />
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-900 dark:text-white">
              {alert.violation_type}
            </span>
            <Badge className={severityColors[alert.severity]}>
              {alert.severity}
            </Badge>
            {alert.confidence_score && (
              <span className="text-xs text-stone-500">
                {Math.round(alert.confidence_score)}% confidence
              </span>
            )}
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {alert.project?.name || 'Unknown project'}
            {alert.worker && ` • ${alert.worker.full_name || alert.worker.email}`}
            {' • '}
            {new Date(alert.timestamp).toLocaleString()}
          </p>
          {alert.description && (
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {alert.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {alert.video_upload_id && (
          <Link href={`/videos/${alert.video_upload_id}`}>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4 mr-1" />
              Video
            </Button>
          </Link>
        )}
        {!alert.acknowledged && (
          <Button 
            size="sm" 
            className="bg-amber-500 hover:bg-amber-600"
            onClick={handleAcknowledge}
            disabled={loading}
          >
            {loading ? 'Acknowledging...' : 'Acknowledge'}
          </Button>
        )}
        {alert.acknowledged && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  )
}
