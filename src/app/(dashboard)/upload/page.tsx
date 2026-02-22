'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Upload, CheckCircle2, Loader2, Video, X } from 'lucide-react'
import { getWorkerTasks, uploadVideo } from '@/lib/actions/upload'
import type { Task } from '@/types'

export default function UploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [start, setStart] = useState('')
  const [endtime, setEndtime] = useState('')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
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
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    if (start) formData.append('start', new Date(start).toISOString())
    if (endtime) formData.append('endtime', new Date(endtime).toISOString())
    formData.append('task_ids', JSON.stringify(selectedTasks))

    const result = await uploadVideo(formData)

    if (result.error) {
      setError(result.error)
      setIsUploading(false)
    } else {
      setIsUploading(false)
      setUploadComplete(true)
    }
  }

  const resetForm = () => {
    setFile(null)
    setStart('')
    setEndtime('')
    setSelectedTasks([])
    setUploadComplete(false)
    setError(null)
  }

  if (uploadComplete) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-stone-900 dark:text-white">
              Upload Complete!
            </h2>
            <p className="mt-2 text-stone-600 dark:text-stone-400">
              Your footage has been uploaded and is now being processed.
            </p>
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
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Upload Footage</h1>
        <p className="text-stone-600 dark:text-stone-400">
          Upload bodycam footage and tag the tasks you performed
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
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
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                <Video className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                  <p className="font-medium text-green-900 dark:text-green-100">{file.name}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">
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

      <div className="grid gap-6 lg:grid-cols-2">

        <Card>
          <CardHeader>
            <CardTitle>Recording Timeline</CardTitle>
            <CardDescription>
              Provide context about when this footage was recorded
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start Time</Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endtime">End Time</Label>
                <Input
                  id="endtime"
                  type="datetime-local"
                  value={endtime}
                  onChange={(e) => setEndtime(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <div className="rounded-lg border border-dashed border-stone-200 bg-stone-50 p-8 text-center dark:border-stone-800 dark:bg-stone-900/50">
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

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={resetForm}>
          Cancel
        </Button>
        <Button
          className="bg-amber-500 hover:bg-amber-600"
          disabled={!file || isUploading}
          onClick={handleUpload}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
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
  )
}
