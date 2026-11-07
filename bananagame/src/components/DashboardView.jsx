import { useState } from 'react'
import { calculateLevel } from '../utils/progression'

const AVATAR_OPTIONS = ['🍌', '🐒', '🌴', '🐯', '🦁', '🐘', '🦜', '👑', '🐨', '🦊', '⭐', '✨']

export default function DashboardView({
  playerProfile,
  onOpenPlayModal,
  onOpenDailyModal,
  onNavigateTab,
  onUpdateProfile,
  onLogout,
  soundEnabled,
  setSoundEnabled,
  reducedMotion,
  setReducedMotion,
  onPlaySound,
  leaderboardPreview = [],
}) {
  const [editingNickname, setEditingNickname] = useState(false)
  const [nicknameInput, setNicknameInput] = useState(playerProfile?.nickname || 'Jungle Explorer')
  const [selectedAvatar, setSelectedAvatar] = useState(playerProfile?.avatar || '🍌')
  const [profileSavedMsg, setProfileSavedMsg] = useState(false)

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (onPlaySound) onPlaySound('click')
    const trimmed = nicknameInput.trim().slice(0, 24)
    if (!trimmed) return
    await onUpdateProfile({ nickname: trimmed, avatar: selectedAvatar })
    setEditingNickname(false)
    setProfileSavedMsg(true)
    setTimeout(() => setProfileSavedMsg(false), 2200)
  }

  const {
    totalPoints = 0,
    xp = 0,
    completedGames = 0,
    correctAnswers = 0,
    streak = 0,
    highestStreak = streak || 0,
    achievements = [],
    history = [],
    dailyChallenge = { streak: 0, lastCompletedDate: '' },
    rank = 1,
  } = playerProfile || {}

  const levelInfo = calculateLevel(xp || totalPoints || 0)

  // Daily challenge status
  const todayStr = new Date().toISOString().slice(0, 10)
  const isDailyDone = dailyChallenge.lastCompletedDate === todayStr

  return (
    <div className="dashboard-sections-container">
      {/* 1. WELCOME SECTION WITH ANIMATED MASCOT */}
      <section className="dash-welcome-card">
        <div className="welcome-mascot-box">
          <div className="welcome-mini-mascot">🍌</div>
          <span className="welcome-mascot-name">Benny</span>
        </div>

        <div className="welcome-text-col">
          <div className="welcome-tag">🌴 BANANA ADVENTURE PLATFORM 🌴</div>
          <h2 className="welcome-greeting">
            Welcome back, {playerProfile?.nickname || 'Jungle Explorer'}! {playerProfile?.avatar || '🍌'}
          </h2>
          <p className="welcome-motto">
            Solve math puzzles, earn golden bananas, unlock cool hats & characters, and rise up the leaderboard!
          </p>
          <div className="quick-action-pills">
            <span className="pill-badge pill-rank">🏆 Global Rank #{rank}</span>
            <span className="pill-badge pill-lvl">
              {levelInfo.icon} Level {levelInfo.level}: {levelInfo.levelName}
            </span>
            <span className="pill-badge pill-streak">🔥 {streak} Streak (Best: {highestStreak})</span>
          </div>
        </div>

        {/* 3. PROMINENT PLAY GAME BUTTON */}
        <div className="welcome-play-cta">
          <button
            type="button"
            className="big-play-btn pulse-glow"
            onClick={() => {
              if (onPlaySound) onPlaySound('click')
              onOpenPlayModal()
            }}
          >
            <span className="play-shine" />
            <span className="play-icon">🎮</span>
            <div className="play-text-group">
              <strong>PLAY GAME NOW!</strong>
              <small>Easy • Medium • Hard</small>
            </div>
            <span className="play-arrow">➡️</span>
          </button>
        </div>
      </section>

      {/* 2. PLAYER STATISTICS 4-GRID (Total points, level, solved, accuracy) */}
      <section className="dash-stats-grid">
        <div className="stat-card stat-points">
          <div className="stat-icon-wrapper">🍌</div>
          <div className="stat-info">
            <span className="stat-label">Total Points</span>
            <h3 className="stat-number">{totalPoints.toLocaleString()}</h3>
            <span className="stat-sub">Banana currency to spend in Shop</span>
          </div>
        </div>

        <div className="stat-card stat-level">
          <div className="stat-icon-wrapper">{levelInfo.icon}</div>
          <div className="stat-info">
            <span className="stat-label">Player Level</span>
            <h3 className="stat-number">Level {levelInfo.level}</h3>
            <span className="stat-sub">{levelInfo.levelName}</span>
          </div>
        </div>

        <div className="stat-card stat-puzzles">
          <div className="stat-icon-wrapper">🧩</div>
          <div className="stat-info">
            <span className="stat-label">Puzzles Solved</span>
            <h3 className="stat-number">
              {correctAnswers} / {completedGames}
            </h3>
            <span className="stat-sub">
              {completedGames > 0
                ? `${Math.round((correctAnswers / completedGames) * 100)}% accuracy`
                : '100% accuracy'}
            </span>
          </div>
        </div>

        <div className="stat-card stat-badges">
          <div className="stat-icon-wrapper">🏅</div>
          <div className="stat-info">
            <span className="stat-label">Achievements</span>
            <h3 className="stat-number">{achievements.length} Badges</h3>
            <span className="stat-sub">Jungle milestones earned</span>
          </div>
        </div>
      </section>

      {/* TWO-COLUMN DASHBOARD CONTENT */}
      <div className="dash-two-columns">
        {/* LEFT COLUMN */}
        <div className="dash-col-left">
          {/* 7. LEVEL PROGRESSION (XP Bar) */}
          <section className="dash-card progress-section">
            <div className="card-header-row">
              <h3>⭐ Level Progression</h3>
              <span className="xp-summary">
                {levelInfo.currentXp} / {levelInfo.nextLevelXp} XP ({levelInfo.progressPercent}%)
              </span>
            </div>
            <div className="progress-bar-track">
              <span className="progress-bar-fill" style={{ width: `${levelInfo.progressPercent}%` }} />
            </div>
            <div className="progress-labels-row">
              <span>{levelInfo.levelName}</span>
              <span>
                {levelInfo.neededForNext > 0
                  ? `+${levelInfo.neededForNext} XP to next level`
                  : 'Max Level Banana Legend!'}
              </span>
            </div>
          </section>

          {/* 4. DAILY CHALLENGE PREVIEW */}
          <section className="dash-card daily-preview-card">
            <div className="card-header-row">
              <h3>📅 Daily Jungle Quest</h3>
              <span className="daily-reward-chip">+150 Bonus Points</span>
            </div>
            <p className="daily-desc">
              Solve today's special banana math puzzle to keep your daily streak alive and earn +150 bonus points!
            </p>
            <div className="daily-status-row">
              <div className="daily-streak-pill">
                <span>🔥 Streak: {dailyChallenge.streak || 0} days</span>
              </div>
              <button
                type="button"
                className="daily-card-btn"
                onClick={() => {
                  if (onPlaySound) onPlaySound('click')
                  onOpenDailyModal()
                }}
              >
                {isDailyDone ? 'View Status ✅' : 'Open Quest 🍌'}
              </button>
            </div>
          </section>

          {/* 8. RECENT GAME ACTIVITY */}
          <section className="dash-card history-section">
            <div className="card-header-row">
              <h3>📜 Recent Game Activity</h3>
              <button
                type="button"
                className="view-all-link"
                onClick={() => {
                  if (onPlaySound) onPlaySound('click')
                  onNavigateTab('profile')
                }}
              >
                Full History ➡️
              </button>
            </div>

            {history.length === 0 ? (
              <div className="empty-history-box">
                <span className="empty-icon">🌱</span>
                <p>No puzzle history yet! Click "Play Game Now" to start your first adventure.</p>
              </div>
            ) : (
              <div className="history-list-scroll">
                {history.slice(0, 6).map((item) => (
                  <div key={item.id} className="history-row-item">
                    <span className={`hist-indicator ${item.isCorrect ? 'hist-correct' : 'hist-wrong'}`}>
                      {item.isCorrect ? '✓' : '✖'}
                    </span>
                    <div className="hist-details">
                      <strong>Answer: {item.userAnswer} (Solution: {item.solution})</strong>
                      <small>
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Level{' '}
                        {item.level || 'easy'}
                      </small>
                    </div>
                    <span className={`hist-points ${item.isCorrect ? 'pts-positive' : 'pts-zero'}`}>
                      {item.isCorrect ? `+${item.pointsAwarded || 100} pts` : '0 pts'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div className="dash-col-right">
          {/* 5. LEADERBOARD PREVIEW */}
          <section className="dash-card leaderboard-preview-card">
            <div className="card-header-row">
              <h3>🏆 Jungle Leaderboard Top 3</h3>
              <button
                type="button"
                className="view-all-link"
                onClick={() => {
                  if (onPlaySound) onPlaySound('click')
                  onNavigateTab('leaderboard')
                }}
              >
                All Rankings ➡️
              </button>
            </div>

            <div className="leaderboard-mini-list">
              {leaderboardPreview.slice(0, 3).map((p, idx) => (
                <div key={p.id} className={`mini-rank-item rank-${idx + 1}`}>
                  <span className="mini-medal">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                  <span className="mini-avatar">{p.avatar}</span>
                  <div className="mini-info">
                    <strong>{p.nickname}</strong>
                    <small>{p.levelName}</small>
                  </div>
                  <strong className="mini-points">🍌 {p.totalPoints}</strong>
                </div>
              ))}
            </div>
          </section>

          {/* 6. ACHIEVEMENTS & SHOP SHORTCUT */}
          <section className="dash-card achievements-preview-card">
            <div className="card-header-row">
              <h3>🏅 Achievements & Rewards</h3>
              <button
                type="button"
                className="view-all-link"
                onClick={() => {
                  if (onPlaySound) onPlaySound('click')
                  onNavigateTab('achievements')
                }}
              >
                View Badges ➡️
              </button>
            </div>
            <div className="mini-badges-row">
              <span
                className={`mini-badge-pill ${achievements.some((a) => a.id === 'first_victory') ? 'unlocked' : 'locked'}`}
              >
                🍌 First Victory
              </span>
              <span
                className={`mini-badge-pill ${achievements.some((a) => a.id === 'first_100_pts') ? 'unlocked' : 'locked'}`}
              >
                💯 100 Points
              </span>
              <span
                className={`mini-badge-pill ${achievements.some((a) => a.id === 'five_correct') ? 'unlocked' : 'locked'}`}
              >
                🎯 5 Solved
              </span>
              <span
                className={`mini-badge-pill ${achievements.some((a) => a.id === 'perfect_streak') ? 'unlocked' : 'locked'}`}
              >
                🔥 5 Streak
              </span>
            </div>

            {/* Shop Shortcut Card */}
            <div className="shop-shortcut-banner" onClick={() => onNavigateTab('shop')}>
              <div className="shortcut-left">
                <span className="shop-icon-bounce">🛍️</span>
                <div>
                  <strong>Jungle Avatar Shop</strong>
                  <p>Unlock cool hats, sunglasses & special banana characters!</p>
                </div>
              </div>
              <span className="shortcut-arrow">Go ➡️</span>
            </div>
          </section>

          {/* 9. EXPLORER PROFILE PREVIEW */}
          <section className="dash-card profile-customizer-card">
            <div className="card-header-row">
              <h3>👤 Explorer Profile</h3>
              {!editingNickname && (
                <button
                  type="button"
                  className="edit-profile-btn"
                  onClick={() => setEditingNickname(true)}
                >
                  ✏️ Edit
                </button>
              )}
            </div>

            {profileSavedMsg && <div className="profile-saved-toast">✅ Profile updated successfully!</div>}

            {!editingNickname ? (
              <div className="profile-display-box">
                <span className="big-avatar-preview">{playerProfile?.avatar || '🍌'}</span>
                <div>
                  <h4>{playerProfile?.nickname || 'Jungle Explorer'}</h4>
                  <p>{playerProfile?.email || 'explorer@banana.com'}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="profile-edit-form">
                <label className="edit-field-group">
                  <span>Nickname:</span>
                  <input
                    type="text"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    maxLength={24}
                    className="nickname-input-box"
                  />
                </label>

                <div className="avatar-picker-group">
                  <span>Choose Avatar:</span>
                  <div className="avatar-options-grid">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        className={`av-choice-btn ${selectedAvatar === av ? 'av-selected' : ''}`}
                        onClick={() => setSelectedAvatar(av)}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="profile-edit-actions">
                  <button type="submit" className="save-profile-btn">
                    Save Profile ✓
                  </button>
                  <button
                    type="button"
                    className="cancel-profile-btn"
                    onClick={() => setEditingNickname(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* 10. GAME SETTINGS & LOGOUT */}
          <section className="dash-card settings-card">
            <h3>⚙️ Game Settings & Options</h3>
            <div className="settings-toggles-list">
              <label className="setting-toggle-row">
                <div className="setting-text">
                  <strong>Sound Effects (SFX)</strong>
                  <small>Button clicks, correct chimes, points sound</small>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => {
                    setSoundEnabled(e.target.checked)
                    if (onPlaySound && e.target.checked) onPlaySound('click')
                  }}
                  className="toggle-switch-input"
                />
              </label>

              <label className="setting-toggle-row">
                <div className="setting-text">
                  <strong>Reduced Motion</strong>
                  <small>Comfortable gentle animations</small>
                </div>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => {
                    setReducedMotion(e.target.checked)
                    if (onPlaySound) onPlaySound('click')
                  }}
                  className="toggle-switch-input"
                />
              </label>

              {/* Logout Option */}
              <div className="dash-logout-row">
                <button
                  type="button"
                  className="dash-logout-btn"
                  onClick={() => {
                    if (onPlaySound) onPlaySound('click')
                    onLogout()
                  }}
                >
                  <span>🚪 Leave Jungle (Logout)</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
