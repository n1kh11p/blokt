import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  id: string
  name: string
  location: string | null
  status: string
  alignmentScore: number | null
  tasksCompleted: number
  totalTasks: number
  safetyAlerts: number
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  on_hold: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export function ProjectCard({
  id,
  name,
  location,
  status,
  alignmentScore,
  tasksCompleted,
  totalTasks,
  safetyAlerts,
}: ProjectCardProps) {
  const progress = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0
  const statusLabel = status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <Link href={`/projects/${id}`}>
      <Card className="transition-all hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold text-stone-900 dark:text-white">
              {name}
            </CardTitle>
            <Badge className={cn('text-xs', statusColors[status] || statusColors.active)}>
              {statusLabel}
            </Badge>
          </div>
          {location && (
            <div className="flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
              <MapPin className="h-3.5 w-3.5" />
              {location}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-600 dark:text-stone-400">Task Progress</span>
              <span className="font-medium text-stone-900 dark:text-white">
                {tasksCompleted}/{totalTasks}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm text-stone-600 dark:text-stone-400">
                Alignment: {alignmentScore !== null ? `${alignmentScore}%` : 'N/A'}
              </span>
            </div>
            {safetyAlerts > 0 && (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{safetyAlerts}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
