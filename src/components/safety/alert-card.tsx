'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, Eye, Video } from 'lucide-react'
import { deleteSafetyEntry } from '@/lib/actions/safety'
import type { Safety } from '@/types'
import Link from 'next/link'

interface SafetyAlertCardProps {
  alert: Safety & { user?: { name: string | null, email: string | null }, task?: { name: string } }
  critical?: boolean
}

export function SafetyAlertCard({ alert, critical }: SafetyAlertCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this alert?')) return
    setLoading(true)
    await deleteSafetyEntry(alert.safety_id)
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
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-stone-900 dark:text-white">
              {alert.safety_name || 'Safety Issue'}
            </span>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {alert.task?.name || 'Unknown task'}
            {alert.user && ` • ${alert.user.name || alert.user.email}`}
            {' • '}
            {alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'No time'}
          </p>
          {alert.description && (
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {alert.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {alert.uri && (
          <Link href={alert.uri}>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4 mr-1" />
              Video
            </Button>
          </Link>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={handleDelete}
          disabled={loading}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}
