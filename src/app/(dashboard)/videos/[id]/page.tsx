import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock, User, FileVideo, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getVideoUrl } from '@/lib/actions/videos'
import { VideoPlayer } from '@/components/videos/video-player'
import { DeleteVideoButton } from '@/components/videos/delete-video-button'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

interface VideoPageProps {
  params: Promise<{ id: string }>
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: video, error } = await (supabase as any)
    .from('video_uploads')
    .select(`
      *,
      worker:profiles!worker_id(id, full_name, email),
      project:projects!project_id(id, name)
    `)
    .eq('id', id)
    .single()

  if (error || !video) {
    notFound()
  }

  const videoUrl = await getVideoUrl(video.file_path)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/videos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
              {video.file_name}
            </h1>
            <Badge className={statusColors[video.processing_status]}>
              {video.processing_status}
            </Badge>
          </div>
          <p className="text-stone-600 dark:text-stone-400">
            {video.project?.name}
          </p>
        </div>
        <DeleteVideoButton videoId={video.id} projectId={video.project_id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {videoUrl ? (
                <VideoPlayer url={videoUrl} />
              ) : (
                <div className="flex items-center justify-center h-96 bg-stone-100 dark:bg-stone-800 rounded-lg">
                  <div className="text-center">
                    <FileVideo className="h-12 w-12 text-stone-400 mx-auto" />
                    <p className="mt-2 text-stone-500">Video not available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Video Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-stone-400" />
                <div>
                  <p className="text-sm text-stone-500">Uploaded by</p>
                  <p className="font-medium text-stone-900 dark:text-white">
                    {video.worker?.full_name || video.worker?.email || 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-stone-400" />
                <div>
                  <p className="text-sm text-stone-500">Upload Date</p>
                  <p className="font-medium text-stone-900 dark:text-white">
                    {new Date(video.upload_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {video.recording_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-stone-400" />
                  <div>
                    <p className="text-sm text-stone-500">Recording Date</p>
                    <p className="font-medium text-stone-900 dark:text-white">
                      {new Date(video.recording_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-stone-400" />
                <div>
                  <p className="text-sm text-stone-500">File Size</p>
                  <p className="font-medium text-stone-900 dark:text-white">
                    {formatFileSize(video.file_size)}
                  </p>
                </div>
              </div>

              {videoUrl && (
                <a href={videoUrl} download={video.file_name} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full gap-2 mt-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>

          {video.tagged_tasks && video.tagged_tasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tagged Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {video.tagged_tasks.map((taskId: string, index: number) => (
                    <div
                      key={taskId}
                      className="text-sm px-3 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg"
                    >
                      Task {index + 1}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
