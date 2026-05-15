import { useRef, useEffect, useState } from 'react'

interface OptimizedVideoProps {
  src: string
  posterSrc: string
  alt?: string
  className?: string
  autoPlay?: boolean
  priority?: boolean
}

export function OptimizedVideo({
  src, posterSrc, alt = '',
  className = '', autoPlay = false, priority = false,
}: OptimizedVideoProps) {
  const ref = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [load, setLoad] = useState(priority)

  useEffect(() => {
    if (priority) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setLoad(true); obs.disconnect() } },
      { rootMargin: '300px' }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [priority])

  useEffect(() => {
    if (!load || !videoRef.current || !autoPlay) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!videoRef.current) return
        e.isIntersecting
          ? videoRef.current.play().catch(() => {})
          : videoRef.current.pause()
      },
      { threshold: 0.25 }
    )
    obs.observe(videoRef.current)
    return () => obs.disconnect()
  }, [load, autoPlay])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {!load && (
        <img
          src={posterSrc}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {load && (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={src}
          autoPlay={autoPlay}
          muted playsInline loop
          preload={priority ? 'metadata' : 'none'}
          poster={posterSrc}
          onCanPlay={() => {
            if (autoPlay) videoRef.current?.play().catch(() => {})
          }}
        />
      )}
    </div>
  )
}
