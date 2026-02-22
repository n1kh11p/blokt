import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, CheckCircle2, AlertTriangle, Play } from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'upload' | 'task_complete' | 'safety_alert' | 'review'
  user: string
  project: string
  description: string
  timestamp: string
}

const activityIcons = {
  upload: Upload,
  task_complete: CheckCircle2,
  safety_alert: AlertTriangle,
  review: Play,
}

const activityColors = {
  upload: 'bg-blue-100 text-blue-600',
  task_complete: 'bg-green-100 text-green-600',
  safety_alert: 'bg-red-100 text-red-600',
  review: 'bg-purple-100 text-purple-600',
}

interface RecentActivityProps {
  activities: ActivityItem[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-4">
              No recent activity
            </p>
          ) : (
            activities.map((activity) => {
              const Icon = activityIcons[activity.type]
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`rounded-full p-2 ${activityColors[activity.type]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-stone-900">
                      <span className="font-medium">{activity.user}</span>{' '}
                      {activity.description}
                    </p>
                    <p className="text-xs text-stone-500">
                      {activity.project} • {activity.timestamp}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function RecentActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-stone-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-stone-200" />
                <div className="h-3 w-1/2 rounded bg-stone-200" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
