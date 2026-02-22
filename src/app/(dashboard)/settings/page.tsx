import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getProfile } from '@/lib/actions/profile'
import { ProfileForm, PasswordForm } from '@/components/settings/profile-form'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const { data: profile, error } = await getProfile()

  if (error || !profile) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Settings</h1>
        <p className="text-stone-600 dark:text-stone-400">
          Manage your account and preferences
        </p>
      </div>

      {profile.organizations && (
        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <CardContent className="py-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Organization:</strong> {profile.organizations.name}
              {profile.organizations.type && ` (${profile.organizations.type})`}
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileForm profile={profile} />
          <PasswordForm />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-900 dark:text-white">Safety Alerts</p>
                  <p className="text-sm text-stone-500">
                    Receive immediate notifications for safety violations
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Email</Button>
                  <Button variant="default" size="sm" className="bg-amber-500">SMS</Button>
                  <Button variant="outline" size="sm">Push</Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-900 dark:text-white">Daily Summary</p>
                  <p className="text-sm text-stone-500">
                    Receive a daily summary of project activity
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" className="bg-amber-500">Email</Button>
                  <Button variant="outline" size="sm">SMS</Button>
                  <Button variant="outline" size="sm">Push</Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-900 dark:text-white">Task Updates</p>
                  <p className="text-sm text-stone-500">
                    Notifications when tasks are completed or delayed
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Email</Button>
                  <Button variant="outline" size="sm">SMS</Button>
                  <Button variant="default" size="sm" className="bg-amber-500">Push</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Procore Integration</CardTitle>
              <CardDescription>
                Connect your Procore account to sync project data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-stone-200 p-4 dark:border-stone-800">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                    <span className="text-xl font-bold text-orange-600">P</span>
                  </div>
                  <div>
                    <p className="font-medium text-stone-900 dark:text-white">Procore</p>
                    <p className="text-sm text-stone-500">Not connected</p>
                  </div>
                </div>
                <Button className="bg-amber-500 hover:bg-amber-600">
                  Connect
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>
                Manage API keys for external integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-stone-200 p-4 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-stone-900 dark:text-white">API Key</p>
                    <p className="font-mono text-sm text-stone-500">
                      blokt_sk_****************************
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Regenerate
                  </Button>
                </div>
              </div>
              <p className="text-sm text-stone-500">
                Use this API key to integrate Blokt with your existing tools and workflows.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
