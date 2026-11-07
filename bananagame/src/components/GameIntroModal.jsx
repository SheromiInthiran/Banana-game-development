import DancingBanana from './DancingBanana'

export default function GameIntroModal({
  isOpen,
  onClose,
  onStartGame,
  selectedLevel,
  setSelectedLevel,
  playerPoints = 0,
  playerLevelName = 'Banana Beginner',
  onPlaySound,
}) {
  if (!isOpen) return null

  const handleLevelSelect = (lvl) => {
    if (onPlaySound) onPlaySound('click')
    setSelectedLevel(lvl)
  }

  const handleStart = () => {
    if (onPlaySound) onPlaySound('click')
    onStartGame(selectedLevel)
  }

  return (
    <div className="game-intro-overlay" role="dialog" aria-modal="true">
      <div className="game-intro-card">
        {/* Close Button */}
        <button
          type="button"
          className="intro-close-btn"
          onClick={() => {
            if (onPlaySound) onPlaySound('click')
            onClose()
          }}
          title="Close"
        >
          ✖
        </button>

        {/* Header Mascot Banner */}
        <div className="intro-header-row">
          <div className="intro-mascot-wrapper">
            <DancingBanana mood="dancing" />
          </div>
          <div className="intro-title-col">
            <div className="intro-badge">⭐ JUNGLE ADVENTURE ⭐</div>
            <h2 className="intro-title">Ready to Test Your Monkey Brain Power?</h2>
            <p className="intro-subtitle">
              Solve real banana equations, collect golden bunches, unlock badges, and become the Jungle Champion!
            </p>
            <div className="intro-stats-preview">
              <span className="stat-pill">🍌 {playerPoints} Points</span>
              <span className="stat-pill">🌴 {playerLevelName}</span>
            </div>
          </div>
        </div>

        {/* 1. CHOOSE YOUR DIFFICULTY LEVEL */}
        <div className="level-selection-section">
          <h3 className="section-title">
            <span>🎮</span> Select Your Adventure Level:
          </h3>
          <div className="level-cards-grid">
            {/* EASY LEVEL */}
            <div
              className={`level-card easy-card ${selectedLevel === 'easy' ? 'active-level' : ''}`}
              onClick={() => handleLevelSelect('easy')}
            >
              <div className="level-card-top">
                <span className="level-icon">🌱</span>
                <span className="level-tag">1x Points</span>
              </div>
              <h4>EASY LEVEL</h4>
              <p className="level-desc">Comfortable puzzles with helpful clues. Perfect for starting out!</p>
              <ul className="level-features">
                <li>✅ Unlimited friendly hints</li>
                <li>✅ +10 points base</li>
                <li>✅ Gentle practice</li>
              </ul>
            </div>

            {/* MEDIUM LEVEL */}
            <div
              className={`level-card medium-card ${selectedLevel === 'medium' ? 'active-level' : ''}`}
              onClick={() => handleLevelSelect('medium')}
            >
              <div className="level-card-top">
                <span className="level-icon">🌴</span>
                <span className="level-tag">1.25x Points</span>
              </div>
              <h4>MEDIUM LEVEL</h4>
              <p className="level-desc">Encourages logical thinking and smart deduction.</p>
              <ul className="level-features">
                <li>⚡ 1 hint per puzzle</li>
                <li>⚡ +13 points base</li>
                <li>⚡ Streak bonuses active</li>
              </ul>
            </div>

            {/* HARD LEVEL */}
            <div
              className={`level-card hard-card ${selectedLevel === 'hard' ? 'active-level' : ''}`}
              onClick={() => handleLevelSelect('hard')}
            >
              <div className="level-card-top">
                <span className="level-icon">🔥</span>
                <span className="level-tag">1.5x Points</span>
              </div>
              <h4>HARD LEVEL</h4>
              <p className="level-desc">Advanced challenge for true jungle math champions!</p>
              <ul className="level-features">
                <li>🏆 No hints allowed</li>
                <li>🏆 +15 points base</li>
                <li>🏆 Unlocks Puzzle Master badge</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 2. HOW TO PLAY & RULES */}
        <div className="how-to-play-section">
          <h3 className="section-title">
            <span>📖</span> How to Play in 4 Simple Steps:
          </h3>
          <div className="steps-grid">
            <div className="step-card">
              <span className="step-num">1</span>
              <span className="step-emoji">🔍</span>
              <strong>Look at the Puzzle</strong>
              <p>Find the value of each banana group in the equation.</p>
            </div>
            <div className="step-card">
              <span className="step-num">2</span>
              <span className="step-emoji">🧮</span>
              <strong>Calculate the Number</strong>
              <p>Deduce the missing number from 0 to 9.</p>
            </div>
            <div className="step-card">
              <span className="step-num">3</span>
              <span className="step-emoji">🍌</span>
              <strong>Tap Your Answer</strong>
              <p>Press the keypad number and hit Submit.</p>
            </div>
            <div className="step-card">
              <span className="step-num">4</span>
              <span className="step-emoji">⭐</span>
              <strong>Earn & Level Up!</strong>
              <p>Score bonus points for first attempts and streaks.</p>
            </div>
          </div>
        </div>

        {/* 3. START BUTTON */}
        <div className="intro-actions-row">
          <button type="button" className="start-adventure-btn" onClick={handleStart}>
            <span>START ADVENTURE!</span>
            <span className="btn-arrow-ico">🚀 🍌</span>
          </button>
        </div>
      </div>
    </div>
  )
}
