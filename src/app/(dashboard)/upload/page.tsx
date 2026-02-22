'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Upload, CheckCircle2, Loader2, Link as LinkIcon } from 'lucide-react'

const mockTasks = [
  { id: '1', name: 'Electrical conduit installation' },
  { id: '2', name: 'HVAC ductwork - Level 3' },
  { id: '3', name: 'Concrete pour - Foundation B' },
  { id: '4', name: 'Steel framing - Section 4' },
  { id: '5', name: 'Plumbing rough-in' },
  { id: '6', name: 'Fire suppression system' },
]

export default function UploadPage() {
  const [uri, setUri] = useState('')
  const [start, setStart] = useState('')
  const [endtime, setEndtime] = useState('')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)

  const toggleTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleUpload = async () => {
    if (!uri) return

    setIsUploading(true)

    const formData = new FormData()
    formData.append('uri', uri)
    if (start) formData.append('start', new Date(start).toISOString())
    if (endtime) formData.append('endtime', new Date(endtime).toISOString())

    // In the future this could save mockTasks to an API endpoint relation

    const { createVideoRecord } = await import('@/lib/actions/videos')
    await createVideoRecord(formData)

    setIsUploading(false)
    setUploadComplete(true)
  }

  const resetForm = () => {
    setUri('')
    setStart('')
    setEndtime('')
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
            <CardTitle>Video Details</CardTitle>
            <CardDescription>
              Provide the URI for your bodycam footage or video
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="uri">Video URI / URL *</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-stone-400" />
                <Input
                  id="uri"
                  placeholder="https://example.com/video.mp4"
                  className="pl-9"
                  value={uri}
                  onChange={(e) => setUri(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

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
          <div className="flex flex-wrap gap-2">
            {mockTasks.map((task) => {
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
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={resetForm}>
          Cancel
        </Button>
        <Button
          className="bg-amber-500 hover:bg-amber-600"
          disabled={!uri || isUploading}
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
