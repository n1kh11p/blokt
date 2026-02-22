import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock, FileVideo, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { VideoPlayer } from '@/components/videos/video-player'
import { DeleteVideoButton } from '@/components/videos/delete-video-button'

interface VideoPageProps {
  params: Promise<{ id: string }>
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: video, error } = await (supabase as any)
    .from('videos')
    .select(`*`)
    .eq('video_id', id)
    .single()

  if (error || !video) {
    notFound()
  }

  const videoUrl = video.uri

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
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white break-all">
              {video.uri || 'Unnamed Video'}
            </h1>
          </div>
        </div>
        <DeleteVideoButton videoId={video.video_id} />
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
                <Calendar className="h-4 w-4 text-stone-400" />
                <div>
                  <p className="text-sm text-stone-500">Created At</p>
                  <p className="font-medium text-stone-900 dark:text-white">
                    {video.created_at ? new Date(video.created_at).toLocaleDateString() : 'Unknown Date'}
                  </p>
                </div>
              </div>

              {video.start && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-stone-400" />
                  <div>
                    <p className="text-sm text-stone-500">Start Time</p>
                    <p className="font-medium text-stone-900 dark:text-white">
                      {new Date(video.start).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {video.endtime && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-stone-400" />
                  <div>
                    <p className="text-sm text-stone-500">End Time</p>
                    <p className="font-medium text-stone-900 dark:text-white">
                      {new Date(video.endtime).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {videoUrl && (
                <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full gap-2 mt-2">
                    <Download className="h-4 w-4" />
                    Open URI
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
