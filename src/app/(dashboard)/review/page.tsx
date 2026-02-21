'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquare,
} from 'lucide-react'

const mockVideos = [
  {
    id: '1',
    worker: 'John Smith',
    project: 'Downtown Tower',
    date: '2026-02-21',
    duration: '2:34:15',
    status: 'pending',
    tasksDetected: 4,
    alerts: 1,
  },
  {
    id: '2',
    worker: 'Mike Johnson',
    project: 'Harbor Bridge',
    date: '2026-02-21',
    duration: '3:12:45',
    status: 'reviewed',
    tasksDetected: 6,
    alerts: 0,
  },
  {
    id: '3',
    worker: 'David Lee',
    project: 'Metro Station',
    date: '2026-02-20',
    duration: '1:45:30',
    status: 'pending',
    tasksDetected: 3,
    alerts: 2,
  },
]

const mockTimeline = [
  { time: '00:00', label: 'Start of shift', type: 'start' },
  { time: '00:15', label: 'Electrical conduit work', type: 'task', duration: '45min' },
  { time: '01:02', label: 'Missing hard hat detected', type: 'alert' },
  { time: '01:05', label: 'Break', type: 'break', duration: '15min' },
  { time: '01:20', label: 'HVAC installation', type: 'task', duration: '30min' },
  { time: '01:52', label: 'Plumbing rough-in', type: 'task', duration: '42min' },
]

export default function ReviewPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(mockVideos[0])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Video Review</h1>
          <p className="text-stone-600 dark:text-stone-400">
            Review footage and validate AI-detected tasks
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="1">Downtown Tower</SelectItem>
              <SelectItem value="2">Harbor Bridge</SelectItem>
              <SelectItem value="3">Metro Station</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="today">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-stone-900">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="mx-auto h-16 w-16 opacity-50" />
                  <p className="mt-2 text-sm opacity-75">Video Player</p>
                  <p className="text-xs opacity-50">
                    {selectedVideo.worker} - {selectedVideo.project}
                  </p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-white/30">
                  <div className="h-full w-1/3 rounded-full bg-amber-500" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-white">00:45:32 / {selectedVideo.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-stone-200 dark:bg-stone-700" />
                <div className="space-y-4">
                  {mockTimeline.map((item, index) => (
                    <div key={index} className="relative flex gap-4 pl-10">
                      <div
                        className={`absolute left-2 h-4 w-4 rounded-full border-2 border-white dark:border-stone-900 ${
                          item.type === 'alert'
                            ? 'bg-red-500'
                            : item.type === 'task'
                            ? 'bg-amber-500'
                            : item.type === 'break'
                            ? 'bg-stone-400'
                            : 'bg-green-500'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-stone-500">
                              {item.time}
                            </span>
                            <span className="font-medium text-stone-900 dark:text-white">
                              {item.label}
                            </span>
                            {item.type === 'alert' && (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          {item.duration && (
                            <span className="text-sm text-stone-500">{item.duration}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Reviews</CardTitle>
              <CardDescription>Videos awaiting review</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${
                    selectedVideo.id === video.id
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10'
                      : 'border-stone-200 hover:border-stone-300 dark:border-stone-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-stone-900 dark:text-white">
                        {video.worker}
                      </p>
                      <p className="text-sm text-stone-500">{video.project}</p>
                    </div>
                    <Badge
                      variant={video.status === 'pending' ? 'outline' : 'default'}
                      className={
                        video.status === 'reviewed'
                          ? 'bg-green-100 text-green-700'
                          : ''
                      }
                    >
                      {video.status === 'pending' ? (
                        <Clock className="mr-1 h-3 w-3" />
                      ) : (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      )}
                      {video.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-stone-500">
                    <span>{video.duration}</span>
                    <span>{video.tasksDetected} tasks</span>
                    {video.alerts > 0 && (
                      <span className="flex items-center gap-1 text-red-500">
                        <AlertTriangle className="h-3 w-3" />
                        {video.alerts} alerts
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Assistant</CardTitle>
              <CardDescription>Ask questions about this footage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-stone-200 p-4 dark:border-stone-800">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-amber-500" />
                  <div className="flex-1">
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      Ask me anything about this video, such as:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs text-stone-500">
                      <li>• &quot;What tasks were completed?&quot;</li>
                      <li>• &quot;When did the safety violation occur?&quot;</li>
                      <li>• &quot;How long was the lunch break?&quot;</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Type your question..."
                    className="w-full rounded-lg border border-stone-200 bg-transparent px-3 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-stone-700"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
