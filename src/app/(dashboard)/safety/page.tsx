import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { getAllSafetyAlerts } from '@/lib/actions/safety'
import { CreateSafetyAlertDialog } from '@/components/safety/create-alert-dialog'
import { SafetyAlertCard } from '@/components/safety/alert-card'

export default async function SafetyPage() {
  const { data: alerts } = await getAllSafetyAlerts()
  const safetyAlerts = alerts || []
  
  const pendingCount = safetyAlerts.filter((a) => !a.acknowledged).length
  const criticalCount = safetyAlerts.filter((a) => a.severity === 'critical').length
  const weekCount = safetyAlerts.filter((a) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(a.timestamp) > weekAgo
  }).length
  const totalAlerts = safetyAlerts.length
  const complianceRate = totalAlerts > 0 ? Math.round(((totalAlerts - criticalCount) / totalAlerts) * 100) : 100

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
                <p className="text-3xl font-bold text-stone-900 dark:text-white">{weekCount}</p>
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
                <p className="text-3xl font-bold text-green-600">{complianceRate}%</p>
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
                OSHA compliance violations detected
              </CardDescription>
            </div>
            <CreateSafetyAlertDialog />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({safetyAlerts.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="critical">Critical ({criticalCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {safetyAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                  <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">
                    No safety alerts
                  </h3>
                  <p className="mt-2 text-sm text-stone-500">
                    All clear! No violations detected.
                  </p>
                </div>
              ) : (
                safetyAlerts.map((alert) => (
                  <SafetyAlertCard key={alert.id} alert={alert} />
                ))
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-3">
              {safetyAlerts
                .filter((a) => !a.acknowledged)
                .map((alert) => (
                  <SafetyAlertCard key={alert.id} alert={alert} />
                ))}
            </TabsContent>

            <TabsContent value="critical" className="space-y-3">
              {safetyAlerts
                .filter((a) => a.severity === 'critical')
                .map((alert) => (
                  <SafetyAlertCard key={alert.id} alert={alert} critical />
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
