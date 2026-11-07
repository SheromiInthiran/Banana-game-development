// ============================================================
// BANANA GAME — AUDIO ENGINE
// Pure Web Audio API — no files needed
// ============================================================

let audioCtx = null

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (AC) audioCtx = new AC()
  }
  if (audioCtx?.state === 'suspended') audioCtx.resume()
  return audioCtx
}

// ============================================================
// SOUND EFFECTS
// ============================================================

export function playClick(enabled = true) {
  if (!enabled) return
  const ctx = getCtx(); if (!ctx) return
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(440, ctx.currentTime)
  o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08)
  g.gain.setValueAtTime(0.15, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
  o.connect(g); g.connect(ctx.destination)
  o.start(); o.stop(ctx.currentTime + 0.08)
}

export function playCorrect(enabled = true) {
  if (!enabled) return
  const ctx = getCtx(); if (!ctx) return
  ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'triangle'
    o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08)
    g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08)
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.28)
    o.connect(g); g.connect(ctx.destination)
    o.start(ctx.currentTime + i * 0.08); o.stop(ctx.currentTime + i * 0.08 + 0.3)
  })
}

export function playWrong(enabled = true) {
  if (!enabled) return
  const ctx = getCtx(); if (!ctx) return
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(320, ctx.currentTime)
  o.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.25)
  g.gain.setValueAtTime(0.15, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
  o.connect(g); g.connect(ctx.destination)
  o.start(); o.stop(ctx.currentTime + 0.25)
}

export function playLevelUp(enabled = true) {
  if (!enabled) return
  const ctx = getCtx(); if (!ctx) return
  ;[{ f: 523.25, t: 0 }, { f: 659.25, t: 0.12 }, { f: 783.99, t: 0.24 },
    { f: 1046.5, t: 0.4 }, { f: 1318.51, t: 0.58 }].forEach(({ f, t }) => {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'triangle'
    o.frequency.setValueAtTime(f, ctx.currentTime + t)
    g.gain.setValueAtTime(0.25, ctx.currentTime + t)
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + t + 0.4)
    o.connect(g); g.connect(ctx.destination)
    o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.42)
  })
}

export function playAchievement(enabled = true) {
  if (!enabled) return
  const ctx = getCtx(); if (!ctx) return
  ;[783.99, 987.77, 1174.66, 1567.98].forEach((freq, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09)
    g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.09)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.35)
    o.connect(g); g.connect(ctx.destination)
    o.start(ctx.currentTime + i * 0.09); o.stop(ctx.currentTime + i * 0.09 + 0.38)
  })
}

export function playPointsDing(enabled = true) {
  if (!enabled) return
  const ctx = getCtx(); if (!ctx) return
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(987.77, ctx.currentTime)
  o.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08)
  g.gain.setValueAtTime(0.18, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
  o.connect(g); g.connect(ctx.destination)
  o.start(); o.stop(ctx.currentTime + 0.25)
}

export function playPointsBurst(enabled = true) {
  if (!enabled) return
  const ctx = getCtx(); if (!ctx) return
  ;[987.77, 1174.66, 1318.51, 1567.98].forEach((freq, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06)
    o.frequency.exponentialRampToValueAtTime(freq * 1.08, ctx.currentTime + i * 0.06 + 0.1)
    g.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.06)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.22)
    o.connect(g); g.connect(ctx.destination)
    o.start(ctx.currentTime + i * 0.06); o.stop(ctx.currentTime + i * 0.06 + 0.25)
  })
}

export function playLoginSuccess(enabled = true) {
  if (!enabled) return
  const ctx = getCtx(); if (!ctx) return
  ;[
    { f: 523.25, t: 0.00, d: 0.18 },
    { f: 659.25, t: 0.10, d: 0.18 },
    { f: 783.99, t: 0.20, d: 0.18 },
    { f: 1046.5, t: 0.32, d: 0.35 },
    { f: 1318.5, t: 0.46, d: 0.50 },
  ].forEach(({ f, t, d }) => {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'triangle'
    o.frequency.setValueAtTime(f, ctx.currentTime + t)
    g.gain.setValueAtTime(0.22, ctx.currentTime + t)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d)
    o.connect(g); g.connect(ctx.destination)
    o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + d + 0.05)
  })
}

export function playPurchase(enabled = true) {
  if (!enabled) return
  const ctx = getCtx(); if (!ctx) return
  ;[659.25, 880, 1318.51].forEach((freq, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07)
    g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.07)
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.07 + 0.2)
    o.connect(g); g.connect(ctx.destination)
    o.start(ctx.currentTime + i * 0.07); o.stop(ctx.currentTime + i * 0.07 + 0.22)
  })
}

export function playVictory(enabled = true) {
  if (!enabled) return
  const ctx = getCtx(); if (!ctx) return
  ;[523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'triangle'
    o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.07)
    g.gain.setValueAtTime(0.22, ctx.currentTime + i * 0.07)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
    o.connect(g); g.connect(ctx.destination)
    o.start(ctx.currentTime + i * 0.07); o.stop(ctx.currentTime + 1.25)
  })
}

export function playTimerTick(enabled = true) {
  if (!enabled) return
  const ctx = getCtx(); if (!ctx) return
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = 'square'
  o.frequency.setValueAtTime(800, ctx.currentTime)
  g.gain.setValueAtTime(0.05, ctx.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
  o.connect(g); g.connect(ctx.destination)
  o.start(); o.stop(ctx.currentTime + 0.04)
}
