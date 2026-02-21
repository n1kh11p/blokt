import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, CheckCircle2, Clock, Search, Filter, Eye, XCircle } from 'lucide-react'

const mockAlerts = [
  {
    id: '1',
    type: 'Missing Hard Hat',
    project: 'Downtown Tower',
    worker: 'John Smith',
    timestamp: '2026-02-21T14:32:00',
    severity: 'high',
    status: 'pending',
    confidence: 94,
  },
  {
    id: '2',
    type: 'Improper Fall Protection',
    project: 'Harbor Bridge',
    worker: 'Mike Johnson',
    timestamp: '2026-02-21T13:15:00',
    severity: 'critical',
    status: 'acknowledged',
    confidence: 98,
  },
  {
    id: '3',
    type: 'Unsafe Ladder Usage',
    project: 'Metro Station',
    worker: 'David Lee',
    timestamp: '2026-02-21T11:45:00',
    severity: 'medium',
    status: 'resolved',
    confidence: 87,
  },
  {
    id: '4',
    type: 'Missing Safety Vest',
    project: 'Downtown Tower',
    worker: 'Sarah Chen',
    timestamp: '2026-02-21T10:20:00',
    severity: 'low',
    status: 'false_positive',
    confidence: 72,
  },
  {
    id: '5',
    type: 'PPE Non-Compliance',
    project: 'Airport Terminal',
    worker: 'Tom Wilson',
    timestamp: '2026-02-21T09:05:00',
    severity: 'medium',
    status: 'pending',
    confidence: 91,
  },
]

const severityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-amber-500" />,
  acknowledged: <Eye className="h-4 w-4 text-blue-500" />,
  resolved: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  false_positive: <XCircle className="h-4 w-4 text-stone-400" />,
}

export default function SafetyPage() {
  const pendingCount = mockAlerts.filter((a) => a.status === 'pending').length
  const criticalCount = mockAlerts.filter((a) => a.severity === 'critical').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Safety Monitoring</h1>
          <p className="text-stone-600 dark:text-stone-400">
            Track and manage OSHA compliance alerts
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-400">Pending Alerts</p>
                <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-400">Critical</p>
                <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-400">This Week</p>
                <p className="text-3xl font-bold text-stone-900 dark:text-white">17</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-stone-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600 dark:text-stone-400">Compliance Rate</p>
                <p className="text-3xl font-bold text-green-600">97%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Safety Alerts</CardTitle>
              <CardDescription>
                AI-detected safety violations requiring review
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <Input placeholder="Search alerts..." className="pl-9 w-[200px]" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({mockAlerts.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="critical">Critical ({criticalCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {mockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg border border-stone-200 p-4 dark:border-stone-800"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{statusIcons[alert.status]}</div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-stone-900 dark:text-white">
                          {alert.type}
                        </span>
                        <Badge className={severityColors[alert.severity]}>
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-stone-500">
                          {alert.confidence}% confidence
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400">
                        {alert.project} • {alert.worker} •{' '}
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    {alert.status === 'pending' && (
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-3">
              {mockAlerts
                .filter((a) => a.status === 'pending')
                .map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between rounded-lg border border-stone-200 p-4 dark:border-stone-800"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{statusIcons[alert.status]}</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-stone-900 dark:text-white">
                            {alert.type}
                          </span>
                          <Badge className={severityColors[alert.severity]}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          {alert.project} • {alert.worker}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
                        Acknowledge
                      </Button>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="critical" className="space-y-3">
              {mockAlerts
                .filter((a) => a.severity === 'critical')
                .map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/10"
                  >
                    <div className="flex items-start gap-4">
                      <AlertTriangle className="mt-1 h-5 w-5 text-red-500" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-stone-900 dark:text-white">
                            {alert.type}
                          </span>
                          <Badge className={severityColors[alert.severity]}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          {alert.project} • {alert.worker} •{' '}
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button size="sm" variant="destructive">
                        Escalate
                      </Button>
                    </div>
                  </div>
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
