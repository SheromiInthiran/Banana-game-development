import { useEffect, useState } from 'react'

const CONFETTI_PIECES = Array.from({ length: 35 }).map((_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  color: [
    '#ff4d4d',
    '#ffda44',
    '#55d955',
    '#4da6ff',
    '#ff70a6',
    '#ff9f43',
    '#a55eea',
  ][i % 7],
  size: 8 + (i % 8) * 2,
  delay: `${(i % 10) * 0.08}s`,
  duration: `${1.6 + (i % 5) * 0.3}s`,
  shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'square' : 'strip',
  rotation: `${(i * 37) % 360}deg`,
}))

export default function ConfettiEffect({ active }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (active) {
      const showTimer = setTimeout(() => setVisible(true), 0)
      const hideTimer = setTimeout(() => setVisible(false), 2600)
      return () => {
        clearTimeout(showTimer)
        clearTimeout(hideTimer)
      }
    }
    const hideTimer = setTimeout(() => setVisible(false), 0)
    return () => clearTimeout(hideTimer)
  }, [active])

  if (!visible) return null

  return (
    <div className="confetti-container" aria-hidden="true">
      {CONFETTI_PIECES.map((p) => (
        <span
          key={p.id}
          className={`confetti-piece ${p.shape}`}
          style={{
            left: p.left,
            backgroundColor: p.color,
            width: `${p.size}px`,
            height: p.shape === 'strip' ? `${p.size * 2.2}px` : `${p.size}px`,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotation})`,
          }}
        />
      ))}
    </div>
  )
}
