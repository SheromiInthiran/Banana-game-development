import { useState } from 'react'

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
}) {
  const [rememberMe, setRememberMe] = useState(true)
  const [agreeRules, setAgreeRules] = useState(true)

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
                : 'Craft a New Jungle Key!'}
        </h2>
        <p className="welcome-subtext">
          {authView === 'login'
            ? 'Ready for a joyful dancing banana adventure? Sign in to continue!'
            : authView === 'register'
              ? 'Pick your explorer name and join our cheerful jungle world!'
              : authView === 'forgot'
                ? "Enter your email and we'll prepare your secret jungle key!"
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

          <div className="portal-actions">
            <button type="submit" className="game-button btn-primary btn-banana-primary">
              <span className="btn-shine" />
              <span className="btn-content">
                <span>CREATE MY JUNGLE BADGE!</span>
                <span className="btn-arrow">🌟</span>
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
    </div>
  )
}
