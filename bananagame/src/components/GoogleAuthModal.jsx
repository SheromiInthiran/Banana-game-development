export default function GoogleAuthModal({
  isOpen,
  onClose,
  onSelectAccount,
  onPlaySound,
}) {
  if (!isOpen) return null

  // Display only the user's Google account as requested
  const userAccount = {
    name: 'Sheromi Inthiran',
    email: 'sheromiinthiran@gmail.com',
    avatarColor: '#EA4335',
    letter: 'S',
  }

  const handleAccountClick = () => {
    if (onPlaySound) onPlaySound('click')
    onSelectAccount({
      name: userAccount.name,
      email: userAccount.email,
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

        {/* Account List - Displays strictly the user's Gmail account */}
        <div className="google-accounts-list">
          <button
            type="button"
            className="google-account-item single-google-account"
            onClick={handleAccountClick}
          >
            <div
              className="google-account-avatar"
              style={{ backgroundColor: userAccount.avatarColor }}
            >
              {userAccount.letter}
            </div>
            <div className="google-account-info">
              <span className="google-account-name">{userAccount.name}</span>
              <span className="google-account-email">{userAccount.email}</span>
            </div>
            <span className="google-account-arrow">➔</span>
          </button>
        </div>

        {/* Security Footer */}
        <div className="google-modal-footer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#5f6368" aria-hidden="true">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
          </svg>
          <span>To continue, Google will securely sign you in with <strong>{userAccount.email}</strong> and verify your account.</span>
        </div>
      </div>
    </div>
  )
}
