import { useState } from 'react'

export default function GoogleAuthModal({
  isOpen,
  onClose,
  onSelectAccount,
  onPlaySound,
  storedUsers = [],
}) {
  const [customEmail, setCustomEmail] = useState('')
  const [customName, setCustomName] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  // Ensure Sheromi's email is prominently featured as the Google account
  const accountsToShow = [
    {
      name: 'Sheromi Inthiran',
      email: 'sheromiinthiran@gmail.com',
      avatarColor: '#EA4335',
      letter: 'S',
    },
    ...storedUsers
      .filter((u) => u.email && u.email.toLowerCase() !== 'sheromiinthiran@gmail.com')
      .map((u) => ({
        name: u.name || u.username || 'Explorer',
        email: u.email,
        avatarColor: '#4285F4',
        letter: (u.name || u.email || 'G').charAt(0).toUpperCase(),
      })),
  ]

  // Filter unique accounts by email
  const uniqueAccounts = accountsToShow.filter(
    (acc, index, self) => index === self.findIndex((a) => a.email.toLowerCase() === acc.email.toLowerCase()),
  )

  const handleAccountClick = (account) => {
    if (onPlaySound) onPlaySound('click')
    onSelectAccount({
      name: account.name,
      email: account.email,
    })
    onClose()
  }

  const handleCustomSubmit = (e) => {
    e.preventDefault()
    const trimmedEmail = customEmail.trim().toLowerCase()
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setErrorMsg('Please enter a valid Google email address (e.g. name@gmail.com)')
      return
    }
    const name = customName.trim() || trimmedEmail.split('@')[0]
    if (onPlaySound) onPlaySound('click')
    onSelectAccount({
      name,
      email: trimmedEmail,
    })
    onClose()
  }

  return (
    <div className="google-modal-overlay" role="dialog" aria-modal="true">
      <div className="google-auth-card">
        {/* Close Button */}
        <button
          type="button"
          className="google-modal-close-btn"
          onClick={() => {
            if (onPlaySound) onPlaySound('click')
            onClose()
          }}
          title="Cancel"
        >
          ✕
        </button>

        {/* Google Logo & Header */}
        <div className="google-modal-header">
          <svg className="google-modal-logo" width="40" height="40" viewBox="0 0 24 24" aria-hidden="true">
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
          <h2 className="google-modal-title">Sign in with Google</h2>
          <p className="google-modal-subtitle">
            Choose an account to continue to <strong>Banana Adventure</strong>
          </p>
        </div>

        {/* Account List */}
        <div className="google-accounts-list">
          {uniqueAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              className="google-account-item"
              onClick={() => handleAccountClick(account)}
            >
              <div
                className="google-account-avatar"
                style={{ backgroundColor: account.avatarColor || '#4285F4' }}
              >
                {account.letter}
              </div>
              <div className="google-account-info">
                <span className="google-account-name">{account.name}</span>
                <span className="google-account-email">{account.email}</span>
              </div>
              <span className="google-account-arrow">➔</span>
            </button>
          ))}

          {/* Use another account option */}
          {!showCustomInput ? (
            <button
              type="button"
              className="google-account-item google-use-another-btn"
              onClick={() => {
                if (onPlaySound) onPlaySound('click')
                setShowCustomInput(true)
              }}
            >
              <div className="google-account-avatar add-account-avatar">
                +
              </div>
              <div className="google-account-info">
                <span className="google-account-name">Use another Google account</span>
                <span className="google-account-email">Enter any Google email address</span>
              </div>
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="google-custom-account-form">
              <div className="google-input-group">
                <label htmlFor="google-custom-email">Google Email Address:</label>
                <input
                  id="google-custom-email"
                  type="email"
                  value={customEmail}
                  onChange={(e) => {
                    setCustomEmail(e.target.value)
                    setErrorMsg('')
                  }}
                  placeholder="e.g. yourname@gmail.com"
                  autoFocus
                  className="google-text-input"
                />
              </div>

              <div className="google-input-group">
                <label htmlFor="google-custom-name">Display Name (optional):</label>
                <input
                  id="google-custom-name"
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Jungle Hero"
                  className="google-text-input"
                />
              </div>

              {errorMsg && <p className="google-form-error">{errorMsg}</p>}

              <div className="google-form-actions">
                <button type="submit" className="google-submit-btn">
                  Continue with this Email
                </button>
                <button
                  type="button"
                  className="google-cancel-btn"
                  onClick={() => setShowCustomInput(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Footer */}
        <div className="google-modal-footer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#5f6368" aria-hidden="true">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
          </svg>
          <span>To continue, Google will share your name, email address, and language preference with Banana Adventure.</span>
        </div>
      </div>
    </div>
  )
}

