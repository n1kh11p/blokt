'use client'

interface VideoPlayerProps {
  url: string
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
      <video
        controls
        className="w-full h-full max-h-[70vh] object-contain bg-black"
        preload="metadata"
        playsInline
      >
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
