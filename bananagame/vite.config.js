import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'data', 'banana_adventure_db.json')

// In-memory cache for Banana API questions (Server-side validation)
// questionToken -> { questionUrl, solution, createdAt }
const activeQuestionCache = new Map()

// Clean up stale questions every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [token, data] of activeQuestionCache.entries()) {
    if (now - data.createdAt > 30 * 60 * 1000) {
      activeQuestionCache.delete(token)
    }
  }
}, 10 * 60 * 1000)

function loadDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, 'utf-8')
      const data = JSON.parse(content)
      data.players = data.players || {}
      data.processedSubmissions = data.processedSubmissions || {}
      return data
    }
  } catch (err) {
    console.error('Error reading banana DB:', err)
  }
  return { players: {}, processedSubmissions: {} }
}

function saveDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error saving banana DB:', err)
  }
}

// 5-Tier Level Progression System
function getLevelInfo(xp = 0) {
  const currentXp = Math.max(0, Number(xp) || 0)
  if (currentXp >= 2000) return { level: 5, levelName: 'Banana Legend', nextXp: 2000, icon: '👑' }
  if (currentXp >= 1000) return { level: 4, levelName: 'Banana Champion', nextXp: 2000, icon: '🐒' }
  if (currentXp >= 500) return { level: 3, levelName: 'Banana Master', nextXp: 1000, icon: '🍌' }
  if (currentXp >= 200) return { level: 2, levelName: 'Banana Explorer', nextXp: 500, icon: '🌴' }
  return { level: 1, levelName: 'Banana Beginner', nextXp: 200, icon: '🌱' }
}

function ensurePlayerDefaults(playerId, existing = {}) {
  const defaults = {
    id: playerId,
    nickname: existing.nickname || (playerId.length > 2 ? playerId.charAt(0).toUpperCase() + playerId.slice(1) : 'Explorer'),
    avatar: existing.avatar || '🍌',
    email: existing.email || `${playerId}@banana.com`,
    totalPoints: Number(existing.totalPoints || 0),
    xp: Number(existing.xp || existing.totalPoints || 0),
    level: 1,
    levelName: 'Banana Beginner',
    completedGames: Number(existing.completedGames || 0),
    correctAnswers: Number(existing.correctAnswers || 0),
    streak: Number(existing.streak || 0),
    highestStreak: Number(existing.highestStreak || existing.streak || 0),
    bestScore: Number(existing.bestScore || 0),
    achievements: Array.isArray(existing.achievements) ? existing.achievements : [],
    dailyChallenge: existing.dailyChallenge || { lastCompletedDate: '', streak: 0 },
    history: Array.isArray(existing.history) ? existing.history : [],
    sessions: Array.isArray(existing.sessions) ? existing.sessions : [],
    inventory: Array.isArray(existing.inventory)
      ? existing.inventory
      : ['char_benny', 'hat_none', 'glass_none', 'theme_jungle'],
    equipped: existing.equipped || {
      characters: 'char_benny',
      hats: 'hat_none',
      glasses: 'glass_none',
      themes: 'theme_jungle',
    },
    createdAt: existing.createdAt || new Date().toISOString(),
  }

  const { level, levelName } = getLevelInfo(defaults.xp)
  defaults.level = level
  defaults.levelName = levelName
  return defaults
}

function bananaBackendPlugin() {
  return {
    name: 'banana-adventure-backend',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')

        if (!url.pathname.startsWith('/api/')) {
          return next()
        }

        // Helper to parse JSON body
        const readBody = (callback) => {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk
          })
          req.on('end', () => {
            try {
              callback(body ? JSON.parse(body) : {})
            } catch {
              callback({})
            }
          })
        }

        const sendJSON = (data, status = 200) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
        }

        const db = loadDB()

        // -------------------------------------------------------------
        // 1. Leaderboard Endpoint (All-time, Weekly, Monthly)
        // -------------------------------------------------------------
        if (req.method === 'GET' && url.pathname === '/api/leaderboard') {
          const period = url.searchParams.get('period') || 'all-time'
          const playersList = Object.values(db.players || {}).map((raw) => {
            const p = ensurePlayerDefaults(raw.id, raw)
            const { level, levelName } = getLevelInfo(p.xp || p.totalPoints || 0)
            const completed = p.completedGames || 0
            const correct = p.correctAnswers || 0
            const accuracy = completed > 0 ? Math.round((correct / completed) * 100) : 100

            return {
              id: p.id,
              nickname: p.nickname,
              avatar: p.avatar,
              totalPoints: Number(p.totalPoints || 0),
              xp: Number(p.xp || p.totalPoints || 0),
              level,
              levelName,
              badgesCount: (p.achievements || []).length,
              badges: p.achievements || [],
              streak: p.streak || 0,
              highestStreak: p.highestStreak || p.streak || 0,
              completedGames: completed,
              correctAnswers: correct,
              accuracy,
            }
          })

          // Sort by points descending
          playersList.sort((a, b) => b.totalPoints - a.totalPoints)

          // Add rank
          const ranked = playersList.map((player, idx) => ({
            ...player,
            rank: idx + 1,
          }))

          return sendJSON({ period, leaderboard: ranked })
        }

        // -------------------------------------------------------------
        // 2. Player Profile Endpoint (GET /api/player/:id)
        // -------------------------------------------------------------
        const playerMatch = url.pathname.match(/^\/api\/player\/([^/]+)$/)
        if (req.method === 'GET' && playerMatch) {
          const playerId = decodeURIComponent(playerMatch[1])
          let player = db.players[playerId]

          if (!player) {
            player = ensurePlayerDefaults(playerId)
            db.players[playerId] = player
            saveDB(db)
          } else {
            player = ensurePlayerDefaults(playerId, player)
          }

          const { level, levelName, nextXp } = getLevelInfo(player.xp || player.totalPoints || 0)
          const completed = player.completedGames || 0
          const correct = player.correctAnswers || 0
          const accuracy = completed > 0 ? Math.round((correct / completed) * 100) : 100

          return sendJSON({
            ...player,
            level,
            levelName,
            nextXp,
            accuracy,
          })
        }

        // -------------------------------------------------------------
        // 3. Update Player Profile (POST /api/player/:id/profile)
        // -------------------------------------------------------------
        const profileMatch = url.pathname.match(/^\/api\/player\/([^/]+)\/profile$/)
        if (req.method === 'POST' && profileMatch) {
          const playerId = decodeURIComponent(profileMatch[1])
          return readBody((body) => {
            const player = ensurePlayerDefaults(playerId, db.players[playerId] || {})
            if (body.nickname) player.nickname = String(body.nickname).trim().slice(0, 24)
            if (body.avatar) player.avatar = String(body.avatar)
            db.players[playerId] = player
            saveDB(db)
            return sendJSON({ success: true, player })
          })
        }

        // -------------------------------------------------------------
        // 4. Secure Question Proxy (GET /api/game/question)
        // Fetches from Banana API, caches solution on server,
        // returns ONLY questionUrl & questionToken to client!
        // -------------------------------------------------------------
        if (req.method === 'GET' && url.pathname === '/api/game/question') {
          try {
            const apiTarget = `https://marcconrad.com/uob/banana/api.php?out=json&_t=${Date.now()}`
            const response = await fetch(apiTarget)
            if (!response.ok) {
              throw new Error(`Banana API HTTP error ${response.status}`)
            }
            const data = await response.json()
            if (!data.question || data.solution === undefined) {
              throw new Error('Invalid response structure from Banana API')
            }

            const questionToken = `q_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
            activeQuestionCache.set(questionToken, {
              questionUrl: data.question,
              solution: Number(data.solution),
              createdAt: Date.now(),
            })

            // Return question image and token — SOLUTION IS NEVER EXPOSED!
            return sendJSON({
              success: true,
              questionToken,
              question: data.question,
            })
          } catch (err) {
            console.error('Error in /api/game/question proxy:', err)
            return sendJSON({ error: 'Failed to fetch question from Banana API', details: String(err) }, 502)
          }
        }

        // -------------------------------------------------------------
        // 5. Submit Game Answer (POST /api/game/submit)
        // Server-side validation against token or fallback solution
        // -------------------------------------------------------------
        if (req.method === 'POST' && url.pathname === '/api/game/submit') {
          return readBody((body) => {
            const {
              playerId,
              questionToken,
              questionUrl,
              submittedAnswer,
              solution: clientSolution,
              attemptCount = 1,
              level = 'easy',
              isFirstAttempt = true,
              timeTaken = 0,
            } = body

            if (!playerId) {
              return sendJSON({ error: 'Player ID is required' }, 400)
            }

            const player = ensurePlayerDefaults(playerId, db.players[playerId] || {})

            // Resolve solution: from server cache via token, or fallback to client provided
            let resolvedSolution = null
            let targetQuestionUrl = questionUrl || ''

            if (questionToken && activeQuestionCache.has(questionToken)) {
              const cached = activeQuestionCache.get(questionToken)
              resolvedSolution = cached.solution
              targetQuestionUrl = cached.questionUrl
              // Invalidate token so it cannot be re-submitted
              activeQuestionCache.delete(questionToken)
            } else if (clientSolution !== undefined) {
              resolvedSolution = Number(clientSolution)
            }

            if (resolvedSolution === null || Number.isNaN(resolvedSolution)) {
              return sendJSON({ error: 'Question expired or invalid solution' }, 400)
            }

            const isCorrect = Number(submittedAnswer) === Number(resolvedSolution)

            // Duplicate submission guard for point exploits
            const submissionKey = `${playerId}_${targetQuestionUrl || questionToken}`
            const alreadyProcessed = db.processedSubmissions[submissionKey]

            let pointsAwarded = 0
            const newlyUnlockedAchievements = []

            if (isCorrect && !alreadyProcessed) {
              // 1. Base points: Standardized +100 as requested!
              let pts = 100

              // 2. First attempt speed bonus: +25
              if (isFirstAttempt || attemptCount === 1) {
                pts += 25
              }

              // 3. Streak bonuses
              const newStreak = (player.streak || 0) + 1
              player.streak = newStreak
              player.highestStreak = Math.max(player.highestStreak || 0, newStreak)

              if (newStreak === 3) pts += 50
              else if (newStreak >= 5) pts += 100

              // 4. Level Multiplier: Medium 1.25x, Hard 1.5x
              if (level === 'hard') pts = Math.round(pts * 1.5)
              else if (level === 'medium') pts = Math.round(pts * 1.25)

              pointsAwarded = pts
              player.totalPoints = (player.totalPoints || 0) + pointsAwarded
              player.xp = (player.xp || 0) + pointsAwarded
              player.correctAnswers = (player.correctAnswers || 0) + 1

              // Mark question as processed
              db.processedSubmissions[submissionKey] = {
                timestamp: Date.now(),
                pointsAwarded,
              }
            } else if (!isCorrect) {
              player.streak = 0
            }

            player.completedGames = (player.completedGames || 0) + 1

            // ---------------------------------------------------------
            // Check Achievements (All 8 achievements)
            // ---------------------------------------------------------
            const hasAchievement = (id) => (player.achievements || []).some((a) => a.id === id)
            const addAchievement = (id, title, desc) => {
              if (!hasAchievement(id)) {
                const ach = {
                  id,
                  title,
                  description: desc,
                  unlockedAt: new Date().toISOString(),
                }
                player.achievements.push(ach)
                newlyUnlockedAchievements.push(ach)
              }
            }

            if (isCorrect) {
              addAchievement('first_victory', 'First Victory', 'Solve your very first banana puzzle.')
              if (player.correctAnswers >= 5) {
                addAchievement('five_correct', '5 Correct Answers', 'Successfully solve 5 banana math puzzles.')
              }
              if ((player.streak || 0) >= 5) {
                addAchievement('perfect_streak', 'Perfect Streak', 'Answer 5 puzzles correctly in a row.')
              }
              if (level === 'hard' && attemptCount === 1) {
                addAchievement('puzzle_master', 'Puzzle Master', 'Solve a Hard level puzzle on first attempt.')
              }
            }

            if ((player.totalPoints || 0) >= 100) {
              addAchievement('first_100_pts', 'First 100 Points', 'Reach 100 total banana points.')
            }

            if ((player.completedGames || 0) >= 10) {
              addAchievement('ten_games', '10 Games Completed', 'Play and complete 10 games.')
            }

            const prevLevel = getLevelInfo(player.xp - pointsAwarded).level
            const currentLevelInfo = getLevelInfo(player.xp)
            const leveledUp = currentLevelInfo.level > prevLevel

            if (currentLevelInfo.level >= 5) {
              addAchievement('banana_legend', 'Banana Legend', 'Reach Level 5 (Banana Legend).')
            }

            player.level = currentLevelInfo.level
            player.levelName = currentLevelInfo.levelName

            // Append to Game History
            player.history = player.history || []
            player.history.unshift({
              id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              questionUrl: targetQuestionUrl,
              userAnswer: Number(submittedAnswer),
              solution: resolvedSolution,
              isCorrect,
              pointsAwarded,
              level,
              timeTaken,
              timestamp: new Date().toISOString(),
            })

            if (player.history.length > 50) {
              player.history = player.history.slice(0, 50)
            }

            db.players[playerId] = player
            saveDB(db)

            return sendJSON({
              success: true,
              isCorrect,
              solution: resolvedSolution,
              pointsAwarded,
              newTotalPoints: player.totalPoints,
              newXp: player.xp,
              streak: player.streak,
              highestStreak: player.highestStreak,
              level: currentLevelInfo.level,
              levelName: currentLevelInfo.levelName,
              leveledUp,
              newlyUnlockedAchievements,
              alreadyProcessed: Boolean(alreadyProcessed),
            })
          })
        }

        // -------------------------------------------------------------
        // 6. Complete Game Session (POST /api/session/complete)
        // -------------------------------------------------------------
        if (req.method === 'POST' && url.pathname === '/api/session/complete') {
          return readBody((body) => {
            const {
              playerId,
              rounds = 5,
              correctAnswers = 0,
              incorrectAnswers = 0,
              pointsEarned = 0,
              durationSeconds = 60,
              level = 'easy',
            } = body

            if (!playerId || !db.players[playerId]) {
              return sendJSON({ error: 'Player not found' }, 404)
            }

            const player = ensurePlayerDefaults(playerId, db.players[playerId])
            const completionBonus = 100 // +100 bonus points for finishing a full session
            player.totalPoints = (player.totalPoints || 0) + completionBonus
            player.xp = (player.xp || 0) + completionBonus
            player.bestScore = Math.max(player.bestScore || 0, pointsEarned + completionBonus)

            const accuracy = rounds > 0 ? Math.round((correctAnswers / rounds) * 100) : 100

            player.sessions = player.sessions || []
            player.sessions.unshift({
              id: `sess_${Date.now()}`,
              date: new Date().toISOString(),
              rounds,
              correctAnswers,
              incorrectAnswers,
              accuracy,
              pointsEarned: pointsEarned + completionBonus,
              durationSeconds,
              level,
            })

            if (player.sessions.length > 30) {
              player.sessions = player.sessions.slice(0, 30)
            }

            db.players[playerId] = player
            saveDB(db)

            return sendJSON({
              success: true,
              completionBonus,
              newTotalPoints: player.totalPoints,
              sessionsCount: player.sessions.length,
            })
          })
        }

        // -------------------------------------------------------------
        // 7. Jungle Shop: Purchase Item (POST /api/shop/purchase)
        // -------------------------------------------------------------
        if (req.method === 'POST' && url.pathname === '/api/shop/purchase') {
          return readBody((body) => {
            const { playerId, itemId, cost } = body
            if (!playerId || !db.players[playerId]) {
              return sendJSON({ error: 'Player not found' }, 404)
            }

            const player = ensurePlayerDefaults(playerId, db.players[playerId])
            const price = Number(cost) || 0

            if (player.inventory.includes(itemId)) {
              return sendJSON({ error: 'Item already unlocked in inventory' }, 400)
            }

            if (player.totalPoints < price) {
              return sendJSON({ error: 'Not enough Banana Points to purchase this item' }, 400)
            }

            // Deduct points & add to inventory
            player.totalPoints -= price
            player.inventory.push(itemId)

            db.players[playerId] = player
            saveDB(db)

            return sendJSON({
              success: true,
              itemId,
              remainingPoints: player.totalPoints,
              inventory: player.inventory,
            })
          })
        }

        // -------------------------------------------------------------
        // 8. Jungle Shop: Equip Item (POST /api/shop/equip)
        // -------------------------------------------------------------
        if (req.method === 'POST' && url.pathname === '/api/shop/equip') {
          return readBody((body) => {
            const { playerId, category, itemId, avatarEmoji } = body
            if (!playerId || !db.players[playerId]) {
              return sendJSON({ error: 'Player not found' }, 404)
            }

            const player = ensurePlayerDefaults(playerId, db.players[playerId])
            if (!player.inventory.includes(itemId)) {
              return sendJSON({ error: 'Item not owned' }, 400)
            }

            player.equipped = player.equipped || {}
            player.equipped[category] = itemId
            if (avatarEmoji) {
              player.avatar = avatarEmoji
            }

            db.players[playerId] = player
            saveDB(db)

            return sendJSON({
              success: true,
              equipped: player.equipped,
              avatar: player.avatar,
            })
          })
        }

        // -------------------------------------------------------------
        // 9. Daily Challenge Status (GET /api/daily-challenge)
        // -------------------------------------------------------------
        if (req.method === 'GET' && url.pathname === '/api/daily-challenge') {
          const playerId = url.searchParams.get('playerId')
          const todayStr = new Date().toISOString().slice(0, 10)
          const player = db.players[playerId] || {}
          const lastDate = player.dailyChallenge?.lastCompletedDate || ''
          const isCompletedToday = lastDate === todayStr

          const now = new Date()
          const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
          const countdownMs = Math.max(0, tomorrow.getTime() - now.getTime())

          return sendJSON({
            date: todayStr,
            isCompletedToday,
            streak: player.dailyChallenge?.streak || 0,
            countdownMs,
          })
        }

        // -------------------------------------------------------------
        // 10. Complete Daily Challenge (POST /api/daily-challenge/complete)
        // -------------------------------------------------------------
        if (req.method === 'POST' && url.pathname === '/api/daily-challenge/complete') {
          return readBody((body) => {
            const { playerId } = body
            if (!playerId || !db.players[playerId]) {
              return sendJSON({ error: 'Player not found' }, 404)
            }

            const todayStr = new Date().toISOString().slice(0, 10)
            const player = ensurePlayerDefaults(playerId, db.players[playerId])

            if (player.dailyChallenge.lastCompletedDate === todayStr) {
              return sendJSON({ error: 'Daily challenge already completed today' }, 400)
            }

            // Award +150 bonus points
            const points = 150
            player.totalPoints = (player.totalPoints || 0) + points
            player.xp = (player.xp || 0) + points
            player.dailyChallenge.lastCompletedDate = todayStr
            player.dailyChallenge.streak = (player.dailyChallenge.streak || 0) + 1

            // Award daily_champion achievement
            player.achievements = player.achievements || []
            if (!player.achievements.some((a) => a.id === 'daily_champion')) {
              player.achievements.push({
                id: 'daily_champion',
                title: 'Daily Champion',
                description: 'Complete today’s magical Daily Jungle Quest.',
                unlockedAt: new Date().toISOString(),
              })
            }

            db.players[playerId] = player
            saveDB(db)

            return sendJSON({
              success: true,
              pointsAwarded: points,
              newTotalPoints: player.totalPoints,
              newStreak: player.dailyChallenge.streak,
            })
          })
        }

        // -------------------------------------------------------------
        // 11. Sync Player On Registration or Login (POST /api/player/sync)
        // -------------------------------------------------------------
        if (req.method === 'POST' && url.pathname === '/api/player/sync') {
          return readBody((body) => {
            const { id, name, email } = body
            if (!id) return sendJSON({ error: 'Missing id' }, 400)

            if (!db.players[id]) {
              db.players[id] = ensurePlayerDefaults(id, { nickname: name, email })
              saveDB(db)
            }
            return sendJSON({ success: true, player: db.players[id] })
          })
        }

        // Unknown API route
        return sendJSON({ error: 'API route not found' }, 404)
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), bananaBackendPlugin()],
})
