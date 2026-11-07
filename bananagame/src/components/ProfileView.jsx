import { useState } from 'react'
import { calculateLevel, ALL_ACHIEVEMENTS } from '../utils/progression'
import { updatePlayerProfile } from '../utils/apiService'
import { playClick, playCorrect } from '../utils/audio'

const AVATAR_OPTIONS = ['🍌', '🐒', '🌴', '🦁', '🦜', '🐘', '🐯', '🐸', '🐨', '🦊', '👑', '⭐']

export default function ProfileView({
  playerProfile,
  onUpdatePlayerProfile,
  soundEnabled = true,
  onOpenShop,
  onOpenPlay,
}) {
  const [nicknameInput, setNicknameInput] = useState(playerProfile?.nickname || '')
  const [selectedAvatar, setSelectedAvatar] = useState(playerProfile?.avatar || '🍌')
  const [isSaving, setIsSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState(null)

  const levelInfo = calculateLevel(playerProfile?.xp || playerProfile?.totalPoints || 0)

  const completed = Number(playerProfile?.completedGames || 0)
  const correct = Number(playerProfile?.correctAnswers || 0)
  const accuracy = completed > 0 ? Math.round((correct / completed) * 100) : 100
  const totalPoints = Number(playerProfile?.totalPoints || 0)
  const streak = Number(playerProfile?.streak || 0)
  const highestStreak = Number(playerProfile?.highestStreak || streak || 0)
  const bestScore = Number(playerProfile?.bestScore || 0)

  const achievements = Array.isArray(playerProfile?.achievements) ? playerProfile.achievements : []
  const history = Array.isArray(playerProfile?.history) ? playerProfile.history : []
  const sessions = Array.isArray(playerProfile?.sessions) ? playerProfile.sessions : []

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    const trimmed = nicknameInput.trim()
    if (!trimmed || trimmed.length < 2) {
      setStatusMsg({ type: 'error', text: 'Nickname must be at least 2 characters long!' })
      return
    }

    setIsSaving(true)
    playClick(soundEnabled)

    const updated = await updatePlayerProfile(playerProfile.id, {
      nickname: trimmed,
      avatar: selectedAvatar,
    })

    setIsSaving(false)
    if (updated) {
      playCorrect(soundEnabled)
      setStatusMsg({ type: 'success', text: 'Jungle Explorer profile updated successfully!' })
      onUpdatePlayerProfile({
        ...playerProfile,
        nickname: trimmed,
        avatar: selectedAvatar,
      })
    } else {
      setStatusMsg({ type: 'error', text: 'Could not save profile. Please try again.' })
    }
  }

  return (
    <div className="profile-view-container">
      {/* Top Profile Hero Card */}
      <div className="profile-hero-card">
        <div className="profile-avatar-large-box">
          <div className="avatar-bubble-large">{selectedAvatar}</div>
          <span className="profile-rank-tag">Level {levelInfo.level}</span>
        </div>

        <div className="profile-details-col">
          <div className="profile-title-row">
            <h2>{playerProfile?.nickname || 'Jungle Explorer'}</h2>
            <span className="profile-level-badge">
              {levelInfo.icon} {levelInfo.levelName}
            </span>
          </div>
          <p className="profile-id-subtext">
            Explorer ID: <strong>@{playerProfile?.id}</strong> • Member of Banana Jungle
          </p>

          {/* Level Progress */}
          <div className="profile-xp-progress-bar">
            <div className="progress-label-row">
              <span>{levelInfo.levelName}</span>
              <span>
                {levelInfo.currentXp} / {levelInfo.nextLevelXp} XP ({levelInfo.progressPercent}%)
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
            {levelInfo.neededForNext > 0 && (
              <span className="needed-xp-hint">
                ✨ Earn <strong>{levelInfo.neededForNext}</strong> more points to reach next level!
              </span>
            )}
          </div>
        </div>

        {/* Quick Action buttons */}
        <div className="profile-quick-actions">
          <button type="button" className="profile-action-btn primary-btn-pulse" onClick={onOpenPlay}>
            🎮 Play Game
          </button>
          <button type="button" className="profile-action-btn secondary-btn" onClick={onOpenShop}>
            🛍️ Jungle Shop
          </button>
        </div>
      </div>

      {/* Statistics 4-Grid */}
      <div className="profile-stats-grid">
        <div className="stat-box box-gold">
          <div className="stat-box-icon">🍌</div>
          <div className="stat-box-content">
            <span className="stat-box-number">{totalPoints.toLocaleString()}</span>
            <span className="stat-box-label">Total Points</span>
          </div>
        </div>

        <div className="stat-box box-blue">
          <div className="stat-box-icon">🎯</div>
          <div className="stat-box-content">
            <span className="stat-box-number">{accuracy}%</span>
            <span className="stat-box-label">Accuracy ({correct}/{completed})</span>
          </div>
        </div>

        <div className="stat-box box-orange">
          <div className="stat-box-icon">🔥</div>
          <div className="stat-box-content">
            <span className="stat-box-number">{highestStreak}</span>
            <span className="stat-box-label">Highest Streak (Current: {streak})</span>
          </div>
        </div>

        <div className="stat-box box-purple">
          <div className="stat-box-icon">🏆</div>
          <div className="stat-box-content">
            <span className="stat-box-number">{bestScore}</span>
            <span className="stat-box-label">Best Session Score</span>
          </div>
        </div>
      </div>

      {/* Profile Customizer Form */}
      <div className="profile-editor-card">
        <h3>✏️ Customize Your Explorer Identity</h3>
        <p>Choose your jungle display nickname and favorite avatar:</p>

        {statusMsg && (
          <div className={`status-bubble-msg ${statusMsg.type}`}>
            {statusMsg.type === 'error' ? '⚠️ ' : '🎉 '}
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="profile-form">
          <div className="form-group-row">
            <label htmlFor="prof-nickname">Display Nickname:</label>
            <input
              id="prof-nickname"
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              maxLength={24}
              placeholder="Enter your cool nickname"
              className="game-input banana-input"
            />
          </div>

          <div className="avatar-picker-section">
            <span className="picker-label">Pick Avatar Mascot:</span>
            <div className="avatar-options-row">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  type="button"
                  className={`avatar-choice-btn ${selectedAvatar === av ? 'avatar-selected' : ''}`}
                  onClick={() => {
                    playClick(soundEnabled)
                    setSelectedAvatar(av)
                  }}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="game-button btn-primary btn-banana-primary save-profile-btn"
            disabled={isSaving}
          >
            {isSaving ? 'Saving Changes...' : 'Save Explorer Profile ✨'}
          </button>
        </form>
      </div>

      {/* Unlocked Badges Showcase */}
      <div className="profile-achievements-card">
        <div className="card-heading-row">
          <h3>🏅 Unlocked Achievements ({achievements.length}/{ALL_ACHIEVEMENTS.length})</h3>
        </div>

        <div className="profile-badges-flex">
          {ALL_ACHIEVEMENTS.map((ach) => {
            const unlocked = achievements.find((a) => a.id === ach.id)
            return (
              <div
                key={ach.id}
                className={`profile-badge-item ${unlocked ? 'badge-earned' : 'badge-locked'}`}
                title={unlocked ? `Unlocked: ${ach.description}` : `Locked: ${ach.condition}`}
              >
                <div className="badge-icon-circ">{ach.icon}</div>
                <strong className="badge-name">{ach.title}</strong>
                <span className="badge-status-text">
                  {unlocked ? '✓ Unlocked' : '🔒 Locked'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Game Sessions & History */}
      <div className="profile-history-card">
        <h3>📜 Recent Game Sessions</h3>
        {sessions.length === 0 ? (
          <div className="empty-history-tip">
            <span>🎮</span>
            <p>No completed game sessions yet! Click <strong>Play Game</strong> to start your first adventure!</p>
          </div>
        ) : (
          <div className="sessions-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Difficulty</th>
                  <th>Questions</th>
                  <th>Correct</th>
                  <th>Accuracy</th>
                  <th>Points Earned</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 8).map((sess) => (
                  <tr key={sess.id}>
                    <td>{new Date(sess.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`diff-pill pill-${sess.level || 'easy'}`}>
                        {sess.level || 'easy'}
                      </span>
                    </td>
                    <td>{sess.rounds}</td>
                    <td>{sess.correctAnswers}</td>
                    <td><strong>{sess.accuracy}%</strong></td>
                    <td className="points-cell">+🍌 {sess.pointsEarned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
