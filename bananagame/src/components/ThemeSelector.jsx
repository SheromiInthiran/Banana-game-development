import { useEffect, useRef, useState } from 'react'

export const COLOR_THEMES = [
  {
    id: 'theme_jungle',
    name: 'Emerald Jungle',
    icon: '🌴',
    badge: 'Classic',
    primaryColor: '#16a34a',
    accentColor: '#fde047',
    previewBg: 'linear-gradient(135deg, #86efac, #fde047)',
    description: 'Lush rainforest greenery with cheerful banana yellow.',
  },
  {
    id: 'theme_sunset',
    name: 'Sunset Canopy',
    icon: '🌅',
    badge: 'Warm',
    primaryColor: '#ea580c',
    accentColor: '#fb923c',
    previewBg: 'linear-gradient(135deg, #fdba74, #f43f5e)',
    description: 'Warm golden orange sunset over tropical palm trees.',
  },
  {
    id: 'theme_gold',
    name: 'Golden Temple',
    icon: '🏛️',
    badge: 'Royal',
    primaryColor: '#ca8a04',
    accentColor: '#facc15',
    previewBg: 'linear-gradient(135deg, #fde047, #f59e0b)',
    description: 'Ancient royal gold and gleaming sandstone treasures.',
  },
  {
    id: 'theme_ocean',
    name: 'Ocean Lagoon',
    icon: '🌊',
    badge: 'Cool Aqua',
    primaryColor: '#0284c7',
    accentColor: '#38bdf8',
    previewBg: 'linear-gradient(135deg, #67e8f9, #38bdf8)',
    description: 'Crystal turquoise waters and breezy reef tides.',
  },
]

export default function ThemeSelector({
  currentTheme = 'theme_jungle',
  onSelectTheme,
  onPlaySound,
  variant = 'dropdown', // 'dropdown' | 'cards'
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const activeThemeObj = COLOR_THEMES.find((t) => t.id === currentTheme) || COLOR_THEMES[0]

  // Click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return undefined
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleChoose = (themeId) => {
    if (onPlaySound) onPlaySound('click')
    if (onSelectTheme) onSelectTheme(themeId)
    setIsOpen(false)
  }

  // Variant A: Card Grid for Settings & Profile
  if (variant === 'cards') {
    return (
      <div className="theme-cards-grid">
        {COLOR_THEMES.map((theme) => {
          const isSelected = theme.id === currentTheme
          return (
            <button
              key={theme.id}
              type="button"
              className={`theme-card-option ${isSelected ? 'theme-selected' : ''}`}
              onClick={() => handleChoose(theme.id)}
            >
              <div
                className="theme-card-preview"
                style={{ background: theme.previewBg }}
              >
                <span className="theme-card-icon">{theme.icon}</span>
                {isSelected && <span className="theme-active-tag">Active ✓</span>}
              </div>
              <div className="theme-card-info">
                <strong>{theme.name}</strong>
                <small>{theme.badge}</small>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  // Variant B: Compact Dropdown for Navbar
  return (
    <div className="theme-selector-dropdown-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="theme-selector-trigger-btn"
        onClick={() => {
          if (onPlaySound) onPlaySound('click')
          setIsOpen((prev) => !prev)
        }}
        title="Change Visual Color Theme"
        aria-expanded={isOpen}
      >
        <span className="theme-color-dot" style={{ background: activeThemeObj.previewBg }} />
        <span className="theme-trigger-label">
          {activeThemeObj.icon} {activeThemeObj.name.split(' ')[0]}
        </span>
        <span className={`theme-trigger-arrow ${isOpen ? 'arrow-up' : ''}`}>▾</span>
      </button>

      {isOpen && (
        <div className="theme-dropdown-menu">
          <div className="theme-menu-header">
            <span>🎨 Select Color Theme</span>
          </div>

          <div className="theme-options-list">
            {COLOR_THEMES.map((theme) => {
              const isSelected = theme.id === currentTheme
              return (
                <button
                  key={theme.id}
                  type="button"
                  className={`theme-option-row ${isSelected ? 'option-selected' : ''}`}
                  onClick={() => handleChoose(theme.id)}
                >
                  <span
                    className="theme-swatch"
                    style={{ background: theme.previewBg }}
                  />
                  <div className="theme-row-content">
                    <span className="theme-row-title">
                      {theme.icon} {theme.name}
                    </span>
                    <span className="theme-row-desc">{theme.badge}</span>
                  </div>
                  {isSelected && <span className="theme-check-ico">✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

