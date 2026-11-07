import { useEffect, useState } from 'react'

export default function DailyChallengeModal({
  isOpen,
  onClose,
  onStartDailyPuzzle,
  challengeStatus,
  onPlaySound,
}) {
  const [timeLeft, setTimeLeft] = useState(challengeStatus?.countdownMs || 3600000)

  useEffect(() => {
    setTimeLeft(challengeStatus?.countdownMs || 3600000)
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [challengeStatus])

  if (!isOpen) return null

  const hours = Math.floor(timeLeft / 3600000)
  const minutes = Math.floor((timeLeft % 3600000) / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)
  const formattedCountdown = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  const isCompleted = challengeStatus?.isCompletedToday

  return (
    <div className="daily-challenge-overlay" role="dialog" aria-modal="true">
      <div className="daily-challenge-card">
        <button
          type="button"
          className="daily-close-btn"
          onClick={() => {
            if (onPlaySound) onPlaySound('click')
            onClose()
          }}
        >
          ✖
        </button>

        <div className="daily-hero-badge">
          <span className="sun-star-ico">🌟</span>
          <span>DAILY JUNGLE QUEST</span>
          <span className="sun-star-ico">🌟</span>
        </div>

        <h2 className="daily-title">Today's Banana Challenge</h2>
        <p className="daily-subtitle">
          Complete your daily puzzle to earn <strong>+150 Bonus Bananas</strong> and keep your daily streak alive!
        </p>

        {/* Streak & Reward Badges */}
        <div className="daily-perks-row">
          <div className="perk-box">
            <span className="perk-icon">🎁</span>
            <strong>+150 Points</strong>
            <p>Daily Reward</p>
          </div>
          <div className="perk-box">
            <span className="perk-icon">🔥</span>
            <strong>{challengeStatus?.streak || 0} Days</strong>
            <p>Jungle Streak</p>
          </div>
          <div className="perk-box">
            <span className="perk-icon">⏳</span>
            <strong>{formattedCountdown}</strong>
            <p>Next Quest In</p>
          </div>
        </div>

        {/* Status Box */}
        <div className={`daily-status-box ${isCompleted ? 'is-completed' : 'is-ready'}`}>
          {isCompleted ? (
            <>
              <span className="status-ico">🎉</span>
              <div>
                <strong>Quest Completed for Today!</strong>
                <p>You have already harvested today's 150 points. Check back tomorrow for the next quest!</p>
              </div>
            </>
          ) : (
            <>
              <span className="status-ico">🍌</span>
              <div>
                <strong>Quest Available Right Now!</strong>
                <p>Solve today's banana puzzle to earn your daily bounty!</p>
              </div>
            </>
          )}
        </div>

        {/* Action Button */}
        <div className="daily-actions">
          {!isCompleted ? (
            <button
              type="button"
              className="daily-start-btn pulse-glow"
              onClick={() => {
                if (onPlaySound) onPlaySound('click')
                onStartDailyPuzzle()
              }}
            >
              <span>START DAILY QUEST</span>
              <span>🍌</span>
            </button>
          ) : (
            <button
              type="button"
              className="daily-done-btn"
              onClick={() => {
                if (onPlaySound) onPlaySound('click')
                onClose()
              }}
            >
              Back to Dashboard ✓
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
