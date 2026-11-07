import { useEffect, useRef, useState } from 'react'
import JungleWorld from './components/JungleWorld'
import DancingBanana from './components/DancingBanana'
import BananaPortalCard from './components/BananaPortalCard'
import ConfettiEffect from './components/ConfettiEffect'
import DashboardView from './components/DashboardView'
import GameIntroModal from './components/GameIntroModal'
import GamePlayScreen from './components/GamePlayScreen'
import LeaderboardView from './components/LeaderboardView'
import AchievementsView from './components/AchievementsView'
import ShopView from './components/ShopView'
import ProfileView from './components/ProfileView'
import DailyChallengeModal from './components/DailyChallengeModal'
import LevelUpModal from './components/LevelUpModal'
import {
  getPlayerProfile,
  updatePlayerProfile,
  submitGameAnswer,
  getLeaderboard,
  getDailyChallengeStatus,
  completeDailyChallenge,
  syncPlayer,
  fetchGameQuestion,
  completeGameSession,
} from './utils/apiService'
import {
  playClick,
  playCorrect,
  playWrong,
  playLevelUp,
  playAchievement,
  playPointsDing,
  playLoginSuccess,
  playPointsBurst,
} from './utils/audio'
import './App.css'

const BANANA_API_URL =
  import.meta.env.VITE_BANANA_API_URL || 'https://marcconrad.com/uob/banana/api.php'

const USERS_STORAGE_KEY = 'banana_users'
const SESSION_STORAGE_KEY = 'banana_session'
const RESET_TOKENS_KEY = 'banana_reset_tokens'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const RESET_API_URL = import.meta.env.VITE_RESET_API_URL || ''
const HAS_REAL_RESET_API = Boolean(RESET_API_URL) && !RESET_API_URL.includes('your-reset-api.example.com')

function getStoredUsers() {
  const seededUsers = [
    {
      name: 'Banana Admin',
      email: 'admin@banana.com',
      username: 'admin',
      password: 'Banana123',
    },
    {
      name: 'Sheromi',
      email: 'sheromiinthiran@gmail.com',
      username: 'sheromi',
      password: 'Banana123',
    },
  ]

  try {
    let raw = localStorage.getItem(USERS_STORAGE_KEY) || localStorage.getItem('banana_users')
    const users = raw ? JSON.parse(raw) : []

    if (!Array.isArray(users) || users.length === 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(seededUsers))
      return seededUsers
    }

    const mergedUsers = [...users]
    for (const seededUser of seededUsers) {
      const index = mergedUsers.findIndex(
        (user) => user && user.email && user.email.toLowerCase() === seededUser.email.toLowerCase(),
      )

      if (index === -1) {
        mergedUsers.push(seededUser)
        continue
      }

      mergedUsers[index] = {
        ...seededUser,
        ...mergedUsers[index],
      }
    }

    const finalUsers = mergedUsers.filter((user) => user && user.email)
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(finalUsers))
    return finalUsers
  } catch {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(seededUsers))
    return seededUsers
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

function findUserByIdentity(users, identity) {
  const normalized = identity.trim().toLowerCase()
  return users.find((user) => {
    const emailMatches = user.email?.toLowerCase() === normalized
    const usernameMatches = user.username?.toLowerCase() === normalized
    const nameMatches = user.name?.toLowerCase() === normalized
    return emailMatches || usernameMatches || nameMatches
  })
}

function getResetTokens() {
  try {
    const raw = localStorage.getItem(RESET_TOKENS_KEY) || localStorage.getItem('banana_reset_tokens')
    const tokens = raw ? JSON.parse(raw) : []
    return Array.isArray(tokens) ? tokens : []
  } catch {
    return []
  }
}

function saveResetTokens(tokens) {
  localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens))
}

function clearResetToken(email) {
  const tokens = getResetTokens().filter((tokenItem) => tokenItem.email !== email.toLowerCase())
  saveResetTokens(tokens)
}

function createResetToken(email) {
  const token =
    window.crypto && typeof window.crypto.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : `reset-${Date.now()}-${Math.random().toString(36).slice(2)}`

  const tokens = getResetTokens().filter((tokenItem) => tokenItem.email !== email.toLowerCase())
  tokens.push({ email: email.toLowerCase(), token, createdAt: Date.now() })
  saveResetTokens(tokens)
  return token
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function validatePassword(value) {
  const trimmed = value.trim()
  if (!trimmed) return 'Password is required.'
  if (trimmed.length < 8) return 'Password must be at least 8 characters long.'
  if (!/[a-zA-Z]/.test(trimmed) || !/\d/.test(trimmed)) {
    return 'Password must contain both letters and numbers.'
  }
  return ''
}

// Banana API question fetcher with timestamp cache-buster
async function fetchBananaQuestion(apiUrl = BANANA_API_URL) {
  const cacheBuster = `out=json&_t=${Date.now()}`
  const targetUrl = `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}${cacheBuster}`

  const response = await fetch(targetUrl)
  if (!response.ok) {
    throw new Error(`Banana API error with status: ${response.status}`)
  }

  const data = await response.json()
  if (!data || !data.question) {
    throw new Error('Banana API returned an invalid response structure')
  }

  return {
    imageUrl: data.question,
    solution: Number(data.solution),
  }
}

function App() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard' | 'gameplay' | 'leaderboard' | 'achievements'
  const [isPlayIntroOpen, setIsPlayIntroOpen] = useState(false)
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false)
  const [levelUpData, setLevelUpData] = useState({ isOpen: false, level: 1, levelName: '' })

  // Audio & Settings State
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('banana_sound_enabled')
      return saved !== null ? JSON.parse(saved) : true
    } catch {
      return true
    }
  })
  const [reducedMotion, setReducedMotion] = useState(() => {
    try {
      const saved = localStorage.getItem('banana_reduced_motion')
      return saved !== null ? JSON.parse(saved) : false
    } catch {
      return false
    }
  })

  // Gameplay State
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy') // 'easy' | 'medium' | 'hard'
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [round, setRound] = useState(1)
  const [attemptCount, setAttemptCount] = useState(0)
  const [gameStatus, setGameStatus] = useState({
    message: 'Look at the banana equation and enter the missing number (0-9)!',
    type: 'info',
  })
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
  const [loadingQuestion, setLoadingQuestion] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [lastPointsAwarded, setLastPointsAwarded] = useState(0)

  // Player Profile & Progression
  const [playerProfile, setPlayerProfile] = useState(null)
  const [leaderboardPreview, setLeaderboardPreview] = useState([])
  const [dailyStatus, setDailyStatus] = useState(null)

  // Auth & UI States
  const [authView, setAuthView] = useState('login')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    resetEmail: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [resetLink, setResetLink] = useState('')
  const [authMessage, setAuthMessage] = useState({ type: '', text: '' })

  // Mascot & Visual Effects
  const [mascotMood, setMascotMood] = useState('dancing')
  const [showConfetti, setShowConfetti] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const googleInitRef = useRef(false)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return Boolean(localStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem('banana_session'))
    } catch {
      return false
    }
  })
  const [sessionUser, setSessionUser] = useState(() => {
    try {
      const user = localStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem('banana_session')
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  })

  // Sound Dispatcher
  const triggerSound = (type) => {
    if (!soundEnabled) return
    if (type === 'click') playClick(true)
    else if (type === 'correct') playCorrect(true)
    else if (type === 'wrong') playWrong(true)
    else if (type === 'levelup') playLevelUp(true)
    else if (type === 'achievement') playAchievement(true)
    else if (type === 'points') playPointsDing(true)
  }

  // Load and synchronize player data
  const loadPlayerData = async (user) => {
    if (!user) return
    const playerId = user.username || user.email?.split('@')[0] || 'explorer'
    await syncPlayer(user)
    const profile = await getPlayerProfile(playerId)
    setPlayerProfile(profile)

    // Load leaderboard preview
    const lb = await getLeaderboard('global')
    setLeaderboardPreview(lb)

    // Load daily status
    const dStatus = await getDailyChallengeStatus(playerId)
    setDailyStatus(dStatus)
  }

  useEffect(() => {
    if (isLoggedIn && sessionUser) {
      loadPlayerData(sessionUser)
    }
  }, [isLoggedIn, sessionUser])

  // Save Settings
  useEffect(() => {
    localStorage.setItem('banana_sound_enabled', JSON.stringify(soundEnabled))
  }, [soundEnabled])

  useEffect(() => {
    localStorage.setItem('banana_reduced_motion', JSON.stringify(reducedMotion))
  }, [reducedMotion])

  // Load Next Banana Question from live API
  const loadNextBananaQuestion = async (resetRound = false) => {
    if (resetRound) setRound(1)
    setLoadingQuestion(true)
    setApiError(null)
    setUserAnswer('')
    setIsAnswerSubmitted(false)
    setAttemptCount(0)
    setLastPointsAwarded(0)
    setGameStatus({
      message: 'Solve the banana equation to discover the missing value (0-9)!',
      type: 'info',
    })

    try {
      const questionData = await fetchGameQuestion()
      setCurrentQuestion({
        imageUrl: questionData.question,
        questionToken: questionData.questionToken,
        solution: questionData.solution,
      })
    } catch (error) {
      console.error('Failed to fetch from Banana API:', error)
      setApiError('Could not reach the Banana Game API. Please check your connection and tap Retry.')
    } finally {
      setLoadingQuestion(false)
    }
  }

  // Start Playing from Intro
  const handleStartGame = (level) => {
    setSelectedDifficulty(level)
    setIsPlayIntroOpen(false)
    setActiveTab('gameplay')
    setRound(1)
    loadNextBananaQuestion()
  }

  // Start Daily Challenge
  const handleStartDailyChallenge = () => {
    setSelectedDifficulty('medium')
    setIsDailyModalOpen(false)
    setActiveTab('gameplay')
    setRound(1)
    loadNextBananaQuestion()
  }

  // Submit Answer
  const handleSubmitAnswer = async (val, timeTaken = 0) => {
    if (!currentQuestion) return
    const num = Number(val)

    if (val === '' || !Number.isInteger(num)) {
      setGameStatus({
        message: 'Please choose a number from 0 to 9!',
        type: 'warning',
      })
      triggerSound('wrong')
      return
    }

    const nextAttempt = attemptCount + 1
    setAttemptCount(nextAttempt)
    const isFirstAttempt = nextAttempt === 1
    const playerId = sessionUser?.username || sessionUser?.email?.split('@')[0] || 'explorer'

    // Server-side validation and points computation
    const result = await submitGameAnswer({
      playerId,
      questionToken: currentQuestion.questionToken,
      questionUrl: currentQuestion.imageUrl,
      submittedAnswer: num,
      solution: currentQuestion.solution,
      attemptCount: nextAttempt,
      level: selectedDifficulty,
      isFirstAttempt,
      timeTaken,
    })

    setIsAnswerSubmitted(true)
    setLastPointsAwarded(result.pointsAwarded || 0)

    if (result.isCorrect) {
      triggerSound('correct')
      triggerSound('points')
      playPointsBurst(soundEnabled)
      setShowConfetti(true)
      setMascotMood('celebrating')

      setGameStatus({
        message: `🎉 SUPER BANANA GENIUS! ${num} is correct! (+${result.pointsAwarded} Banana Points)`,
        type: 'correct',
      })

      // Level-up celebration
      if (result.leveledUp) {
        setTimeout(() => {
          triggerSound('levelup')
          setLevelUpData({
            isOpen: true,
            level: result.level,
            levelName: result.levelName,
          })
        }, 600)
      } else if (result.newlyUnlockedAchievements?.length > 0) {
        setTimeout(() => triggerSound('achievement'), 500)
      }

      // Check if daily challenge completion
      if (isDailyModalOpen || activeTab === 'gameplay') {
        const dStatus = await getDailyChallengeStatus(playerId)
        if (!dStatus.isCompletedToday) {
          await completeDailyChallenge(playerId)
        }
      }
    } else {
      triggerSound('wrong')
      setMascotMood('curious')
      setGameStatus({
        message: `🍌 Good try! ${num} is not quite right. Try again or check the clue!`,
        type: 'wrong',
      })
    }

    // Refresh profile in background
    loadPlayerData(sessionUser)
  }

  // Complete Game Session Handler
  const handleCompleteSession = async (sessionData) => {
    const playerId = sessionUser?.username || sessionUser?.email?.split('@')[0] || 'explorer'
    await completeGameSession({
      playerId,
      rounds: sessionData.rounds,
      correctAnswers: sessionData.correctAnswers,
      incorrectAnswers: sessionData.incorrectAnswers,
      pointsEarned: sessionData.pointsEarned,
      durationSeconds: sessionData.durationSeconds,
      level: sessionData.level,
    })
    loadPlayerData(sessionUser)
  }

  // Google OAuth Initialization
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined

    const scriptId = 'google-oauth-script'
    const initGoogle = () => {
      if (!window.google?.accounts?.id || googleInitRef.current) return
      googleInitRef.current = true
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          const payload = JSON.parse(atob(response.credential.split('.')[1]))
          const googleUser = {
            name: payload.name || 'Jungle Explorer',
            email: payload.email || 'google-user@banana.com',
            password: 'Google123',
          }

          const allUsers = getStoredUsers()
          const exists = allUsers.some((user) => user.email.toLowerCase() === googleUser.email.toLowerCase())
          if (!exists) {
            saveUsers([googleUser, ...allUsers])
          }

          setMascotMood('celebrating')
          setShowConfetti(true)
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(googleUser))
          setSessionUser(googleUser)
          setTimeout(() => {
            setIsLoggedIn(true)
            setAuthMessage({ type: 'success', text: `Welcome to the jungle, ${googleUser.name}!` })
          }, 800)
        },
      })
    }

    if (document.getElementById(scriptId)) {
      initGoogle()
      return undefined
    }

    const script = document.createElement('script')
    script.id = scriptId
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initGoogle
    document.head.appendChild(script)

    return undefined
  }, [])

  const handleFieldChange = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleLogin = (event) => {
    event.preventDefault()
    const identity = (formData.email || document.getElementById('portal-identity')?.value || '').trim().toLowerCase()
    const password = (formData.password || document.getElementById('portal-password')?.value || '').trim()

    if (!identity) {
      setAuthMessage({ type: 'error', text: 'Please enter your jungle explorer name or email.' })
      triggerSound('wrong')
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setAuthMessage({ type: 'error', text: passwordError })
      triggerSound('wrong')
      return
    }

    const users = getStoredUsers()
    const matchedUser = users.find(
      (user) =>
        (user.email?.toLowerCase() === identity || user.username?.toLowerCase() === identity || user.name?.toLowerCase() === identity) &&
        user.password === password,
    )

    if (!matchedUser) {
      setAuthMessage({ type: 'error', text: 'Incorrect jungle email/username or password.' })
      triggerSound('wrong')
      return
    }

    setMascotMood('celebrating')
    setShowConfetti(true)
    triggerSound('correct')
    playLoginSuccess(soundEnabled)
    setAuthMessage({ type: 'success', text: `Welcome, ${matchedUser.name}! Entering the Jungle... 🍌` })

    setTimeout(() => {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(matchedUser))
      setSessionUser(matchedUser)
      setIsLoggedIn(true)
    }, 850)
  }

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      setAuthMessage({
        type: 'error',
        text: 'Google OAuth is not configured yet. Add your Google Client ID to .env.local as VITE_GOOGLE_CLIENT_ID.',
      })
      triggerSound('wrong')
      return
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt()
      return
    }

    setAuthMessage({ type: 'error', text: 'Google authentication is still loading. Please try again in a moment.' })
    triggerSound('wrong')
  }

  const handleSignUp = (event) => {
    event.preventDefault()
    const name = formData.name.trim()
    const email = formData.email.trim().toLowerCase()
    const password = formData.password.trim()
    const confirmPassword = formData.confirmPassword.trim()

    if (!name || name.length < 2) {
      setAuthMessage({ type: 'error', text: 'Name must be at least 2 characters long.' })
      triggerSound('wrong')
      return
    }
    if (!validateEmail(email)) {
      setAuthMessage({ type: 'error', text: 'Please enter a valid email address.' })
      triggerSound('wrong')
      return
    }
    const passwordError = validatePassword(password)
    if (passwordError) {
      setAuthMessage({ type: 'error', text: passwordError })
      triggerSound('wrong')
      return
    }
    if (password !== confirmPassword) {
      setAuthMessage({ type: 'error', text: 'Passwords do not match.' })
      triggerSound('wrong')
      return
    }

    const users = getStoredUsers()
    const exists = users.some((user) => user.email?.toLowerCase() === email)
    if (exists) {
      setAuthMessage({ type: 'error', text: 'This email is already registered. Please sign in instead.' })
      triggerSound('wrong')
      return
    }

    const newUser = { name, email, password }
    saveUsers([newUser, ...users])
    setAuthView('login')
    setFormData({ ...formData, email, password, confirmPassword: '', name: '' })
    setShowConfetti(true)
    triggerSound('correct')
    setAuthMessage({ type: 'success', text: 'Jungle Explorer badge created! You can now sign in.' })
  }

  const handleForgotPassword = (event) => {
    event.preventDefault()
    const emailInput = document.querySelector('input[placeholder="name@example.com"]')
    const email = ((emailInput?.value ?? formData.resetEmail ?? '').trim()).toLowerCase()
    if (!validateEmail(email)) {
      setAuthMessage({ type: 'error', text: 'Please enter a valid email address.' })
      triggerSound('wrong')
      return
    }

    const users = getStoredUsers()
    const matchedUser = findUserByIdentity(users, email)

    if (!matchedUser) {
      setAuthMessage({ type: 'error', text: 'No jungle account was found with that email address.' })
      triggerSound('wrong')
      return
    }

    const token = createResetToken(email)
    const link = `${window.location.origin}/reset?token=${token}`
    setResetLink(link)
    setFormData((current) => ({ ...current, resetEmail: email, email }))
    setAuthView('reset')
    triggerSound('correct')
    setAuthMessage({
      type: 'success',
      text: HAS_REAL_RESET_API
        ? `Password reset link was sent to ${email}.`
        : `A reset link was prepared for ${email}. Use the link below to create your new password.`,
    })

    if (HAS_REAL_RESET_API) {
      fetch(RESET_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, link }),
      }).catch(() => undefined)
    }
  }

  const handleResetPassword = (event) => {
    event.preventDefault()
    const emailInput = document.querySelector('input[placeholder="name@example.com"]')
    const passwordInput = document.querySelector('input[placeholder="Enter new password"]')
    const confirmInput = document.querySelector('input[placeholder="Confirm new password"]')

    const email = ((emailInput?.value ?? formData.resetEmail ?? '').trim()).toLowerCase()
    const password = (passwordInput?.value ?? formData.password ?? '').trim()
    const confirmPassword = (confirmInput?.value ?? formData.confirmPassword ?? '').trim()

    if (!email) {
      setAuthMessage({ type: 'error', text: 'Your email address is missing.' })
      triggerSound('wrong')
      return
    }

    const users = getStoredUsers()
    const tokens = getResetTokens()
    const validToken = tokens.find((tokenItem) => tokenItem.email === email)

    if (!validToken) {
      setAuthMessage({
        type: 'error',
        text: 'Your reset link is invalid or has expired. Please request a new one.',
      })
      setAuthView('forgot')
      triggerSound('wrong')
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setAuthMessage({ type: 'error', text: passwordError })
      triggerSound('wrong')
      return
    }

    if (password !== confirmPassword) {
      setAuthMessage({ type: 'error', text: 'Passwords do not match.' })
      triggerSound('wrong')
      return
    }

    const userIndex = users.findIndex(
      (user) =>
        user.email?.toLowerCase() === email ||
        user.username?.toLowerCase() === email ||
        user.name?.toLowerCase() === email,
    )

    if (userIndex === -1) {
      setAuthMessage({ type: 'error', text: 'Account not found.' })
      triggerSound('wrong')
      return
    }

    users[userIndex].password = password
    saveUsers(users)
    clearResetToken(email)
    setResetLink('')
    setFormData({ name: '', email: '', password: '', confirmPassword: '', resetEmail: '' })
    setAuthView('login')
    setShowConfetti(true)
    triggerSound('correct')
    setAuthMessage({ type: 'success', text: 'Password reset successful! You can now sign in.' })
  }

  const handleLogout = () => {
    triggerSound('click')
    localStorage.removeItem(SESSION_STORAGE_KEY)
    localStorage.removeItem('banana_session')
    setIsLoggedIn(false)
    setSessionUser(null)
    setPlayerProfile(null)
    setActiveTab('dashboard')
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      resetEmail: '',
    })
    setAuthView('login')
    setAuthMessage({ type: '', text: '' })
    setMascotMood('dancing')
  }

  // Update Profile Nickname & Avatar
  const handleUpdateProfile = async ({ nickname, avatar }) => {
    const playerId = sessionUser?.username || sessionUser?.email?.split('@')[0] || 'explorer'
    const updated = await updatePlayerProfile(playerId, { nickname, avatar })
    if (updated) {
      setPlayerProfile((prev) => ({ ...prev, ...updated }))
      triggerSound('correct')
    }
  }

  // --- SCREEN 1: LOGIN & AUTH PORTAL ---
  if (!isLoggedIn) {
    return (
      <main
        className={`banana-game-shell ${reducedMotion ? 'reduced-motion-active' : ''}`}
        onMouseMove={(event) => {
          const x = (event.clientX / window.innerWidth - 0.5) * 2
          const y = (event.clientY / window.innerHeight - 0.5) * 2
          setMousePos({ x, y })
        }}
      >
        <JungleWorld mousePos={mousePos} />
        <ConfettiEffect active={showConfetti} />

        <div className="banana-game-stage">
          <div className="stage-mascot-col">
            <DancingBanana
              mood={mascotMood}
              onTickle={() => {
                triggerSound('click')
                setShowConfetti(true)
              }}
            />
          </div>

          <div className="stage-portal-col">
            <BananaPortalCard
              authView={authView}
              setAuthView={setAuthView}
              formData={formData}
              handleFieldChange={handleFieldChange}
              handleLogin={handleLogin}
              handleGoogleLogin={handleGoogleLogin}
              handleSignUp={handleSignUp}
              handleForgotPassword={handleForgotPassword}
              handleResetPassword={handleResetPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              message={authMessage}
              loading={loadingQuestion}
              resetLink={resetLink}
              onInputFocus={(field) => {
                if (field === 'email') setMascotMood('curious')
                else if (field === 'password') setMascotMood('hiding')
              }}
              onInputBlur={() => setMascotMood('dancing')}
            />
          </div>
        </div>
      </main>
    )
  }

  // --- SCREEN 2: BANANA ADVENTURE PLATFORM (DASHBOARD & GAME) ---
  const playerId = sessionUser?.username || sessionUser?.email?.split('@')[0] || 'explorer'

  return (
    <main className={`banana-platform-shell ${reducedMotion ? 'reduced-motion-active' : ''}`}>
      <ConfettiEffect active={showConfetti} />

      {/* Main Top Jungle Nav Bar */}
      <header className="jungle-navbar">
        <div className="nav-brand-group" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
          <span className="nav-banana-icon">🍌</span>
          <div>
            <h1 className="nav-brand-title">BANANA ADVENTURE</h1>
            <p className="nav-brand-tagline">Learn, Play, Earn & Compete</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links-pills">
          <button
            type="button"
            className={`nav-pill-btn ${activeTab === 'dashboard' ? 'pill-active' : ''}`}
            onClick={() => {
              triggerSound('click')
              setActiveTab('dashboard')
            }}
          >
            <span>🏠 Dashboard</span>
          </button>
          <button
            type="button"
            className={`nav-pill-btn ${activeTab === 'gameplay' ? 'pill-active' : ''}`}
            onClick={() => {
              triggerSound('click')
              setIsPlayIntroOpen(true)
            }}
          >
            <span>🎮 Play Game</span>
          </button>
          <button
            type="button"
            className={`nav-pill-btn ${activeTab === 'leaderboard' ? 'pill-active' : ''}`}
            onClick={() => {
              triggerSound('click')
              setActiveTab('leaderboard')
            }}
          >
            <span>🏆 Leaderboard</span>
          </button>
          <button
            type="button"
            className={`nav-pill-btn ${activeTab === 'achievements' ? 'pill-active' : ''}`}
            onClick={() => {
              triggerSound('click')
              setActiveTab('achievements')
            }}
          >
            <span>🏅 Badges</span>
          </button>
          <button
            type="button"
            className={`nav-pill-btn ${activeTab === 'shop' ? 'pill-active' : ''}`}
            onClick={() => {
              triggerSound('click')
              setActiveTab('shop')
            }}
          >
            <span>🛍️ Shop</span>
          </button>
          <button
            type="button"
            className={`nav-pill-btn ${activeTab === 'profile' ? 'pill-active' : ''}`}
            onClick={() => {
              triggerSound('click')
              setActiveTab('profile')
            }}
          >
            <span>👤 Profile</span>
          </button>
        </nav>

        {/* User Stats & Logout */}
        <div className="nav-user-actions">
          <div className="nav-user-chip" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }} title="View Profile">
            <span className="user-avatar-tag">{playerProfile?.avatar || '🍌'}</span>
            <div className="user-text-tag">
              <strong>{playerProfile?.nickname || 'Explorer'}</strong>
              <small>🍌 {playerProfile?.totalPoints || 0} pts</small>
            </div>
          </div>
          <button
            type="button"
            className="nav-logout-btn"
            onClick={handleLogout}
            title="Log out"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area Based on Active Tab */}
      <div className="platform-main-content">
        {activeTab === 'dashboard' && (
          <DashboardView
            playerProfile={playerProfile}
            onOpenPlayModal={() => setIsPlayIntroOpen(true)}
            onOpenDailyModal={() => setIsDailyModalOpen(true)}
            onNavigateTab={(tab) => {
              triggerSound('click')
              setActiveTab(tab)
            }}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            reducedMotion={reducedMotion}
            setReducedMotion={setReducedMotion}
            onPlaySound={triggerSound}
            leaderboardPreview={leaderboardPreview}
          />
        )}

        {activeTab === 'gameplay' && (
          <GamePlayScreen
            currentQuestion={currentQuestion}
            loadingQuestion={loadingQuestion}
            apiError={apiError}
            level={selectedDifficulty}
            score={playerProfile?.totalPoints || 0}
            streak={playerProfile?.streak || 0}
            round={round}
            maxRounds={5}
            gameStatus={gameStatus}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            onSubmitAnswer={handleSubmitAnswer}
            onNextQuestion={(restart = false) => {
              if (restart) {
                setRound(1)
                loadNextBananaQuestion(true)
              } else {
                setRound((r) => r + 1)
                loadNextBananaQuestion()
              }
            }}
            isAnswerSubmitted={isAnswerSubmitted}
            onBackToDashboard={() => setActiveTab('dashboard')}
            onCompleteSession={handleCompleteSession}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            onPlaySound={triggerSound}
            lastPointsAwarded={lastPointsAwarded}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            currentUserId={playerId}
            onPlaySound={triggerSound}
          />
        )}

        {activeTab === 'achievements' && (
          <AchievementsView
            unlockedBadges={playerProfile?.achievements || []}
            onPlaySound={triggerSound}
          />
        )}

        {activeTab === 'shop' && (
          <ShopView
            playerProfile={playerProfile}
            onUpdatePlayerProfile={setPlayerProfile}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            playerProfile={playerProfile}
            onUpdatePlayerProfile={setPlayerProfile}
            soundEnabled={soundEnabled}
            onOpenPlay={() => setIsPlayIntroOpen(true)}
            onOpenShop={() => setActiveTab('shop')}
          />
        )}
      </div>

      {/* MODALS */}
      <GameIntroModal
        isOpen={isPlayIntroOpen}
        onClose={() => setIsPlayIntroOpen(false)}
        onStartGame={handleStartGame}
        selectedLevel={selectedDifficulty}
        setSelectedLevel={setSelectedDifficulty}
        playerPoints={playerProfile?.totalPoints || 0}
        playerLevelName={playerProfile?.levelName || 'Banana Beginner'}
        onPlaySound={triggerSound}
      />

      <DailyChallengeModal
        isOpen={isDailyModalOpen}
        onClose={() => setIsDailyModalOpen(false)}
        onStartDailyPuzzle={handleStartDailyChallenge}
        challengeStatus={dailyStatus}
        onPlaySound={triggerSound}
      />

      <LevelUpModal
        isOpen={levelUpData.isOpen}
        onClose={() => setLevelUpData({ isOpen: false, level: 1, levelName: '' })}
        newLevel={levelUpData.level}
        newLevelName={levelUpData.levelName}
        onPlaySound={triggerSound}
      />
    </main>
  )
}

export default App
