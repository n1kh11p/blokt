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
import { createSafetyEntry } from '@/lib/actions/safety'
import { getProjects } from '@/lib/actions/projects'
import { getProjectMembers } from '@/lib/actions/members'
import { Plus } from 'lucide-react'

interface Project {
  id: string
  name: string
}

interface Member {
  user_id: string
  name: string | null
  email: string | null
}

export function CreateSafetyAlertDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [selectedTask, setSelectedTask] = useState<string>('')

  useEffect(() => {
    if (!open) return
    const fetchProjects = async () => {
      const result = await getProjects()
      if (result.data) {
        setProjects(result.data)
      }
    }
    fetchProjects()
  }, [open])

  useEffect(() => {
    if (!selectedTask) return
    let cancelled = false
    const fetchProjectData = async () => {
      // Get the correct members using the parent task/project info later, 
      // mocking global load for now
      const membersResult = await getProjectMembers(selectedTask)

      if (!cancelled) {
        if (membersResult.data) setMembers(membersResult.data as Member[])
      }
    }
    fetchProjectData()
    return () => { cancelled = true }
  }, [selectedTask])

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) {
      setSelectedTask('')
      setMembers([])
      setError(null)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createSafetyEntry(formData)

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
          <Plus className="h-4 w-4" />
          Create Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Safety Alert</DialogTitle>
          <DialogDescription>
            Manually log a safety violation or concern
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="space-y-2">
              <Label htmlFor="task_id">Task Reference *</Label>
              <Input
                id="task_id"
                name="task_id"
                placeholder="Task UUID"
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="safety_name">Safety Issue Name *</Label>
              <Input
                id="safety_name"
                name="safety_name"
                placeholder="e.g., Missing Hard Hat"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Additional details about the violation..."
                rows={3}
              />
            </div>

            {selectedTask && members.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="user_id">Worker Involved</Label>
                <Select name="user_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Select worker (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {member.name || member.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="uri">URI</Label>
              <Input id="uri" name="uri" placeholder="Associated documentation or resource URL" />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {loading ? 'Creating...' : 'Create Alert'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
