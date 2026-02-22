import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Video, Calendar, Clock, FileVideo } from 'lucide-react'
import { getUserVideos } from '@/lib/actions/videos'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Removed formatFileSize and statusColors since no longer in schema

export default async function VideosPage() {
  const { data: videos, error } = await getUserVideos()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Videos</h1>
          <p className="text-stone-600">
            Upload and manage your field footage
          </p>
        </div>
        <Link href="/upload">
          <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
            <Video className="h-4 w-4" />
            Upload Video
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {videos && videos.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Video className="h-12 w-12 text-stone-400" />
            <h3 className="mt-4 text-lg font-medium text-stone-900">
              No videos uploaded
            </h3>
            <p className="mt-2 text-sm text-stone-500">
              Upload your first field video to get started
            </p>
            <div className="mt-4">
              <Link href="/upload">
                <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
                  <Video className="h-4 w-4" />
                  Upload Video
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {videos?.map((video) => (
          <Link key={video.video_id} href={`/videos/${video.video_id}`}>
            <Card className="transition-all hover:shadow-md hover:border-amber-300:border-amber-700 cursor-pointer h-full">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-stone-100 p-3">
                    <FileVideo className="h-6 w-6 text-stone-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-stone-900 truncate">
                        {video.uri || 'Unnamed Video'}
                      </h3>
                    </div>

                    <p className="text-sm text-stone-500 mt-1 truncate">
                      {video.uri}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-stone-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {video.created_at ? new Date(video.created_at).toLocaleDateString() : 'Unknown Date'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {video.start ? `Start: ${new Date(video.start).toLocaleTimeString()}` : ''}
                      </div>
                    </div>
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
