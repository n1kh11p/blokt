'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { addProjectMember, updateMemberRole, removeMember, getAvailableUsers } from '@/lib/actions/members'
import { Trash2 } from 'lucide-react'
import { useEffect } from 'react'

interface AvailableUser {
  user_id: string
  name: string | null
  email: string | null
  role: string | null
}

interface Member {
  user_id: string
  role: string | null
  name: string | null
  email: string | null
}

interface AddMemberDialogProps {
  projectId: string
  children: React.ReactNode
}

export function AddMemberDialog({ projectId, children }: AddMemberDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[] | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<string>('field_worker')

  useEffect(() => {
    if (!open) return

    let cancelled = false

    const fetchUsers = async () => {
      const result = await getAvailableUsers(projectId)
      if (!cancelled && result.data) {
        setAvailableUsers(result.data)
      }
    }

    fetchUsers()

    return () => { cancelled = true }
  }, [open, projectId])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await addProjectMember(projectId, formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        setSelectedUserId('')
        setSelectedRole('field_worker')
        setError(null)
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add a user to this project
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="space-y-2">
              <Label htmlFor="user_id">User</Label>
              {availableUsers === null ? (
                <p className="text-sm text-stone-500">Loading users...</p>
              ) : availableUsers.length === 0 ? (
                <p className="text-sm text-stone-500">No available users to add</p>
              ) : (
                <>
                  <Select
                    value={selectedUserId}
                    onValueChange={(value) => {
                      setSelectedUserId(value)
                      const user = availableUsers.find(u => u.user_id === value)
                      if (user?.role) {
                        setSelectedRole(user.role)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          <div className="flex flex-col">
                            <span>{user.name || 'No name'}</span>
                            <span className="text-xs text-stone-500">{user.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="user_id" value={selectedUserId} />
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="project_manager">Project Manager</SelectItem>
                  <SelectItem value="foreman">Foreman</SelectItem>
                  <SelectItem value="field_worker">Field Worker</SelectItem>
                  <SelectItem value="safety_manager">Safety Manager</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="role" value={selectedRole} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !availableUsers || availableUsers.length === 0 || !selectedUserId}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {loading ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EditMemberDialogProps {
  projectId: string
  member: Member
  children: React.ReactNode
}

export function EditMemberDialog({ projectId, member, children }: EditMemberDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await updateMemberRole(member.user_id, projectId, formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  async function handleRemove() {
    setLoading(true)
    setError(null)

    const result = await removeMember(member.user_id, projectId)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) setDeleteConfirm(false)
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>
            Update role or remove from project
          </DialogDescription>
        </DialogHeader>

        {deleteConfirm ? (
          <div className="space-y-4 py-4">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Are you sure you want to remove <strong>{member.name || member.email}</strong> from this project?
            </p>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRemove}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Removing...' : 'Remove'}
              </Button>
            </div>
          </div>
        ) : (
          <form action={handleSubmit}>
            <div className="space-y-4 py-4">
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="rounded-lg border border-stone-200 p-3 dark:border-stone-800">
                <p className="font-medium text-stone-900 dark:text-white">
                  {member.name || 'Unknown'}
                </p>
                <p className="text-sm text-stone-500">
                  {member.email}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue={member.role || 'field_worker'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project_manager">Project Manager</SelectItem>
                    <SelectItem value="superintendent">Superintendent</SelectItem>
                    <SelectItem value="foreman">Foreman</SelectItem>
                    <SelectItem value="field_worker">Field Worker</SelectItem>
                    <SelectItem value="safety_manager">Safety Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteConfirm(true)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
              <div className="flex-1" />
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
