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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { getProjects } from '@/lib/actions/projects'
import { getTasks } from '@/lib/actions/tasks'
import { Upload, Video } from 'lucide-react'

interface Project {
  id: string
  name: string
}

interface Task {
  id: string
  name: string
}

export function UploadVideoDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

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
    const fetchTasks = async () => {
      const result = await getTasks(selectedProject)
      if (!cancelled && result.data) {
        setTasks(result.data)
      }
    }
    fetchTasks()
    return () => { cancelled = true }
  }, [selectedProject])

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) {
      setSelectedProject('')
      setSelectedTasks([])
      setFile(null)
      setError(null)
      setUploadProgress(0)
    }
  }

  function handleTaskToggle(taskId: string) {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!file || !selectedProject) {
      setError('Please select a project and file')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get form data before async operations
      const form = e.currentTarget
      const recordingDateInput = form.elements.namedItem('recording_date') as HTMLInputElement
      const recordingDate = recordingDateInput?.value || ''

      // Upload directly to Supabase Storage (client-side)
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not authenticated')
        setLoading(false)
        return
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${selectedProject}/${Date.now()}.${fileExt}`

      // Upload to storage with progress tracking
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`)
        setLoading(false)
        setUploadProgress(0)
        return
      }

      setUploadProgress(100)

      // Create database record via server action
      
      const formData = new FormData()
      formData.append('file_path', fileName)
      formData.append('file_name', file.name)
      formData.append('file_size', String(file.size))
      formData.append('project_id', selectedProject)
      if (recordingDate) {
        formData.append('recording_date', recordingDate)
      }
      selectedTasks.forEach(taskId => {
        formData.append('tagged_tasks', taskId)
      })

      const { createVideoRecord } = await import('@/lib/actions/videos')
      const result = await createVideoRecord(formData)

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      setLoading(false)
      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
          <Upload className="h-4 w-4" />
          Upload Video
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Field Video</DialogTitle>
          <DialogDescription>
            Upload bodycam or field footage and tag relevant tasks
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
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
              <Label htmlFor="recording_date">Recording Date</Label>
              <Input
                id="recording_date"
                name="recording_date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Video File</Label>
              <div className="border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-lg p-6 text-center">
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <Video className="h-5 w-5 text-amber-500" />
                    <span className="text-sm text-stone-600 dark:text-stone-400">
                      {file.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-stone-400" />
                      <span className="text-sm text-stone-500">
                        Click to select video file
                      </span>
                      <span className="text-xs text-stone-400">
                        MP4, MOV, AVI up to 500MB
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            </div>

            {selectedProject && tasks.length > 0 && (
              <div className="space-y-2">
                <Label>Tag Tasks Performed</Label>
                <div className="max-h-40 overflow-y-auto border border-stone-200 dark:border-stone-800 rounded-lg p-3 space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={task.id}
                        checked={selectedTasks.includes(task.id)}
                        onCheckedChange={() => handleTaskToggle(task.id)}
                      />
                      <label
                        htmlFor={task.id}
                        className="text-sm text-stone-700 dark:text-stone-300 cursor-pointer"
                      >
                        {task.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-600 dark:text-stone-400">
                    {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}
                  </span>
                  <span className="font-medium text-stone-900 dark:text-white">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !file || !selectedProject}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {loading ? 'Uploading...' : 'Upload Video'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
