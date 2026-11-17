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
import LoginMusicControl from './components/LoginMusicControl'
import GoogleAuthModal from './components/GoogleAuthModal'
import ThemeSelector from './components/ThemeSelector'
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
  equipShopItem,
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
const HAS_REAL_GOOGLE_CLIENT =
  Boolean(GOOGLE_CLIENT_ID) && !GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID_HERE')
const RESET_API_URL = import.meta.env.VITE_RESET_API_URL || ''
const HAS_REAL_RESET_API = Boolean(RESET_API_URL) && !RESET_API_URL.includes('your-reset-api.example.com')
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || ''
const HAS_REAL_EMAIL_SERVICE =
  Boolean(WEB3FORMS_ACCESS_KEY) && !WEB3FORMS_ACCESS_KEY.includes('YOUR_WEB3FORMS_ACCESS_KEY_HERE')

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

const SESSION_COOKIE_NAME = 'banana_session_cookie'
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

function getCookie(name) {
  if (typeof document === 'undefined') return ''
  const cookieString = document.cookie || ''
  const match = cookieString
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : ''
}

function setCookie(name, value, maxAgeSeconds = SESSION_COOKIE_MAX_AGE) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`
}

function deleteCookie(name) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
}

function getStoredSessionUser() {
  try {
    const cookieUser = getCookie(SESSION_COOKIE_NAME)
    if (cookieUser) {
      return JSON.parse(cookieUser)
    }

    const raw = localStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem('banana_session')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function persistSessionUser(user) {
  if (user) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))
    localStorage.setItem('banana_session', JSON.stringify(user))
    setCookie(SESSION_COOKIE_NAME, JSON.stringify(user), SESSION_COOKIE_MAX_AGE)
    return
  }

  localStorage.removeItem(SESSION_STORAGE_KEY)
  localStorage.removeItem('banana_session')
  deleteCookie(SESSION_COOKIE_NAME)
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
  const [currentTheme, setCurrentTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('banana_color_theme')
      if (!saved || saved === 'theme_night') return 'theme_jungle'
      return saved
    } catch {
      return 'theme_jungle'
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
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false)
  const [enableMfa, setEnableMfa] = useState(true)
  const [mfaData, setMfaData] = useState(null)

  // Mascot & Visual Effects
  const [mascotMood, setMascotMood] = useState('dancing')
  const [showConfetti, setShowConfetti] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const googleInitRef = useRef(false)
  const tokenClientRef = useRef(null)
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getStoredSessionUser()))
  const [sessionUser, setSessionUser] = useState(() => getStoredSessionUser())

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

    // Sync equipped theme
    if (profile?.equipped?.themes) {
      const activeTheme = profile.equipped.themes === 'theme_night' ? 'theme_jungle' : profile.equipped.themes
      setCurrentTheme(activeTheme)
      localStorage.setItem('banana_color_theme', activeTheme)
    }
  }

  // Handle color theme switch
  const handleThemeChange = async (themeId) => {
    triggerSound('click')
    setCurrentTheme(themeId)
    localStorage.setItem('banana_color_theme', themeId)

    if (sessionUser && playerProfile) {
      const playerId = sessionUser.username || sessionUser.email?.split('@')[0] || 'explorer'
      try {
        await equipShopItem({
          playerId,
          category: 'themes',
          itemId: themeId,
        })
        setPlayerProfile((prev) => (prev ? {
          ...prev,
          equipped: {
            ...prev.equipped,
            themes: themeId,
          },
        } : prev))
      } catch {
        // fallback ignored
      }
    }
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

    // Dispatch MFA Security Code directly to user's real Gmail inbox
    const sendMfaEmail = async (email, user) => {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const mfaInfo = { email, code, pendingUser: user }
      setMfaData(mfaInfo)
        setAuthView('mfa')
    triggerSound('achievement')

    setAuthMessage({
          type: 'info',
          text: `⏳ Sending 6-digit verification code to your Gmail (${email})...`,
    })

    // Direct real email delivery to user's Gmail using FormSubmit
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${email}`, {
      method: 'POST',
        headers: {
        'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      body: JSON.stringify({
        _subject: `🍌 Your Banana Adventure 2-Step Verification Code: ${code}`,
        _captcha: 'false',
        _template: 'box',
        'Verification Code': code,
        'Account': email,
        'Message': `Hello ${user?.name || 'Explorer'}! Your one-time verification PIN is: ${code}. Enter this code on the screen to access Banana Adventure.`,
      }),
      })

      const data = await response.json().catch(() => ({}))
      if (data.success === 'true' || data.success === true) {
        setAuthMessage({
          type: 'success',
          text: `📬 Verification code sent directly to your Gmail (${email})! Check your inbox.`,
        })
          } else if (data.message && data.message.includes('Activation')) {
            setAuthMessage({
              type: 'info',
              text: `📬 Check your Gmail (${email})! Click 'Activate Form' in the email from FormSubmit once, then click Resend Code.`,
            })
        } else {
          setAuthMessage({
            type: 'success',
            text: `📬 Verification code sent to your Gmail (${email})! Check your inbox.`,
          })
        }
      } catch (err) {
        console.warn('Email dispatch via FormSubmit:', err)
        // Fallback to Web3Forms if configured
        if (HAS_REAL_EMAIL_SERVICE) {
          fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              access_key: WEB3FORMS_ACCESS_KEY,
              subject: `🍌 Banana Adventure Verification Code: ${code}`,
              email: email,
              message: `Your verification code is: ${code}`,
            }),
          }).catch((e) => console.error(e))
        }
        setAuthMessage({
          type: 'info',
          text: `📬 Verification code dispatched to ${email}! Please check your Gmail inbox.`,
        })
      }
    }

  const handleVerifyMfa = (enteredCode) => {
    if (!mfaData) return
    if (enteredCode === mfaData.code) {
      setMascotMood('celebrating')
      setShowConfetti(true)
      triggerSound('correct')
      playLoginSuccess(soundEnabled)
      setAuthMessage({
        type: 'success',
        text: `🎉 Verified! Welcome, ${mfaData.pendingUser?.name || 'Explorer'}! Entering the Jungle... 🍌`,
      })

      setTimeout(() => {
        persistSessionUser(mfaData.pendingUser)
        setSessionUser(mfaData.pendingUser)
        setIsLoggedIn(true)
        setMfaData(null)
      }, 850)
    } else {
      triggerSound('wrong')
      setAuthMessage({
        type: 'error',
        text: '❌ Invalid 6-digit security PIN. Please check the code received in your Gmail inbox.',
      })
    }
  }

  const handleResendMfa = () => {
    if (!mfaData) return
    sendMfaEmail(mfaData.email, mfaData.pendingUser)
    setAuthMessage({
      type: 'info',
      text: `📩 Fresh security PIN dispatched to your Gmail (${mfaData.email})!`,
    })
  }

  // Handle successful Google authentication
  const handleGoogleSuccess = (googleData) => {
    const email = (googleData.email || '').trim().toLowerCase()
    const name = googleData.name || (email.includes('@') ? email.split('@')[0] : 'Sheromi Inthiran')
    const username = email.includes('@') ? email.split('@')[0] : 'sheromi'

    const googleUser = {
      name,
      email,
      username,
      password: 'GoogleOAuth2User',
      provider: 'google',
      avatar: '🍌',
    }

    const allUsers = getStoredUsers()
    const exists = allUsers.some((u) => u.email?.toLowerCase() === email)
    if (!exists) {
      saveUsers([googleUser, ...allUsers])
    }

    // Populate email in form data so the user's email address is visibly shown on the login card
    setFormData((prev) => ({ ...prev, email }))

    // Dispatches message to user's mail and triggers 2-step verification
    sendMfaEmail(email, googleUser)
  }

  // Google OAuth Initialization
  useEffect(() => {
    if (!HAS_REAL_GOOGLE_CLIENT) return undefined

    const setupGoogle = () => {
      if (!window.google?.accounts) return

      // 1. Initialize Google Identity Services (One Tap & ID Token)
      try {
        if (!googleInitRef.current && window.google.accounts.id) {
          googleInitRef.current = true
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => {
              try {
                const payload = JSON.parse(atob(response.credential.split('.')[1]))
                handleGoogleSuccess({
                  name: payload.name || payload.email?.split('@')[0] || 'Jungle Explorer',
                  email: payload.email,
                  avatar: payload.picture,
                })
              } catch (err) {
                console.error('Failed to parse Google OAuth credential:', err)
              }
            },
          })
        }
      } catch (err) {
        console.warn('Google accounts.id initialize:', err)
      }

      // 2. Initialize OAuth 2.0 Token Client for direct popup flow
      try {
        if (window.google.accounts.oauth2 && !tokenClientRef.current) {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile openid',
            callback: async (tokenResponse) => {
              if (tokenResponse.error) {
                console.error('Google OAuth token error:', tokenResponse)
                setAuthMessage({
                  type: 'error',
                  text: `Google error: ${tokenResponse.error_description || tokenResponse.error}. Check Authorized JavaScript origins in Google Cloud Console.`,
                })
                return
              }
              if (tokenResponse.access_token) {
                try {
                  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                  })
                  const profile = await res.json()
                  if (profile.email) {
                    handleGoogleSuccess({
                      name: profile.name || profile.email.split('@')[0],
                      email: profile.email,
                      avatar: profile.picture,
                    })
                  }
                } catch (err) {
                  console.error('Error fetching Google profile:', err)
                  setAuthMessage({ type: 'error', text: 'Failed to retrieve profile from Google.' })
                }
              }
            },
          })
        }
      } catch (err) {
        console.warn('Google accounts.oauth2 initialize:', err)
      }
    }

    if (window.google?.accounts) {
      setupGoogle()
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts) {
          setupGoogle()
          clearInterval(timer)
        }
      }, 150)
      return () => clearInterval(timer)
    }

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

    if (enableMfa) {
      sendMfaEmail(matchedUser.email || identity, matchedUser)
      return
    }

    setMascotMood('celebrating')
    setShowConfetti(true)
    triggerSound('correct')
    playLoginSuccess(soundEnabled)
    setAuthMessage({ type: 'success', text: `Welcome, ${matchedUser.name}! Entering the Jungle... 🍌` })

    setTimeout(() => {
      persistSessionUser(matchedUser)
      setSessionUser(matchedUser)
      setIsLoggedIn(true)
    }, 850)
  }

  const handleGoogleLogin = () => {
    triggerSound('click')

    if (HAS_REAL_GOOGLE_CLIENT) {
      // 1. Initialize tokenClient on-demand if not already created
      if (!tokenClientRef.current && window.google?.accounts?.oauth2) {
        try {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile openid',
            callback: async (tokenResponse) => {
              if (tokenResponse.error) {
                console.error('Google OAuth token error:', tokenResponse)
                setAuthMessage({
                  type: 'error',
                  text: `Google error: ${tokenResponse.error_description || tokenResponse.error}. Check Authorized JavaScript origins in Google Cloud Console.`,
                })
                return
              }
              if (tokenResponse.access_token) {
                try {
                  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                  })
                  const profile = await res.json()
                  if (profile.email) {
                    handleGoogleSuccess({
                      name: profile.name || profile.email.split('@')[0],
                      email: profile.email,
                      avatar: profile.picture,
                    })
                  }
                } catch (err) {
                  console.error('Error fetching Google profile:', err)
                  setAuthMessage({ type: 'error', text: 'Failed to retrieve profile from Google.' })
                }
              }
            },
          })
        } catch (e) {
          console.warn('On-demand tokenClient init failed:', e)
        }
      }

      // 2. Launch the official Google account chooser popup window
      if (tokenClientRef.current) {
        tokenClientRef.current.requestAccessToken({ prompt: 'select_account' })
        return
      }

      // 3. Alternatively trigger Google One Tap
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.prompt()
          return
        } catch (e) {
          console.error('Google prompt error:', e)
        }
      }
    }

    // Fallback only if no Google client ID is configured
    setIsGoogleModalOpen(true)
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
    persistSessionUser(null)
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
        className={`banana-game-shell ${currentTheme} ${reducedMotion ? 'reduced-motion-active' : ''}`}
        onMouseMove={(event) => {
          const x = (event.clientX / window.innerWidth - 0.5) * 2
          const y = (event.clientY / window.innerHeight - 0.5) * 2
          setMousePos({ x, y })
        }}
      >
        <JungleWorld mousePos={mousePos} />
        <ConfettiEffect active={showConfetti} />
        <LoginMusicControl />
        <div className="login-theme-picker-corner">
          <ThemeSelector
            currentTheme={currentTheme}
            onSelectTheme={handleThemeChange}
            onPlaySound={triggerSound}
          />
        </div>

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
              mfaData={mfaData}
              handleVerifyMfa={handleVerifyMfa}
              handleResendMfa={handleResendMfa}
              enableMfa={enableMfa}
              setEnableMfa={setEnableMfa}
            />
          </div>
        </div>

        <GoogleAuthModal
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
          onSelectAccount={handleGoogleSuccess}
          onPlaySound={triggerSound}
        />
      </main>
    )
  }

  // --- SCREEN 2: BANANA ADVENTURE PLATFORM (DASHBOARD & GAME) ---
  const playerId = sessionUser?.username || sessionUser?.email?.split('@')[0] || 'explorer'

  return (
    <main className={`banana-platform-shell ${currentTheme} ${reducedMotion ? 'reduced-motion-active' : ''}`}>
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
          <ThemeSelector
            currentTheme={currentTheme}
            onSelectTheme={handleThemeChange}
            onPlaySound={triggerSound}
          />
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
            currentTheme={currentTheme}
            onSelectTheme={handleThemeChange}
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
            onSelectTheme={handleThemeChange}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            playerProfile={playerProfile}
            onUpdatePlayerProfile={setPlayerProfile}
            soundEnabled={soundEnabled}
            onOpenPlay={() => setIsPlayIntroOpen(true)}
            onOpenShop={() => setActiveTab('shop')}
            currentTheme={currentTheme}
            onSelectTheme={handleThemeChange}
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
