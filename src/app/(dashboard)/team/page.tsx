import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Mail, Phone, Briefcase } from 'lucide-react'
import { getOrganizationMembers } from '@/lib/actions/team'
import { AddMemberDialog } from '@/components/team/add-member-dialog'
import { redirect } from 'next/navigation'

const roleColors: Record<string, string> = {
  project_manager: 'bg-purple-100 text-purple-700',
  foreman: 'bg-blue-100 text-blue-700',
  field_worker: 'bg-green-100 text-green-700',
  safety_manager: 'bg-orange-100 text-orange-700',
  executive: 'bg-stone-100 text-stone-700',
}

export default async function TeamPage() {
  const { data: members, error } = await getOrganizationMembers()

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">Unable to load team</h2>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    )
  }

  if (!members) {
    redirect('/login')
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Team</h1>
          <p className="text-stone-600">
            Manage team members and assignments
          </p>
        </div>
        <AddMemberDialog />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Members</p>
            <p className="text-2xl font-bold text-foreground">{members.length}</p>
          </div>
          <Briefcase className="h-8 w-8 text-muted-foreground" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No team members yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Get started by adding your first team member</p>
            <AddMemberDialog />
          </div>
        ) : (
          members.map((member) => {
            const displayName = member.name || member.email || 'User'
            const initials = displayName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
            const roleLabel = member.role
              ? member.role
                  .split('_')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')
              : 'No Role'

            return (
              <Card key={member.user_id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-amber-100 text-amber-700 text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="mt-4 font-semibold text-foreground">
                      {member.name || 'Unnamed User'}
                    </h3>
                    <div className="mt-1 flex flex-col items-center gap-2">
                      <Badge className={member.role ? roleColors[member.role] : 'bg-stone-100 text-stone-700'}>
                        {roleLabel}
                      </Badge>
                      {member.trade && (
                        <span className="text-sm text-muted-foreground">{member.trade}</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    {member.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 shrink-0" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">
                      Assigned Projects ({member.projectCount || 0})
                    </p>
                    {member.projects && member.projects.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {member.projects.slice(0, 3).map((project) => (
                          <Badge key={project.id} variant="outline" className="text-xs">
                            {project.name}
                          </Badge>
                        ))}
                        {member.projects.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.projects.length - 3} more
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No projects assigned</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
