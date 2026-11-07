import DancingBanana from './DancingBanana'

export default function LevelUpModal({ isOpen, onClose, newLevel, newLevelName, onPlaySound }) {
  if (!isOpen) return null

  return (
    <div className="levelup-overlay" role="dialog" aria-modal="true">
      <div className="levelup-card">
        <div className="levelup-stars-burst">✨ 🌟 ⭐ 🌟 ✨</div>
        <div className="levelup-badge">LEVEL UP!</div>
        <h2 className="levelup-title">CONGRATULATIONS!</h2>
        <p className="levelup-sub">You have unlocked a brand new Jungle rank:</p>

        <div className="levelup-rank-display">
          <span className="rank-level-num">Level {newLevel}</span>
          <h3 className="rank-level-title">{newLevelName}</h3>
        </div>

        <div className="levelup-mascot-box">
          <DancingBanana mood="celebrating" />
        </div>

        <p className="levelup-cheer">
          Your monkey brain power is soaring! Keep playing to reach the Banana Legend status! 🍌👑
        </p>

        <button
          type="button"
          className="levelup-continue-btn"
          onClick={() => {
            if (onPlaySound) onPlaySound('click')
            onClose()
          }}
        >
          <span>CONTINUE ADVENTURE!</span>
          <span>🎉</span>
        </button>
      </div>
    </div>
  )
}
