import { useEffect, useState } from 'react'
import { getLeaderboard } from '../utils/apiService'

export default function LeaderboardView({ currentUserId, onPlaySound }) {
  const [period, setPeriod] = useState('all-time')
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const fetchRankings = async () => {
      setLoading(true)
      try {
        const data = await getLeaderboard(period)
        if (active) setLeaderboard(data)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchRankings()
    return () => {
      active = false
    }
  }, [period])

  const handleTabChange = (p) => {
    if (onPlaySound) onPlaySound('click')
    setPeriod(p)
  }

  // Find current player in leaderboard
  const myEntry = leaderboard.find((item) => item.id === currentUserId)
  const top3 = leaderboard.slice(0, 3)

  return (
    <div className="leaderboard-view-container">
      {/* Header Banner */}
      <div className="leaderboard-header-banner">
        <div className="trophy-banner-icon">🏆</div>
        <div>
          <h2>JUNGLE LEADERBOARD</h2>
          <p>Compete in a friendly way with fellow jungle explorers around the globe!</p>
        </div>
      </div>

      {/* Time Filters */}
      <div className="leaderboard-period-tabs">
        <button
          type="button"
          className={`period-tab-btn ${period === 'all-time' ? 'active-period' : ''}`}
          onClick={() => handleTabChange('all-time')}
        >
          🌍 All-Time Champions
        </button>
        <button
          type="button"
          className={`period-tab-btn ${period === 'weekly' ? 'active-period' : ''}`}
          onClick={() => handleTabChange('weekly')}
        >
          📅 Weekly Top
        </button>
        <button
          type="button"
          className={`period-tab-btn ${period === 'monthly' ? 'active-period' : ''}`}
          onClick={() => handleTabChange('monthly')}
        >
          🌟 Monthly Top
        </button>
      </div>

      {/* My Ranking Highlight Card */}
      {myEntry && (
        <div className="my-ranking-card">
          <div className="my-rank-badge">
            <span className="my-rank-num">#{myEntry.rank}</span>
            <span className="my-rank-lbl">Your Rank</span>
          </div>
          <div className="my-player-info">
            <span className="my-avatar">{myEntry.avatar}</span>
            <div>
              <strong>{myEntry.nickname} (You)</strong>
              <p>
                {myEntry.levelName} • {myEntry.badgesCount} Badges • {myEntry.accuracy}% Accuracy
              </p>
            </div>
          </div>
          <div className="my-points-pill">
            <span>🍌 {myEntry.totalPoints.toLocaleString()}</span>
            <small>Points</small>
          </div>
        </div>
      )}

      {loading ? (
        <div className="leaderboard-loading">
          <span className="loading-banana-spin">🍌</span>
          <p>Gathering jungle scores...</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Display */}
          {top3.length > 0 && (
            <div className="podium-wrapper">
              {/* 2nd Place */}
              {top3[1] && (
                <div className={`podium-card podium-silver ${top3[1].id === currentUserId ? 'podium-me' : ''}`}>
                  <div className="trophy-badge silver-badge">🥈 #2</div>
                  <div className="podium-avatar">{top3[1].avatar}</div>
                  <strong className="podium-name">{top3[1].nickname}</strong>
                  <span className="podium-level">{top3[1].levelName}</span>
                  <div className="podium-points">🍌 {top3[1].totalPoints.toLocaleString()}</div>
                </div>
              )}

              {/* 1st Place */}
              {top3[0] && (
                <div className={`podium-card podium-gold ${top3[0].id === currentUserId ? 'podium-me' : ''}`}>
                  <div className="crown-icon">👑</div>
                  <div className="trophy-badge gold-badge">🥇 #1</div>
                  <div className="podium-avatar gold-avatar">{top3[0].avatar}</div>
                  <strong className="podium-name">{top3[0].nickname}</strong>
                  <span className="podium-level">{top3[0].levelName}</span>
                  <div className="podium-points gold-pts">🍌 {top3[0].totalPoints.toLocaleString()}</div>
                </div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <div className={`podium-card podium-bronze ${top3[2].id === currentUserId ? 'podium-me' : ''}`}>
                  <div className="trophy-badge bronze-badge">🥉 #3</div>
                  <div className="podium-avatar">{top3[2].avatar}</div>
                  <strong className="podium-name">{top3[2].nickname}</strong>
                  <span className="podium-level">{top3[2].levelName}</span>
                  <div className="podium-points">🍌 {top3[2].totalPoints.toLocaleString()}</div>
                </div>
              )}
            </div>
          )}

          {/* Full Table / Rankings List (Top 10) */}
          <div className="rankings-table-card">
            <div className="rankings-table-header">
              <span>Rank</span>
              <span>Explorer</span>
              <span>Level</span>
              <span>Accuracy</span>
              <span>Badges</span>
              <span>Total Points</span>
            </div>
            <div className="rankings-rows-container">
              {leaderboard.slice(0, 10).map((player) => {
                const isMe = player.id === currentUserId
                let medal = null
                if (player.rank === 1) medal = '🥇'
                else if (player.rank === 2) medal = '🥈'
                else if (player.rank === 3) medal = '🥉'

                return (
                  <div key={player.id} className={`ranking-row ${isMe ? 'ranking-row-me' : ''}`}>
                    <div className="col-rank">
                      {medal ? (
                        <span className="medal-ico">{medal}</span>
                      ) : (
                        <span className="rank-number">#{player.rank}</span>
                      )}
                    </div>
                    <div className="col-explorer">
                      <span className="table-avatar">{player.avatar}</span>
                      <span className="table-name">
                        {player.nickname} {isMe && <span className="you-pill">You</span>}
                      </span>
                    </div>
                    <div className="col-level">
                      <span className="level-badge-pill">{player.levelName}</span>
                    </div>
                    <div className="col-accuracy">
                      <span>🎯 {player.accuracy}%</span>
                    </div>
                    <div className="col-badges">
                      <span>🏅 {player.badgesCount}</span>
                    </div>
                    <div className="col-points">
                      <strong>🍌 {player.totalPoints.toLocaleString()}</strong>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
