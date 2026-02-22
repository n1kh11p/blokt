'use client'

import { useState, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createTask, updateTask, deleteTask } from '@/lib/actions/tasks'
import { getProjectMembers } from '@/lib/actions/members'
import { Trash2 } from 'lucide-react'

interface Task {
  id: string
  name: string
  description: string | null
  status: string
  start: string | null
  end: string | null
  trade: string | null
  assigned_to: string | null
}

interface Member {
  user_id: string
  name: string | null
  email: string | null
}

interface TaskDialogProps {
  projectId: string
  task?: Task
  children: React.ReactNode
  mode: 'create' | 'edit'
}

export function TaskDialog({ projectId, task, children, mode }: TaskDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [assignedTo, setAssignedTo] = useState<string>(task?.assigned_to || '')

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const fetchMembers = async () => {
      const result = await getProjectMembers(projectId)
      if (!cancelled && result.data) {
        setMembers(result.data as Member[])
      }
    }
    fetchMembers()
    return () => { cancelled = true }
  }, [open, projectId])

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = mode === 'create'
      ? await createTask(projectId, formData)
      : await updateTask(task!.id, projectId, formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!task) return

    setLoading(true)
    setError(null)

    const result = await deleteTask(task.id, projectId)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (isOpen) {
      setAssignedTo(task?.assigned_to || '')
    }
    if (!isOpen) {
      setDeleteConfirm(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Task' : 'Edit Task'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Add a new task to this project' : 'Update task details'}
          </DialogDescription>
        </DialogHeader>

        {deleteConfirm ? (
          <div className="space-y-4 py-4">
            <p className="text-sm text-stone-600">
              Are you sure you want to delete <strong>{task?.name}</strong>? This action cannot be undone.
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
                onClick={handleDelete}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Deleting...' : 'Delete Task'}
              </Button>
            </div>
          </div>
        ) : (
          <form action={handleSubmit}>
            <div className="space-y-4 py-4">
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Task Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={task?.name || ''}
                  placeholder="Enter task name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={task?.description || ''}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              {mode === 'edit' && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={task?.status || 'pending'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="planned_start">Start Date</Label>
                  <Input
                    id="planned_start"
                    name="planned_start"
                    type="date"
                    defaultValue={task?.start?.split('T')[0] || ''}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planned_end">End Date</Label>
                  <Input
                    id="planned_end"
                    name="planned_end"
                    type="date"
                    defaultValue={task?.end?.split('T')[0] || ''}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trade">Trade</Label>
                <Input
                  id="trade"
                  name="trade"
                  defaultValue={task?.trade || ''}
                  placeholder="e.g., Electrical, Plumbing, HVAC"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assign To</Label>
                <Select value={assignedTo || 'unassigned'} onValueChange={(val) => setAssignedTo(val === 'unassigned' ? '' : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {member.name || member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="assigned_to" value={assignedTo} />
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              {mode === 'edit' && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setDeleteConfirm(true)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
              <div className="flex-1" />
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600"
              >
                {loading ? 'Saving...' : mode === 'create' ? 'Add Task' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
