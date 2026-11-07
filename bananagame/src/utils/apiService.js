// Persistent Backend & Local Storage Synchronization Service

const LOCAL_STORAGE_KEY = 'banana_adventure_local_db'

function getLocalDB() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : { players: {}, processedSubmissions: {} }
  } catch {
    return { players: {}, processedSubmissions: {} }
  }
}

function saveLocalDB(data) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to save to local DB:', err)
  }
}

// 1. Fetch Question (Server-side proxy: Solution hidden from client!)
export async function fetchGameQuestion() {
  try {
    const res = await fetch('/api/game/question')
    if (res.ok) {
      const data = await res.json()
      if (data.question && data.questionToken) {
        return {
          question: data.question,
          questionToken: data.questionToken,
          fromProxy: true,
        }
      }
    }
  } catch {
    // Fallback to direct client API if proxy is offline
  }

  // Fallback: Direct Banana API fetch
  const cacheBuster = `out=json&_t=${Date.now()}`
  const directRes = await fetch(`https://marcconrad.com/uob/banana/api.php?${cacheBuster}`)
  if (!directRes.ok) {
    throw new Error(`Direct Banana API error: ${directRes.status}`)
  }
  const directData = await directRes.json()
  return {
    question: directData.question,
    solution: directData.solution,
    fromProxy: false,
  }
}

// 2. Fetch Leaderboard (all-time, weekly, monthly)
export async function getLeaderboard(period = 'all-time') {
  try {
    const res = await fetch(`/api/leaderboard?period=${period}`)
    if (res.ok) {
      const data = await res.json()
      return data.leaderboard || []
    }
  } catch {
    // Fallback
  }

  const db = getLocalDB()
  const list = Object.values(db.players || {}).map((p, idx) => ({
    id: p.id,
    rank: idx + 1,
    nickname: p.nickname || p.name || 'Jungle Explorer',
    avatar: p.avatar || '🍌',
    totalPoints: Number(p.totalPoints || 0),
    xp: Number(p.xp || p.totalPoints || 0),
    level: p.level || 1,
    levelName: p.levelName || 'Banana Beginner',
    badgesCount: (p.achievements || []).length,
    streak: p.streak || 0,
    completedGames: p.completedGames || 0,
    correctAnswers: p.correctAnswers || 0,
    accuracy: p.completedGames ? Math.round((p.correctAnswers / p.completedGames) * 100) : 100,
  }))
  list.sort((a, b) => b.totalPoints - a.totalPoints)
  return list.map((item, index) => ({ ...item, rank: index + 1 }))
}

// 3. Fetch Player Profile
export async function getPlayerProfile(playerId) {
  if (!playerId) return null

  try {
    const res = await fetch(`/api/player/${encodeURIComponent(playerId)}`)
    if (res.ok) {
      const data = await res.json()
      const db = getLocalDB()
      db.players[playerId] = data
      saveLocalDB(db)
      return data
    }
  } catch {
    // Fallback
  }

  const db = getLocalDB()
  let player = db.players[playerId]
  if (!player) {
    player = {
      id: playerId,
      nickname: playerId.length > 2 ? playerId.charAt(0).toUpperCase() + playerId.slice(1) : 'Explorer',
      avatar: '🍌',
      email: `${playerId}@banana.com`,
      totalPoints: 0,
      xp: 0,
      level: 1,
      levelName: 'Banana Beginner',
      completedGames: 0,
      correctAnswers: 0,
      streak: 0,
      highestStreak: 0,
      bestScore: 0,
      achievements: [],
      dailyChallenge: { lastCompletedDate: '', streak: 0 },
      history: [],
      sessions: [],
      inventory: ['char_benny', 'hat_none', 'glass_none', 'theme_jungle'],
      equipped: {
        characters: 'char_benny',
        hats: 'hat_none',
        glasses: 'glass_none',
        themes: 'theme_jungle',
      },
    }
    db.players[playerId] = player
    saveLocalDB(db)
  }
  return player
}

// 4. Update Player Profile (Nickname & Avatar)
export async function updatePlayerProfile(playerId, { nickname, avatar }) {
  try {
    const res = await fetch(`/api/player/${encodeURIComponent(playerId)}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, avatar }),
    })
    if (res.ok) {
      const data = await res.json()
      return data.player
    }
  } catch {
    // Fallback
  }

  const db = getLocalDB()
  if (db.players[playerId]) {
    if (nickname) db.players[playerId].nickname = nickname
    if (avatar) db.players[playerId].avatar = avatar
    saveLocalDB(db)
    return db.players[playerId]
  }
  return null
}

// 5. Submit Game Answer (Server-side calculation & duplicate protection)
export async function submitGameAnswer({
  playerId,
  questionToken,
  questionUrl,
  submittedAnswer,
  solution,
  attemptCount = 1,
  level = 'easy',
  isFirstAttempt = true,
  timeTaken = 0,
}) {
  try {
    const res = await fetch('/api/game/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId,
        questionToken,
        questionUrl,
        submittedAnswer,
        solution,
        attemptCount,
        level,
        isFirstAttempt,
        timeTaken,
      }),
    })
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // Fallback calculation in case server is unreachable
  }

  const isCorrect = Number(submittedAnswer) === Number(solution)
  let pointsAwarded = 0
  if (isCorrect) {
    pointsAwarded = 100 + (isFirstAttempt ? 25 : 0)
    if (level === 'hard') pointsAwarded = Math.round(pointsAwarded * 1.5)
    else if (level === 'medium') pointsAwarded = Math.round(pointsAwarded * 1.25)
  }

  return {
    success: true,
    isCorrect,
    solution,
    pointsAwarded,
    newTotalPoints: pointsAwarded,
    newXp: pointsAwarded,
    streak: isCorrect ? 1 : 0,
    highestStreak: isCorrect ? 1 : 0,
    level: 1,
    levelName: 'Banana Beginner',
    leveledUp: false,
    newlyUnlockedAchievements: [],
    alreadyProcessed: false,
  }
}

// 6. Complete Full Game Session
export async function completeGameSession({
  playerId,
  rounds = 5,
  correctAnswers = 0,
  incorrectAnswers = 0,
  pointsEarned = 0,
  durationSeconds = 60,
  level = 'easy',
}) {
  try {
    const res = await fetch('/api/session/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerId,
        rounds,
        correctAnswers,
        incorrectAnswers,
        pointsEarned,
        durationSeconds,
        level,
      }),
    })
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // Fallback
  }

  return {
    success: true,
    completionBonus: 100,
    newTotalPoints: pointsEarned + 100,
  }
}

// 7. Purchase Shop Item
export async function purchaseShopItem({ playerId, itemId, cost }) {
  try {
    const res = await fetch('/api/shop/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, itemId, cost }),
    })
    return await res.json()
  } catch (err) {
    return { error: 'Failed to process shop purchase: ' + err.message }
  }
}

// 8. Equip Shop Item
export async function equipShopItem({ playerId, category, itemId, avatarEmoji }) {
  try {
    const res = await fetch('/api/shop/equip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, category, itemId, avatarEmoji }),
    })
    return await res.json()
  } catch (err) {
    return { error: 'Failed to equip item: ' + err.message }
  }
}

// 9. Get Daily Challenge Status
export async function getDailyChallengeStatus(playerId) {
  try {
    const res = await fetch(`/api/daily-challenge?playerId=${encodeURIComponent(playerId)}`)
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // Fallback
  }

  const todayStr = new Date().toISOString().slice(0, 10)
  return {
    date: todayStr,
    isCompletedToday: false,
    streak: 0,
    countdownMs: 3600000,
  }
}

// 10. Complete Daily Challenge
export async function completeDailyChallenge(playerId) {
  try {
    const res = await fetch('/api/daily-challenge/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    })
    if (res.ok) {
      return await res.json()
    }
  } catch {
    // Fallback
  }

  return {
    success: true,
    pointsAwarded: 150,
    newStreak: 1,
  }
}

// 11. Sync Player on Login
export async function syncPlayer(user) {
  if (!user || !user.email) return
  const id = user.username || user.email.split('@')[0]
  try {
    await fetch('/api/player/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: user.name, email: user.email }),
    })
  } catch {
    // ignore
  }
}
