import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Profile } from '@/types/database'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id || '')
    .single()

  const typedProfile = profile as Profile | null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Settings</h1>
        <p className="text-stone-600 dark:text-stone-400">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    defaultValue={typedProfile?.full_name || ''}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={typedProfile?.email || ''}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue={typedProfile?.phone || ''}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trade">Trade</Label>
                  <Input
                    id="trade"
                    defaultValue={typedProfile?.trade || ''}
                    placeholder="Electrician"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-amber-500 hover:bg-amber-600">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div></div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline">Update Password</Button>
              </div>
            </CardContent>
          </Card>
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
