import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, Search, Mail, Phone, MoreVertical } from 'lucide-react'

const mockTeamMembers = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@construction.com',
    phone: '+1 (555) 123-4567',
    role: 'foreman',
    trade: 'Electrical',
    projects: ['Downtown Tower', 'Harbor Bridge'],
    status: 'active',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah.chen@construction.com',
    phone: '+1 (555) 234-5678',
    role: 'project_manager',
    trade: null,
    projects: ['Downtown Tower', 'Metro Station'],
    status: 'active',
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@construction.com',
    phone: '+1 (555) 345-6789',
    role: 'field_worker',
    trade: 'Plumbing',
    projects: ['Harbor Bridge'],
    status: 'active',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@construction.com',
    phone: '+1 (555) 456-7890',
    role: 'safety_manager',
    trade: null,
    projects: ['Downtown Tower', 'Harbor Bridge', 'Metro Station'],
    status: 'active',
  },
  {
    id: '5',
    name: 'David Lee',
    email: 'david.lee@construction.com',
    phone: '+1 (555) 567-8901',
    role: 'field_worker',
    trade: 'HVAC',
    projects: ['Metro Station'],
    status: 'inactive',
  },
]

const roleColors: Record<string, string> = {
  project_manager: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  foreman: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  field_worker: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  safety_manager: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  executive: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
}

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Team</h1>
          <p className="text-stone-600 dark:text-stone-400">
            Manage team members and assignments
          </p>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-600">
          <Plus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input placeholder="Search team members..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">All Roles</Button>
          <Button variant="ghost" size="sm">Active</Button>
          <Button variant="ghost" size="sm">Inactive</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockTeamMembers.map((member) => {
          const initials = member.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
          const roleLabel = member.role
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')

          return (
            <Card key={member.id} className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={undefined} alt={member.name} />
                    <AvatarFallback className="bg-amber-100 text-amber-700 text-lg">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-4 font-semibold text-stone-900 dark:text-white">
                    {member.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge className={roleColors[member.role]}>{roleLabel}</Badge>
                    {member.trade && (
                      <span className="text-sm text-stone-500">{member.trade}</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                  <p className="text-xs text-stone-500 mb-2">Assigned Projects</p>
                  <div className="flex flex-wrap gap-1">
                    {member.projects.map((project) => (
                      <Badge key={project} variant="outline" className="text-xs">
                        {project}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
