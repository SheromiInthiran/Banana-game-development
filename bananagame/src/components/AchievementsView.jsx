import { useState } from 'react'
import { ALL_ACHIEVEMENTS } from '../utils/progression'

export default function AchievementsView({ unlockedBadges = [], onPlaySound }) {
  const [filter, setFilter] = useState('all') // 'all' | 'unlocked' | 'locked'

  const unlockedMap = new Map()
  unlockedBadges.forEach((b) => {
    unlockedMap.set(b.id, b)
  })

  const totalUnlocked = ALL_ACHIEVEMENTS.filter((a) => unlockedMap.has(a.id)).length

  const filteredBadges = ALL_ACHIEVEMENTS.filter((badge) => {
    const isUnlocked = unlockedMap.has(badge.id)
    if (filter === 'unlocked') return isUnlocked
    if (filter === 'locked') return !isUnlocked
    return true
  })

  return (
    <div className="achievements-view-container">
      {/* Banner */}
      <div className="achievements-header-banner">
        <div className="achievements-banner-icon">🏅</div>
        <div>
          <h2>MY JUNGLE ACHIEVEMENTS</h2>
          <p>Complete challenges, discover secrets, and collect all special adventure badges!</p>
        </div>
        <div className="achievements-counter-badge">
          <strong>
            {totalUnlocked} / {ALL_ACHIEVEMENTS.length}
          </strong>
          <span>Badges Earned</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="achievements-filters-row">
        <button
          type="button"
          className={`ach-filter-btn ${filter === 'all' ? 'filter-active' : ''}`}
          onClick={() => {
            if (onPlaySound) onPlaySound('click')
            setFilter('all')
          }}
        >
          🌟 All Badges ({ALL_ACHIEVEMENTS.length})
        </button>
        <button
          type="button"
          className={`ach-filter-btn ${filter === 'unlocked' ? 'filter-active' : ''}`}
          onClick={() => {
            if (onPlaySound) onPlaySound('click')
            setFilter('unlocked')
          }}
        >
          ✓ Unlocked ({totalUnlocked})
        </button>
        <button
          type="button"
          className={`ach-filter-btn ${filter === 'locked' ? 'filter-active' : ''}`}
          onClick={() => {
            if (onPlaySound) onPlaySound('click')
            setFilter('locked')
          }}
        >
          🔒 Locked ({ALL_ACHIEVEMENTS.length - totalUnlocked})
        </button>
      </div>

      {/* Grid of Badges */}
      <div className="achievements-grid">
        {filteredBadges.map((badge) => {
          const unlockedItem = unlockedMap.get(badge.id)
          const isUnlocked = Boolean(unlockedItem)

          return (
            <div
              key={badge.id}
              className={`achievement-card ${isUnlocked ? 'badge-is-unlocked' : 'badge-is-locked'}`}
            >
              <div className="badge-visual-wrapper">
                <span className="badge-icon-symbol">{badge.icon}</span>
                {isUnlocked && <span className="unlock-check-glow">✓</span>}
              </div>

              <div className="badge-details">
                <div className="badge-title-row">
                  <h4>{badge.title}</h4>
                  <span className={`status-tag ${isUnlocked ? 'tag-unlocked' : 'tag-locked'}`}>
                    {isUnlocked ? 'Unlocked ⭐' : 'Locked 🔒'}
                  </span>
                </div>
                <p className="badge-description">{badge.description}</p>
                <div className="badge-condition-box">
                  <span className="condition-lbl">Mission:</span>
                  <span className="condition-text">{badge.condition}</span>
                </div>
                <div className="badge-reward-line">
                  <span>Bonus Reward:</span>
                  <strong>+🍌 {badge.rewardPoints || 50} pts</strong>
                </div>
                {isUnlocked && (
                  <p className="unlocked-timestamp">
                    Earned on: {new Date(unlockedItem.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
