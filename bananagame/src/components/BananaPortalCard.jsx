import { useEffect, useState } from 'react'

export default function BananaPortalCard({
  authView,
  setAuthView,
  formData,
  handleFieldChange,
  handleLogin,
  handleGoogleLogin,
  handleSignUp,
  handleForgotPassword,
  handleResetPassword,
  showPassword,
  setShowPassword,
  message,
  loading,
  resetLink,
  onInputFocus,
  onInputBlur,
  mfaData,
  handleVerifyMfa,
  handleResendMfa,
  enableMfa,
  setEnableMfa,
}) {
  const [rememberMe, setRememberMe] = useState(true)
  const [agreeRules, setAgreeRules] = useState(true)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [resendCountdown, setResendCountdown] = useState(30)

  useEffect(() => {
    if (authView !== 'mfa') return undefined
    setOtpDigits(['', '', '', '', '', ''])
    setResendCountdown(30)
    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [authView, mfaData?.code])

  const handleDigitChange = (index, value) => {
    const val = value.slice(-1).replace(/[^0-9]/g, '')
    const next = [...otpDigits]
    next[index] = val
    setOtpDigits(next)

    if (val && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus()
    }
  }

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
    if (pasted) {
      const next = [...otpDigits]
      for (let i = 0; i < 6; i++) {
        next[i] = pasted[i] || ''
      }
      setOtpDigits(next)
      const lastIndex = Math.min(pasted.length, 5)
      document.getElementById(`otp-input-${lastIndex}`)?.focus()
    }
  }

  const fillOtpCode = (code) => {
    const digits = String(code).slice(0, 6).split('')
    while (digits.length < 6) digits.push('')
    setOtpDigits(digits)
    document.getElementById('otp-input-5')?.focus()
  }

  const onMfaSubmit = (e) => {
    e.preventDefault()
    const entered = otpDigits.join('')
    if (entered.length === 6 && handleVerifyMfa) {
      handleVerifyMfa(entered)
    }
  }

  const handleResend = () => {
    if (resendCountdown > 0) return
    setResendCountdown(30)
    if (handleResendMfa) handleResendMfa()
  }

  return (
    <div className="banana-portal-card">
      {/* Decorative Bamboo & Tropical Vine Corners */}
      <div className="portal-vine-corner corner-tl">🍌</div>
      <div className="portal-vine-corner corner-tr">🍌</div>
      <div className="portal-crystal crystal-left" />
      <div className="portal-crystal crystal-right" />

      {/* Top Jungle Crest Badge */}
      <div className="portal-crest banana-crest">
        <span className="crest-star">⭐</span>
        <span className="crest-text">BANANA JUNGLE GATEWAY</span>
        <span className="crest-star">⭐</span>
      </div>

      {/* Animated 3D Banana Game Title / Logo */}
      <div className="portal-brand-banner">
        <div className="brand-title-row">
          <span className="title-banana-icon">🍌</span>
          <h1 className="game-brand-title">
            <span className="title-word-banana">BANANA</span>
            <span className="title-word-game">GAME</span>
          </h1>
          <span className="title-banana-icon bounce-alt">🍌</span>
        </div>
        <div className="jungle-adventure-tag">
          <span className="jungle-sparkle">✨</span>
          <span className="jungle-tag-text">MAGICAL JUNGLE ADVENTURE!</span>
          <span className="jungle-sparkle">✨</span>
        </div>
      </div>

      {/* Welcoming Message */}
      <div className="portal-welcome-text">
        <h2 className="welcome-headline">
          {authView === 'login'
            ? 'Hey Jungle Explorer!'
            : authView === 'register'
              ? 'Join the Jungle Tribe!'
              : authView === 'forgot'
                ? 'Lost Your Jungle Key?'
                : authView === 'mfa'
                  ? '🛡️ 2-Step Verification'
                  : 'Craft a New Jungle Key!'}
        </h2>
        <p className="welcome-subtext">
          {authView === 'login'
            ? 'Ready for a joyful dancing banana adventure? Sign in to continue!'
            : authView === 'register'
              ? 'Pick your explorer name and join our cheerful jungle world!'
              : authView === 'forgot'
                ? "Enter your email and we'll prepare your secret jungle key!"
                : authView === 'mfa'
                  ? 'Multi-Factor Authentication: Enter the 6-digit security PIN to proceed.'
                  : 'Choose a strong new password for your jungle account.'}
        </p>
      </div>

      {/* View Switcher Tabs (Sign In / New Explorer) */}
      {(authView === 'login' || authView === 'register') && (
        <div className="portal-tabs-nav banana-tabs-nav">
          <button
            type="button"
            className={`tab-btn ${authView === 'login' ? 'active-tab' : ''}`}
            onClick={() => setAuthView('login')}
          >
            <span className="tab-icon">🌟</span> Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${authView === 'register' ? 'active-tab' : ''}`}
            onClick={() => setAuthView('register')}
          >
            <span className="tab-icon">🌴</span> New Explorer
          </button>
        </div>
      )}

      {/* Status / Error Message Banner */}
      {message.text && (
        <div className={`portal-status-bubble ${message.type}`} role="alert">
          <span className="status-bubble-icon">
            {message.type === 'error' ? '⚠️' : '🍌'}
          </span>
          <span className="status-bubble-text">{message.text}</span>
        </div>
      )}

      {/* 1. SIGN IN FORM */}
      {authView === 'login' && (
        <form className="portal-form" onSubmit={handleLogin}>
          {/* Email / Username Field */}
          <div className="portal-field">
            <label className="field-label" htmlFor="portal-identity">
              <span className="field-icon">🍌</span>
              <span>Explorer Name or Email</span>
            </label>
            <div className="input-wrap">
              <input
                id="portal-identity"
                type="text"
                value={formData.email}
                onChange={handleFieldChange('email')}
                onFocus={() => onInputFocus('email')}
                onBlur={onInputBlur}
                placeholder="e.g. sheromi or name@example.com"
                autoComplete="username"
                className="game-input banana-input"
              />
              <span className="input-shine" />
            </div>
          </div>

          {/* Password Field */}
          <div className="portal-field">
            <label className="field-label" htmlFor="portal-password">
              <span className="field-icon">🔑</span>
              <span>Secret Jungle Key</span>
            </label>
            <div className="input-wrap password-wrap">
              <input
                id="portal-password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleFieldChange('password')}
                onFocus={() => onInputFocus('password')}
                onBlur={onInputBlur}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="game-input banana-input"
              />
              <button
                type="button"
                className="show-pwd-toggle-btn"
                onClick={() => setShowPassword((val) => !val)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈 Hide' : '👁️ Show'}
              </button>
              <span className="input-shine" />
            </div>
          </div>

          {/* PROPERLY PLACED OPTIONS ROW: Checkbox on Left, Forgot Key on Right */}
          <div className="portal-options-row">
            <label className="custom-remember-label" htmlFor="portal-remember-me">
              <input
                id="portal-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="custom-checkbox-input"
              />
              <span className={`checkbox-visual-box ${rememberMe ? 'box-checked' : ''}`}>
                {rememberMe && <span className="check-mark-glyph">✓</span>}
              </span>
              <span className="remember-text-label">Keep me signed in</span>
            </label>

            <button
              type="button"
              className="forgot-link-btn"
              onClick={() => setAuthView('forgot')}
              title="Recover forgotten jungle key"
            >
              Forgot key? 🗝️
            </button>
          </div>

          {/* Action Buttons */}
          <div className="portal-actions">
            <button
              type="submit"
              className="game-button btn-primary btn-banana-primary"
              disabled={loading}
            >
              <span className="btn-shine" />
              <span className="btn-content">
                {loading ? (
                  <>
                    <span className="btn-spinner">🍌</span>
                    <span>Opening Jungle Gates...</span>
                  </>
                ) : (
                  <>
                    <span>ENTER THE JUNGLE!</span>
                    <span className="btn-arrow">🍌</span>
                  </>
                )}
              </span>
            </button>

            <div className="portal-divider">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="btn-google"
              onClick={handleGoogleLogin}
            >
              <svg className="google-icon-svg" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Footer Helper */}
          <div className="portal-footer-tip">
            <span>First time in the jungle?</span>
            <button
              type="button"
              className="inline-action-link"
              onClick={() => setAuthView('register')}
            >
              Create New Explorer Badge 🌟
            </button>
          </div>
        </form>
      )}

      {/* 2. REGISTRATION FORM */}
      {authView === 'register' && (
        <form className="portal-form" onSubmit={handleSignUp}>
          <div className="portal-field">
            <label className="field-label" htmlFor="register-name">
              <span className="field-icon">⭐</span>
              <span>Your Explorer Name</span>
            </label>
            <div className="input-wrap">
              <input
                id="register-name"
                type="text"
                value={formData.name}
                onChange={handleFieldChange('name')}
                placeholder="e.g. Jungle Hero"
                className="game-input banana-input"
              />
            </div>
          </div>

          <div className="portal-field">
            <label className="field-label" htmlFor="register-email">
              <span className="field-icon">📧</span>
              <span>Email Address</span>
            </label>
            <div className="input-wrap">
              <input
                id="register-email"
                type="email"
                value={formData.email}
                onChange={handleFieldChange('email')}
                placeholder="name@example.com"
                className="game-input banana-input"
              />
            </div>
          </div>

          <div className="portal-field">
            <label className="field-label" htmlFor="register-pwd">
              <span className="field-icon">🔑</span>
              <span>Create Secret Password</span>
            </label>
            <div className="input-wrap">
              <input
                id="register-pwd"
                type="password"
                value={formData.password}
                onChange={handleFieldChange('password')}
                onFocus={() => onInputFocus('password')}
                onBlur={onInputBlur}
                placeholder="At least 8 letters & numbers"
                className="game-input banana-input"
              />
            </div>
          </div>

          <div className="portal-field">
            <label className="field-label" htmlFor="register-cpwd">
              <span className="field-icon">🔒</span>
              <span>Confirm Secret Password</span>
            </label>
            <div className="input-wrap">
              <input
                id="register-cpwd"
                type="password"
                value={formData.confirmPassword}
                onChange={handleFieldChange('confirmPassword')}
                onFocus={() => onInputFocus('password')}
                onBlur={onInputBlur}
                placeholder="Re-enter your secret password"
                className="game-input banana-input"
              />
            </div>
          </div>

          {/* Registration Friendly Promise Checkbox */}
          <div className="portal-options-row">
            <label className="custom-remember-label" htmlFor="portal-agree-rules">
              <input
                id="portal-agree-rules"
                type="checkbox"
                checked={agreeRules}
                onChange={(e) => setAgreeRules(e.target.checked)}
                className="custom-checkbox-input"
              />
              <span className={`checkbox-visual-box ${agreeRules ? 'box-checked' : ''}`}>
                {agreeRules && <span className="check-mark-glyph">✓</span>}
              </span>
              <span className="remember-text-label">I promise to be a friendly jungle explorer 🌴</span>
            </label>
          </div>

          {/* MFA Checkbox */}
          <div className="portal-options-row">
            <label className="custom-remember-label" htmlFor="portal-enable-mfa">
              <input
                id="portal-enable-mfa"
                type="checkbox"
                checked={enableMfa}
                onChange={(e) => setEnableMfa(e.target.checked)}
                className="custom-checkbox-input"
              />
              <span className={`checkbox-visual-box ${enableMfa ? 'box-checked' : ''}`}>
                {enableMfa && <span className="check-mark-glyph">✓</span>}
              </span>
              <span className="remember-text-label">Enable 2-Step Verification (MFA) 🛡️</span>
            </label>
          </div>

          <div className="portal-actions">
            <button type="submit" className="game-button btn-primary btn-banana-primary">
              <span className="btn-shine" />
              <span className="btn-content">
                <span>CREATE MY JUNGLE BADGE!</span>
                <span className="btn-arrow">🌟</span>
              </span>
            </button>

            <div className="portal-divider">
              <span>OR</span>
            </div>

            <button
              type="button"
              className="btn-google"
              onClick={handleGoogleLogin}
            >
              <svg className="google-icon-svg" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign up with Google</span>
            </button>

            <button
              type="button"
              className="game-button btn-secondary"
              onClick={() => setAuthView('login')}
            >
              <span>Back to Sign In</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. FORGOT PASSWORD FORM */}
      {authView === 'forgot' && (
        <form className="portal-form" onSubmit={handleForgotPassword}>
          <div className="portal-field">
            <label className="field-label" htmlFor="forgot-email">
              <span className="field-icon">📧</span>
              <span>Registered Explorer Email</span>
            </label>
            <div className="input-wrap">
              <input
                id="forgot-email"
                type="email"
                value={formData.resetEmail}
                onChange={handleFieldChange('resetEmail')}
                placeholder="name@example.com"
                className="game-input banana-input"
              />
            </div>
          </div>

          <div className="portal-actions">
            <button type="submit" className="game-button btn-primary btn-banana-primary">
              <span className="btn-shine" />
              <span className="btn-content">
                <span>SEND JUNGLE RESET KEY</span>
                <span className="btn-arrow">🗝️</span>
              </span>
            </button>

            <button
              type="button"
              className="game-button btn-secondary"
              onClick={() => setAuthView('login')}
            >
              <span>Back to Sign In</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. RESET PASSWORD FORM */}
      {authView === 'reset' && (
        <form className="portal-form" onSubmit={handleResetPassword}>
          <div className="portal-info-box">
            <p>
              A secure reset link was generated for{' '}
              <strong>{formData.resetEmail || 'your email'}</strong>.
            </p>
            {resetLink && (
              <a
                className="reset-magic-link"
                href={resetLink}
                target="_blank"
                rel="noreferrer"
              >
                {resetLink}
              </a>
            )}
          </div>

          <div className="portal-field">
            <label className="field-label" htmlFor="reset-new-pwd">
              <span className="field-icon">🔑</span>
              <span>New Secret Password</span>
            </label>
            <div className="input-wrap">
              <input
                id="reset-new-pwd"
                type="password"
                value={formData.password}
                onChange={handleFieldChange('password')}
                onFocus={() => onInputFocus('password')}
                onBlur={onInputBlur}
                placeholder="Enter new password"
                className="game-input banana-input"
              />
            </div>
          </div>

          <div className="portal-field">
            <label className="field-label" htmlFor="reset-conf-pwd">
              <span className="field-icon">🔒</span>
              <span>Confirm New Password</span>
            </label>
            <div className="input-wrap">
              <input
                id="reset-conf-pwd"
                type="password"
                value={formData.confirmPassword}
                onChange={handleFieldChange('confirmPassword')}
                onFocus={() => onInputFocus('password')}
                onBlur={onInputBlur}
                placeholder="Confirm new password"
                className="game-input banana-input"
              />
            </div>
          </div>

          <div className="portal-actions">
            <button type="submit" className="game-button btn-primary btn-banana-primary">
              <span className="btn-shine" />
              <span className="btn-content">
                <span>SAVE NEW JUNGLE KEY!</span>
                <span className="btn-arrow">✨</span>
              </span>
            </button>

            <button
              type="button"
              className="game-button btn-secondary"
              onClick={() => setAuthView('login')}
            >
              <span>Back to Sign In</span>
            </button>
          </div>
        </form>
      )}

      {/* 5. MULTI-FACTOR AUTHENTICATION (MFA) VERIFICATION FORM */}
      {authView === 'mfa' && (
        <form className="portal-form mfa-form" onSubmit={onMfaSubmit}>
          <div className="mfa-shield-banner">
            <span className="mfa-shield-icon">🛡️</span>
            <h3>2-Step Verification</h3>
            <p>
              To protect your jungle account, enter the 6-digit security code sent to{' '}
              <strong>{mfaData?.email || 'your email'}</strong>
            </p>
          </div>

          {/* Active Demo Code Helper */}
          {mfaData?.code && (
            <div className="mfa-demo-code-tip">
              <span>📧 Security PIN sent: </span>
              <strong>{mfaData.code}</strong>
              <button
                type="button"
                className="mfa-autofill-btn"
                onClick={() => fillOtpCode(mfaData.code)}
                title="Automatically fill in this test code"
              >
                Auto-fill ⚡
              </button>
            </div>
          )}

          {/* 6-box OTP Input */}
          <div className="mfa-otp-inputs-row">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                onPaste={handleOtpPaste}
                className="otp-digit-box"
                autoFocus={idx === 0}
              />
            ))}
          </div>

          {/* Resend & Timer */}
          <div className="mfa-resend-row">
            <span>Didn't receive the security code?</span>
            <button
              type="button"
              className="mfa-resend-btn"
              onClick={handleResend}
              disabled={resendCountdown > 0}
            >
              {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code 🔄'}
            </button>
          </div>

          <div className="portal-actions">
            <button
              type="submit"
              className="game-button btn-primary btn-banana-primary"
              disabled={otpDigits.join('').length < 6 || loading}
            >
              <span className="btn-shine" />
              <span className="btn-content">
                <span>VERIFY & ENTER JUNGLE!</span>
                <span className="btn-arrow">🛡️</span>
              </span>
            </button>

            <button
              type="button"
              className="game-button btn-secondary"
              onClick={() => {
                setAuthView('login')
              }}
            >
              <span>Back to Sign In</span>
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
