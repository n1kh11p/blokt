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
import { createSafetyAlert } from '@/lib/actions/safety'
import { getProjects } from '@/lib/actions/projects'
import { getProjectMembers } from '@/lib/actions/members'
import { getProjectVideos } from '@/lib/actions/videos'
import { Plus } from 'lucide-react'

interface Project {
  id: string
  name: string
}

interface Member {
  user_id: string
  profiles: { full_name: string | null; email: string }
}

interface Video {
  id: string
  file_name: string
}

export function CreateSafetyAlertDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')

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
    if (!selectedProject) return
    let cancelled = false
    const fetchProjectData = async () => {
      const [membersResult, videosResult] = await Promise.all([
        getProjectMembers(selectedProject),
        getProjectVideos(selectedProject),
      ])
      if (!cancelled) {
        if (membersResult.data) setMembers(membersResult.data as Member[])
        if (videosResult.data) setVideos(videosResult.data)
      }
    }
    fetchProjectData()
    return () => { cancelled = true }
  }, [selectedProject])

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) {
      setSelectedProject('')
      setMembers([])
      setVideos([])
      setError(null)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createSafetyAlert(formData)

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
              <Label htmlFor="project_id">Project *</Label>
              <Select 
                name="project_id" 
                value={selectedProject} 
                onValueChange={setSelectedProject}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="violation_type">Violation Type *</Label>
              <Input
                id="violation_type"
                name="violation_type"
                placeholder="e.g., Missing Hard Hat"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity *</Label>
              <Select name="severity" defaultValue="medium" required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
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

            {selectedProject && members.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="worker_id">Worker Involved</Label>
                <Select name="worker_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Select worker (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id}>
                        {member.profiles.full_name || member.profiles.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedProject && videos.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="video_upload_id">Related Video</Label>
                <Select name="video_upload_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Select video (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {videos.map((video) => (
                      <SelectItem key={video.id} value={video.id}>
                        {video.file_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
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
