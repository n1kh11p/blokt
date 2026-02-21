'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Upload, Video, X, CheckCircle2, Loader2 } from 'lucide-react'

const mockProjects = [
  { id: '1', name: 'Downtown Tower' },
  { id: '2', name: 'Harbor Bridge Expansion' },
  { id: '3', name: 'Metro Station Renovation' },
]

const mockTasks = [
  { id: '1', name: 'Electrical conduit installation' },
  { id: '2', name: 'HVAC ductwork - Level 3' },
  { id: '3', name: 'Concrete pour - Foundation B' },
  { id: '4', name: 'Steel framing - Section 4' },
  { id: '5', name: 'Plumbing rough-in' },
  { id: '6', name: 'Fire suppression system' },
]

export default function UploadPage() {
  const [selectedProject, setSelectedProject] = useState('')
  const [recordingDate, setRecordingDate] = useState('')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      setFile(droppedFile)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const toggleTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleUpload = async () => {
    if (!file || !selectedProject || !recordingDate) return

    setIsUploading(true)
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsUploading(false)
    setUploadComplete(true)
  }

  const resetForm = () => {
    setFile(null)
    setSelectedProject('')
    setRecordingDate('')
    setSelectedTasks([])
    setUploadComplete(false)
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
              <Button className="bg-amber-500 hover:bg-amber-600">
                View Status
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Video Upload</CardTitle>
            <CardDescription>
              Drag and drop your bodycam footage or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                isDragging
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10'
                  : file
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                  : 'border-stone-300 hover:border-stone-400 dark:border-stone-700'
              }`}
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              {file ? (
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <Video className="h-10 w-10 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-stone-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-stone-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                    }}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <Upload className="h-10 w-10 text-stone-400" />
                  <div>
                    <p className="font-medium text-stone-900 dark:text-white">
                      Drop your video here
                    </p>
                    <p className="text-sm text-stone-500">or click to browse</p>
                  </div>
                  <p className="text-xs text-stone-400">MP4, MOV, AVI up to 10GB</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recording Details</CardTitle>
            <CardDescription>
              Provide context about when and where this footage was recorded
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {mockProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Recording Date</Label>
              <Input
                id="date"
                type="date"
                value={recordingDate}
                onChange={(e) => setRecordingDate(e.target.value)}
              />
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
          <div className="flex flex-wrap gap-2">
            {mockTasks.map((task) => {
              const isSelected = selectedTasks.includes(task.id)
              return (
                <Badge
                  key={task.id}
                  variant={isSelected ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    isSelected
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
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={resetForm}>
          Cancel
        </Button>
        <Button
          className="bg-amber-500 hover:bg-amber-600"
          disabled={!file || !selectedProject || !recordingDate || isUploading}
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
