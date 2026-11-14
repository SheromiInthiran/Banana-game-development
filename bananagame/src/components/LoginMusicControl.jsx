import { useEffect, useRef, useState } from 'react'

export default function LoginMusicControl() {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    return () => audioRef.current?.pause()
  }, [])

  const toggleMusic = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    setHasError(false)
    try {
      await audio.play()
      setIsPlaying(true)
    } catch (error) {
      console.error('Could not play login background music:', error)
      setIsPlaying(false)
      setHasError(true)
    }
  }

  return (
    <div className="login-music-control">
      <audio
        ref={audioRef}
        src="/audio/edugamery-music-24.mp3"
        loop
        preload="none"
        onError={() => {
          setIsPlaying(false)
          setHasError(true)
        }}
      />
      <button
        type="button"
        className="login-music-button"
        onClick={toggleMusic}
        aria-pressed={isPlaying}
      >
        {isPlaying ? '⏸ Pause music' : '🎵 Play music'}
      </button>
      {hasError && <span className="login-music-error" role="status">Music could not be loaded.</span>}
    </div>
  )
}
