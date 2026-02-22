'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Upload, CheckCircle2, Loader2, Video, X, Sparkles } from 'lucide-react'
import type { Task } from '@/types'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { getWorkerTasks, uploadVideo, processVideoAnnotations } from '@/lib/actions/upload'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [start, setStart] = useState('')
  const [endtime, setEndtime] = useState('')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessingAI, setIsProcessingAI] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [completedTaskNames, setCompletedTaskNames] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch worker's tasks on mount
  useEffect(() => {
    async function fetchTasks() {
      setIsLoadingTasks(true)
      const { data, error } = await getWorkerTasks()
      if (data) {
        setTasks(data)
      } else if (error) {
        console.error('Failed to fetch tasks:', error)
      }
      setIsLoadingTasks(false)
    }
    fetchTasks()
  }, [])

  const toggleTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.type.startsWith('video/')) {
        setError('Please select a valid video file')
        return
      }
      setFile(selectedFile)
      setError(null)

      // Calculate start and end times automatically based on file modified time & duration
      const end = new Date(selectedFile.lastModified)
      setEndtime(end.toISOString())

      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        const durationMs = video.duration * 1000
        const startDt = new Date(selectedFile.lastModified - durationMs)
        setStart(startDt.toISOString())
      }
      video.src = URL.createObjectURL(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    // Simulate progress while uploading
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return 90 // Cap at 90 until real upload finishes
        return prev + 10
      })
    }, 500)

    const formData = new FormData()
    formData.append('file', file)
    if (start) formData.append('start', new Date(start).toISOString())
    if (endtime) formData.append('endtime', new Date(endtime).toISOString())
    formData.append('task_ids', JSON.stringify(selectedTasks))

    const result = await uploadVideo(formData)

    clearInterval(progressInterval)
    setUploadProgress(100)

    if (result.error || !result.success || !result.videoId) {
      setError(result.error || 'Upload failed')
      setIsUploading(false)
      return
    }

    toast.success('Video uploaded successfully!', {
      description: 'Now processing with AI to verify task completion...'
    })

    setIsProcessingAI(true)

    // Call AI action to read json and update tasks
    const aiResult = await processVideoAnnotations(result.videoId, selectedTasks)

    setIsUploading(false)
    setIsProcessingAI(false)
    setUploadComplete(true)

    if (aiResult.success && aiResult.completedTaskIds && aiResult.completedTaskIds.length > 0) {
      const names = tasks
        .filter(t => (aiResult.completedTaskIds as string[]).includes(t.id))
        .map(t => t.name)

      setCompletedTaskNames(names)

      // Trigger Celebration
      const duration = 3 * 1000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#f59e0b', '#10b981', '#ef4444']
        })
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#f59e0b', '#10b981', '#ef4444']
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()

      toast.success('Tasks Verified!', {
        description: `AI confirmed completion of ${names.length} tasks.`,
        icon: <Sparkles className="h-4 w-4 text-amber-500" />
      })
    }
  }

  const resetForm = () => {
    setFile(null)
    setStart('')
    setEndtime('')
    setSelectedTasks([])
    setUploadProgress(0)
    setCompletedTaskNames([])
    setUploadComplete(false)
    setError(null)
  }

  if (uploadComplete) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            {completedTaskNames.length > 0 ? (
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                <Sparkles className="h-8 w-8 text-amber-600" />
              </div>
            ) : (
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            )}

            <h2 className="text-xl font-semibold text-stone-900">
              {completedTaskNames.length > 0 ? 'Tasks Verified!' : 'Upload Complete!'}
            </h2>

            {completedTaskNames.length > 0 ? (
              <div className="mt-4 rounded-lg bg-stone-50 p-4 text-left border border-stone-100">
                <p className="text-sm font-medium text-stone-900 mb-2">
                  AI analysis verified the following tasks:
                </p>
                <ul className="space-y-1">
                  {completedTaskNames.map((name, i) => (
                    <li key={i} className="text-sm text-green-700 flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3" /> {name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-2 text-stone-600">
                Your footage has been uploaded and is now being processed.
              </p>
            )}

            <div className="mt-6 flex gap-3 justify-center">
              <Button variant="outline" onClick={resetForm}>
                Upload Another
              </Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600"
                onClick={() => router.push('/videos')}
              >
                View Videos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Upload Footage</h1>
        <p className="text-stone-600">
          Upload bodycam footage and tag the tasks you performed
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upload Video File</CardTitle>
          <CardDescription>
            Select your bodycam footage or video file to upload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Video File *</Label>
            {!file ? (
              <div className="relative">
                <Input
                  id="file"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="mt-2 text-xs text-stone-500">
                  Supported formats: MP4, MOV, AVI, WebM (Max 500MB)
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                <Video className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">{file.name}</p>
                  <p className="text-sm text-green-600">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="text-green-600 hover:text-green-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>



      <Card>
        <CardHeader>
          <CardTitle>Tag Tasks Performed</CardTitle>
          <CardDescription>
            Select the tasks you worked on during this recording. This helps improve AI accuracy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTasks ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-stone-400" />
              <span className="ml-2 text-sm text-stone-500">Loading your tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-stone-200 bg-stone-50 p-8 text-center">
              <p className="text-sm text-stone-500">No tasks assigned to you yet</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {tasks.map((task) => {
                  const isSelected = selectedTasks.includes(task.id)
                  return (
                    <Badge
                      key={task.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all ${isSelected
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : 'hover:border-amber-500 hover:text-amber-600'
                        }`}
                      onClick={() => toggleTask(task.id)}
                    >
                      {isSelected && <CheckCircle2 className="mr-1 h-3 w-3" />}
                      {task.name}
                    </Badge>
                  )
                })}
              </div>
              {selectedTasks.length > 0 && (
                <p className="mt-3 text-sm text-stone-500">
                  {selectedTasks.length} task{selectedTasks.length > 1 ? 's' : ''} selected
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col items-end gap-3">
        {(isUploading || isProcessingAI) && (
          <div className="w-full max-w-sm space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">
                {isProcessingAI ? 'AI Analyzing Footage...' : 'Uploading...'}
              </span>
              <span className="font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetForm} disabled={isUploading || isProcessingAI}>
            Cancel
          </Button>
          <Button
            className="bg-amber-500 hover:bg-amber-600"
            disabled={!file || isUploading || isProcessingAI}
            onClick={handleUpload}
          >
            {isUploading || isProcessingAI ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isProcessingAI ? 'Processing...' : 'Uploading...'}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Footage
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
