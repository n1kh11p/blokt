import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Clock, FileVideo, Download, Sparkles, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { processVideoAnnotations, getUserTasks } from '@/lib/actions/upload'
import { revalidatePath } from 'next/cache'
import { VideoPlayer } from '@/components/videos/video-player'
import { DeleteVideoButton } from '@/components/videos/delete-video-button'
import { AnalyzeVideoButton } from '@/components/videos/analyze-video-button'
import { InteractiveTaskChecklist } from '@/components/videos/interactive-task-checklist'

interface VideoPageProps {
  params: Promise<{ id: string }>
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: videoData, error } = await (supabase as any)
    .from('videos')
    .select('*')
    .eq('video_id', id)
    .single()

  if (error || !videoData) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900">Video not found</h2>
          <p className="mt-2 text-stone-600">The video you are looking for does not exist.</p>
          <Link href="/videos" className="mt-4 inline-block text-amber-600 hover:underline">
            ← Back to Videos
          </Link>
        </div>
      </div>
    )
  }

  const { data: tasksData } = await getUserTasks(videoData.user_id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const video = videoData as any
  const linkedTasks = (tasksData || []) as any[]

  // Handle local vs remote urls securely
  const videoUrl = video.uri;

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
            <h1 className="text-2xl font-bold text-stone-900 break-all">
              {video.uri?.split('/').pop() || 'Unnamed Video'}
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
                <div className="flex items-center justify-center h-96 bg-stone-100 rounded-lg">
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
                  <p className="font-medium text-stone-900">
                    {video.created_at ? new Date(video.created_at).toISOString().split('T')[0] : 'Unknown Date'}
                  </p>
                </div>
              </div>

              {video.start && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-stone-400" />
                  <div>
                    <p className="text-sm text-stone-500">Start Time</p>
                    <p className="font-medium text-stone-900">
                      {video.start ? new Date(video.start).toISOString().replace('T', ' ').substring(0, 19) : 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {video.endtime && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-stone-400" />
                  <div>
                    <p className="text-sm text-stone-500">End Time</p>
                    <p className="font-medium text-stone-900">
                      {video.endtime ? new Date(video.endtime).toISOString().replace('T', ' ').substring(0, 19) : 'N/A'}
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

          {/* Connected Tasks Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Worker's Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {linkedTasks.length > 0 ? (
                <ul className="space-y-3">
                  {linkedTasks.map((t: any) => (
                    <li key={t.id} className="flex justify-between items-center bg-stone-50 border border-stone-100 p-3 rounded-md">
                      <div>
                        <p className="font-medium text-stone-900">{t.name}</p>
                        <p className="text-sm text-stone-500">{t.description || 'No description'}</p>
                      </div>
                      <Badge variant={t.status === 'completed' ? 'default' : 'secondary'} className={t.status === 'completed' ? 'bg-green-600 hover:bg-green-700' : ''}>
                        {t.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-stone-500 text-sm">No tasks assigned to this worker.</p>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: AI Analysis */}
        <div className="space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                AI Task Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pt-6">
              <p className="text-sm text-stone-600 mb-6 flex-1">
                Our vision AI will scan the video annotations and automatically verify whether the required steps for the listed tasks have been completed.
              </p>

              <div className="w-full mb-8">
                <AnalyzeVideoButton videoId={video.video_id} />
              </div>

              <div className="border-t pt-6 h-full">
                <InteractiveTaskChecklist videoId={video.video_id} tasks={linkedTasks} suggestedTaskIds={video.ai_suggested_tasks} />
              </div>
            </CardContent>
          </Card>
        </div>

      </div >
    </div >
  )
}
