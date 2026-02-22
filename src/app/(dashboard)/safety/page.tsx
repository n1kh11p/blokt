import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { getAllSafetyEntries } from '@/lib/actions/safety'
import { CreateSafetyAlertDialog } from '@/components/safety/create-alert-dialog'
import { SafetyAlertCard } from '@/components/safety/alert-card'
import type { Safety } from '@/types'

export default async function SafetyPage() {
  const { data: alerts } = await getAllSafetyEntries()
  const safetyAlerts = alerts || []

  const totalAlerts = safetyAlerts.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Safety Monitoring</h1>
          <p className="text-stone-600">
            Track and manage safety events
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">Total Alerts</p>
                <p className="text-3xl font-bold text-stone-900">{totalAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
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
                Safety issues and events logged
              </CardDescription>
            </div>
            <CreateSafetyAlertDialog />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 pt-4">
            {safetyAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <h3 className="mt-4 text-lg font-medium text-stone-900">
                  No safety alerts
                </h3>
                <p className="mt-2 text-sm text-stone-500">
                  All clear! No violations detected.
                </p>
              </div>
            ) : (
              safetyAlerts.map((alert: Safety) => (
                <SafetyAlertCard key={alert.safety_id} alert={alert} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
