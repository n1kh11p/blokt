'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { connectProcore, checkProcoreConnection } from '@/lib/actions/procore'
import { Check, Loader2, RefreshCw } from 'lucide-react'

export function ProcoreConnect() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [result, setResult] = useState<{
    projects?: number
    users?: number
    tasks?: number
    manpowerLogs?: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      const status = await checkProcoreConnection()
      setConnected(status.connected)
      if (status.lastSync) {
        setLastSync(status.lastSync)
      }
    }
    checkConnection()
  }, [])

  async function handleConnect() {
    setLoading(true)
    setError(null)
    setResult(null)

    const response = await connectProcore()

    if (response.error) {
      setError(response.error)
      setLoading(false)
      return
    }

    if (response.success && response.summary) {
      setResult(response.summary)
      setConnected(true)
      setLastSync(new Date().toISOString())
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Procore Integration</CardTitle>
        <CardDescription>
          Connect your Procore account to sync project data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-stone-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <span className="text-xl font-bold text-orange-600">P</span>
            </div>
            <div>
              <p className="font-medium text-stone-900">Procore</p>
              {connected ? (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Connected
                  {lastSync && (
                    <span className="text-stone-400 ml-1">
                      • Last sync: {new Date(lastSync).toLocaleDateString()}
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-sm text-stone-500">Not connected</p>
              )}
            </div>
          </div>
          <Button
            onClick={handleConnect}
            disabled={loading}
            className={connected ? "bg-stone-600 hover:bg-stone-700" : "bg-amber-500 hover:bg-amber-600"}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : connected ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-sync
              </>
            ) : (
              'Connect'
            )}
          </Button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4">
            <p className="font-medium text-green-800 mb-2">
              Successfully synced from Procore:
            </p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• {result.projects} projects imported</li>
              <li>• {result.users} team members created</li>
              <li>• {result.tasks} tasks imported</li>
              <li>• {result.manpowerLogs} daily labor logs imported</li>
            </ul>
          </div>
        )}

        {connected && (
          <div className="rounded-lg bg-stone-50 border border-stone-200 p-4">
            <p className="text-sm text-stone-600">
              <strong>API Endpoints Synced:</strong>
            </p>
            <ul className="text-xs text-stone-500 mt-2 space-y-1 font-mono">
              <li>GET /rest/v1.1/projects</li>
              <li>GET /rest/v1.0/projects/{'{project_id}'}/users</li>
              <li>GET /rest/v1.0/projects/{'{project_id}'}/rfis</li>
              <li>GET /rest/v1.0/projects/{'{project_id}'}/manpower_logs</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
