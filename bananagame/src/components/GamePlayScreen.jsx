import { useEffect, useRef, useState } from 'react'
import DancingBanana from './DancingBanana'
import { playTimerTick, playVictory } from '../utils/audio'

export default function GamePlayScreen({
  currentQuestion,
  loadingQuestion,
  apiError,
  level = 'easy',
  score = 0,
  streak = 0,
  round = 1,
  maxRounds = 5,
  gameStatus,
  userAnswer,
  setUserAnswer,
  onSubmitAnswer,
  onNextQuestion,
  isAnswerSubmitted,
  onBackToDashboard,
  onCompleteSession,
  soundEnabled,
  setSoundEnabled,
  onPlaySound,
  lastPointsAwarded,
}) {
  const [hintIndex, setHintIndex] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [lives, setLives] = useState(3)
  const [isImageZoomed, setIsImageZoomed] = useState(false)

  // Timer states
  const [timerSeconds, setTimerSeconds] = useState(level === 'hard' ? 45 : 0)
  const timerRef = useRef(null)

  // Session Statistics Tracking
  const [sessionStats, setSessionStats] = useState({
    roundsAttempted: 0,
    correctCount: 0,
    incorrectCount: 0,
    totalPointsEarned: 0,
    startTime: Date.now(),
  })
  const [isSessionFinished, setIsSessionFinished] = useState(false)

  const HINTS = [
    'Look at the top row first! Find out what a single item is worth.',
    'Notice the signs carefully: is it adding (+), subtracting (-), or multiplying (×)?',
    'Look closely at the bananas: count how many bananas are in that bunch!',
    'Try substituting numbers 1 through 9 to see which one balances the equation!',
  ]

  // Timer Interval
  useEffect(() => {
    if (isPaused || isAnswerSubmitted || loadingQuestion || isSessionFinished) {
      clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (level === 'hard') {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            // Time up: auto-trigger wrong or timeout
            return 0
          }
          if (prev <= 10 && prev > 1 && soundEnabled) {
            playTimerTick(soundEnabled)
          }
          return prev - 1
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [isPaused, isAnswerSubmitted, loadingQuestion, isSessionFinished, level, soundEnabled])

  // Reset timer on fresh question
  useEffect(() => {
    setTimerSeconds(level === 'hard' ? 45 : 0)
  }, [currentQuestion, level])

  // Update session stats when answer is submitted
  useEffect(() => {
    if (isAnswerSubmitted) {
      if (gameStatus.type === 'correct') {
        setSessionStats((prev) => ({
          ...prev,
          roundsAttempted: prev.roundsAttempted + 1,
          correctCount: prev.correctCount + 1,
          totalPointsEarned: prev.totalPointsEarned + (lastPointsAwarded || 100),
        }))
      } else if (gameStatus.type === 'wrong') {
        setLives((prev) => Math.max(0, prev - 1))
        setSessionStats((prev) => ({
          ...prev,
          roundsAttempted: prev.roundsAttempted + 1,
          incorrectCount: prev.incorrectCount + 1,
        }))
      }
    }
  }, [isAnswerSubmitted, gameStatus.type, lastPointsAwarded])

  const handleKeypadPress = (digit) => {
    if (isAnswerSubmitted && gameStatus.type === 'correct') return
    if (onPlaySound) onPlaySound('click')
    setUserAnswer(String(digit))
  }

  const handleClearAnswer = () => {
    if (isAnswerSubmitted && gameStatus.type === 'correct') return
    if (onPlaySound) onPlaySound('click')
    setUserAnswer('')
  }

  const handleHintClick = () => {
    if (level === 'hard') return
    if (onPlaySound) onPlaySound('click')
    setShowHint(true)
    setHintIndex((prev) => (prev + 1) % HINTS.length)
  }

  const handleNext = () => {
    if (onPlaySound) onPlaySound('click')
    setShowHint(false)
    setHintIndex(0)

    // Check if max rounds for this session reached
    if (round >= maxRounds) {
      const durationSeconds = Math.round((Date.now() - sessionStats.startTime) / 1000)
      playVictory(soundEnabled)
      setIsSessionFinished(true)

      if (onCompleteSession) {
        onCompleteSession({
          rounds: maxRounds,
          correctAnswers: sessionStats.correctCount,
          incorrectAnswers: sessionStats.incorrectCount,
          pointsEarned: sessionStats.totalPointsEarned,
          durationSeconds,
          level,
        })
      }
      return
    }

    onNextQuestion()
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (isAnswerSubmitted && gameStatus.type === 'correct') return
    const timeTaken = level === 'hard' ? 45 - timerSeconds : timerSeconds
    onSubmitAnswer(userAnswer, timeTaken)
  }

  const handleRestartSession = () => {
    setIsSessionFinished(false)
    setSessionStats({
      roundsAttempted: 0,
      correctCount: 0,
      incorrectCount: 0,
      totalPointsEarned: 0,
      startTime: Date.now(),
    })
    setLives(3)
    onNextQuestion(true) // restart from round 1
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div className="gameplay-screen-wrapper">
      {/* Top HUD Bar */}
      <div className="gameplay-hud-bar">
        {/* Left: Back / Pause */}
        <div className="hud-left">
          <button
            type="button"
            className="hud-btn hud-back-btn"
            onClick={() => {
              if (onPlaySound) onPlaySound('click')
              onBackToDashboard()
            }}
          >
            🏠 Dashboard
          </button>
          <button
            type="button"
            className="hud-btn hud-pause-btn"
            onClick={() => {
              if (onPlaySound) onPlaySound('click')
              setIsPaused(true)
            }}
          >
            ⏸️ Pause
          </button>
        </div>

        {/* Center: Mission, Timer, Lives, Round */}
        <div className="hud-center">
          <span className={`hud-level-pill level-${level}`}>
            {level === 'hard' ? '🔥 Hard' : level === 'medium' ? '⚡ Medium' : '🌱 Easy'}
          </span>

          <span className="hud-round-pill">
            Round {round} / {maxRounds}
          </span>

          <span className={`hud-timer-pill ${level === 'hard' && timerSeconds <= 10 ? 'timer-urgent' : ''}`}>
            ⏱️ {formatTime(timerSeconds)}
          </span>

          {/* Lives Indicator (3 Hearts) */}
          <div className="hud-lives-pill" title={`${lives} hearts remaining`}>
            {[1, 2, 3].map((heart) => (
              <span key={heart} className={`heart-icon ${heart <= lives ? 'heart-alive' : 'heart-empty'}`}>
                {heart <= lives ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Score, Streak & Sound */}
        <div className="hud-right">
          <div className="hud-stat-pill">
            <span>Score:</span>
            <strong>🍌 {score.toLocaleString()}</strong>
            {lastPointsAwarded > 0 && isAnswerSubmitted && gameStatus.type === 'correct' && (
              <span className="floating-pts-badge">+{lastPointsAwarded} pts!</span>
            )}
          </div>

          <div className="hud-streak-pill">
            <span>🔥 {streak} Streak</span>
          </div>

          <button
            type="button"
            className="hud-sound-toggle"
            onClick={() => {
              const nextState = !soundEnabled
              setSoundEnabled(nextState)
              if (onPlaySound) onPlaySound('click')
            }}
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* Main Puzzle Arena */}
      <div className="gameplay-arena-grid">
        {/* Left Column: Mascot cheering with mood reactions */}
        <div className="arena-mascot-col">
          <DancingBanana
            mood={
              isAnswerSubmitted && gameStatus.type === 'correct'
                ? 'celebrating'
                : isAnswerSubmitted && gameStatus.type === 'wrong'
                  ? 'curious'
                  : showHint
                    ? 'thinking'
                    : 'dancing'
            }
            onTickle={() => {
              if (onPlaySound) onPlaySound('click')
            }}
          />
        </div>

        {/* Center Column: The Big Puzzle Image & Answer Controls */}
        <div className="arena-puzzle-col">
          {/* Status Message Pill */}
          <div className={`gameplay-status-pill ${gameStatus.type}`}>
            <span className="status-ico">
              {gameStatus.type === 'correct' ? '🎉' : gameStatus.type === 'wrong' ? '🍌' : '💡'}
            </span>
            <span className="status-text">{gameStatus.message}</span>
          </div>

          {/* Puzzle Image Stage */}
          <div className={`gameplay-image-stage ${isImageZoomed ? 'stage-zoomed' : ''}`}>
            {loadingQuestion ? (
              <div className="stage-loading-box">
                <span className="stage-spin-banana">🍌</span>
                <p>Fetching fresh puzzle from Banana API...</p>
              </div>
            ) : apiError ? (
              <div className="stage-error-box">
                <span>⚠️</span>
                <p>{apiError}</p>
                <button type="button" className="stage-retry-btn" onClick={onNextQuestion}>
                  Try Next Question 🍌
                </button>
              </div>
            ) : currentQuestion?.imageUrl ? (
              <div className="puzzle-img-container">
                <img
                  src={currentQuestion.imageUrl}
                  alt="Banana Puzzle"
                  className="main-puzzle-image"
                />
                {/* Zoom toggle button */}
                <button
                  type="button"
                  className="zoom-toggle-btn"
                  onClick={() => setIsImageZoomed((z) => !z)}
                  title={isImageZoomed ? 'Reset size' : 'Enlarge puzzle'}
                >
                  {isImageZoomed ? '🔍 Zoom Out' : '🔎 Zoom In'}
                </button>
              </div>
            ) : (
              <div className="stage-loading-box">
                <p>No puzzle loaded.</p>
                <button type="button" className="stage-retry-btn" onClick={onNextQuestion}>
                  Load Puzzle 🍌
                </button>
              </div>
            )}
          </div>

          {/* Hint Box (Easy & Medium) */}
          {showHint && level !== 'hard' && (
            <div className="clue-reveal-box">
              <span className="clue-tag">💡 Jungle Clue #{hintIndex + 1}:</span>
              <p>{HINTS[hintIndex]}</p>
            </div>
          )}

          {/* Keypad & Answer Entry */}
          <form className="gameplay-answer-panel" onSubmit={handleFormSubmit}>
            <div className="keypad-selection-row">
              <div className="keypad-header-row">
                <p className="keypad-prompt">Select the missing number (0 – 9):</p>
                <button
                  type="button"
                  className="keypad-clear-btn"
                  onClick={handleClearAnswer}
                  disabled={userAnswer === '' || (isAnswerSubmitted && gameStatus.type === 'correct')}
                >
                  Clear ✖
                </button>
              </div>

              <div className="keypad-buttons-grid">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
                  const isSelected = userAnswer === String(digit)
                  const isCorrectAnswer =
                    isAnswerSubmitted && currentQuestion?.solution !== undefined && digit === currentQuestion?.solution
                  const isWrongAnswer =
                    isAnswerSubmitted && isSelected && currentQuestion?.solution !== undefined && digit !== currentQuestion?.solution

                  return (
                    <button
                      key={digit}
                      type="button"
                      className={`arena-digit-btn ${isSelected ? 'digit-selected' : ''} ${isCorrectAnswer ? 'digit-correct' : ''} ${isWrongAnswer ? 'digit-wrong' : ''}`}
                      onClick={() => handleKeypadPress(digit)}
                      disabled={loadingQuestion || (isAnswerSubmitted && gameStatus.type === 'correct')}
                    >
                      {digit}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Answer Display & Action Buttons */}
            <div className="answer-actions-bar">
              <div className="answer-preview-chip">
                <span>Selected:</span>
                <strong>{userAnswer !== '' ? userAnswer : '?'}</strong>
              </div>

              {level !== 'hard' && (
                <button
                  type="button"
                  className="gameplay-hint-btn"
                  onClick={handleHintClick}
                  disabled={loadingQuestion}
                  title="Need a clue?"
                >
                  💡 Clue
                </button>
              )}

              {/* Submit Button */}
              {(!isAnswerSubmitted || gameStatus.type !== 'correct') && (
                <button
                  type="submit"
                  className="gameplay-submit-btn"
                  disabled={userAnswer === '' || loadingQuestion}
                >
                  <span>CHECK ANSWER</span>
                  <span>🍌</span>
                </button>
              )}

              {/* Next Question / Finish Session Button */}
              {isAnswerSubmitted && gameStatus.type === 'correct' && (
                <button
                  type="button"
                  className="gameplay-next-btn pulse-glow"
                  onClick={handleNext}
                  disabled={loadingQuestion}
                >
                  <span>{round >= maxRounds ? 'COMPLETE SESSION 🏆' : 'NEXT PUZZLE ➡️'}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* -------------------------------------------------------------
          PAUSE MODAL
      ------------------------------------------------------------- */}
      {isPaused && (
        <div className="pause-modal-overlay" role="dialog" aria-modal="true">
          <div className="pause-modal-card">
            <h2>⏸️ Jungle Adventure Paused</h2>
            <p>Take a deep breath and drink some water! Your score and streak are paused.</p>
            <div className="pause-actions">
              <button
                type="button"
                className="resume-btn"
                onClick={() => {
                  if (onPlaySound) onPlaySound('click')
                  setIsPaused(false)
                }}
              >
                ▶️ Resume Game
              </button>
              <button
                type="button"
                className="exit-to-dash-btn"
                onClick={() => {
                  if (onPlaySound) onPlaySound('click')
                  onBackToDashboard()
                }}
              >
                🏠 Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          PART 11: FULL SESSION RESULTS MODAL
      ------------------------------------------------------------- */}
      {isSessionFinished && (
        <div className="session-victory-overlay" role="dialog" aria-modal="true">
          <div className="session-victory-card">
            <div className="victory-crown-icon">👑</div>
            <h2>SESSION COMPLETED!</h2>
            <p className="victory-subtext">
              Fantastic problem-solving, Jungle Explorer! You conquered all {maxRounds} puzzles!
            </p>

            <div className="session-stats-breakdown">
              <div className="victory-stat-item">
                <span className="vstat-num">{maxRounds}</span>
                <span className="vstat-lbl">Questions Attempted</span>
              </div>
              <div className="victory-stat-item stat-green">
                <span className="vstat-num">{sessionStats.correctCount}</span>
                <span className="vstat-lbl">Correct Answers</span>
              </div>
              <div className="victory-stat-item stat-amber">
                <span className="vstat-num">{sessionStats.incorrectCount}</span>
                <span className="vstat-lbl">Incorrect Tries</span>
              </div>
              <div className="victory-stat-item stat-blue">
                <span className="vstat-num">
                  {maxRounds > 0
                    ? Math.round((sessionStats.correctCount / maxRounds) * 100)
                    : 100}%
                </span>
                <span className="vstat-lbl">Accuracy</span>
              </div>
            </div>

            <div className="session-reward-banner">
              <span>🍌 Points Earned in Session:</span>
              <strong>+{sessionStats.totalPointsEarned} pts</strong>
              <small>(Includes +100 Session Completion Bonus!)</small>
            </div>

            <div className="session-actions-row">
              <button
                type="button"
                className="victory-action-btn btn-again"
                onClick={handleRestartSession}
              >
                🎮 Play Another Session
              </button>
              <button
                type="button"
                className="victory-action-btn btn-dash"
                onClick={onBackToDashboard}
              >
                🏠 Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
