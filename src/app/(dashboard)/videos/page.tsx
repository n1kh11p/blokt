import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Video, Calendar, Clock, FileVideo } from 'lucide-react'
import { getUserVideos } from '@/lib/actions/videos'
import { UploadVideoDialog } from '@/components/videos/upload-video-dialog'
import Link from 'next/link'

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

export default async function VideosPage() {
  const { data: videos, error } = await getUserVideos()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white">My Videos</h1>
          <p className="text-stone-600 dark:text-stone-400">
            Upload and manage your field footage
          </p>
        </div>
        <UploadVideoDialog />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {videos && videos.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-stone-400" />
            <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-white">
              No videos uploaded
            </h3>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              Upload your first field video to get started
            </p>
            <div className="mt-4">
              <UploadVideoDialog />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {videos?.map((video) => (
          <Link key={video.id} href={`/videos/${video.id}`}>
            <Card className="transition-all hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 cursor-pointer h-full">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-stone-100 p-3 dark:bg-stone-800">
                    <FileVideo className="h-6 w-6 text-stone-600 dark:text-stone-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-stone-900 dark:text-white truncate">
                        {video.file_name}
                      </h3>
                      <Badge className={statusColors[video.processing_status]}>
                        {video.processing_status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                      {video.project?.name || 'Unknown project'}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-stone-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(video.upload_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatFileSize(video.file_size)}
                      </div>
                    </div>

                    {video.tagged_tasks && video.tagged_tasks.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-stone-400">
                          {video.tagged_tasks.length} task{video.tagged_tasks.length > 1 ? 's' : ''} tagged
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
