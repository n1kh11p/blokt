'use client'

interface VideoPlayerProps {
  url: string
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video
        src={url}
        controls
        className="w-full h-full"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
