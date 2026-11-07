import { useState } from 'react'
import { SHOP_CATEGORIES, SHOP_ITEMS } from '../utils/shopItems'
import { purchaseShopItem, equipShopItem } from '../utils/apiService'
import { playClick, playPurchase, playWrong } from '../utils/audio'

export default function ShopView({
  playerProfile,
  onUpdatePlayerProfile,
  soundEnabled = true,
}) {
  const [activeCategory, setActiveCategory] = useState('characters')
  const [processingId, setProcessingId] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState(null)

  const points = Number(playerProfile?.totalPoints || 0)
  const inventory = Array.isArray(playerProfile?.inventory)
    ? playerProfile.inventory
    : ['char_benny', 'hat_none', 'glass_none', 'theme_jungle']
  const equipped = playerProfile?.equipped || {
    characters: 'char_benny',
    hats: 'hat_none',
    glasses: 'glass_none',
    themes: 'theme_jungle',
  }

  const categoryItems = SHOP_ITEMS.filter((item) => item.category === activeCategory)

  // Current equipped preview pieces
  const currentCharacter = SHOP_ITEMS.find((i) => i.id === equipped.characters) || SHOP_ITEMS[0]
  const currentHat = SHOP_ITEMS.find((i) => i.id === equipped.hats)
  const currentGlasses = SHOP_ITEMS.find((i) => i.id === equipped.glasses)

  const handlePurchase = async (item) => {
    if (points < item.cost) {
      playWrong(soundEnabled)
      setFeedbackMsg({
        type: 'error',
        text: `You need ${item.cost - points} more Banana Points to unlock ${item.name}! Solve more puzzles to earn points!`,
      })
      return
    }

    setProcessingId(item.id)
    playClick(soundEnabled)

    const res = await purchaseShopItem({
      playerId: playerProfile.id,
      itemId: item.id,
      cost: item.cost,
    })

    setProcessingId(null)
    if (res.success) {
      playPurchase(soundEnabled)
      setFeedbackMsg({
        type: 'success',
        text: `Hooray! You unlocked "${item.name}"! Click Equip to wear it!`,
      })
      onUpdatePlayerProfile({
        ...playerProfile,
        totalPoints: res.remainingPoints,
        inventory: res.inventory,
      })
    } else {
      playWrong(soundEnabled)
      setFeedbackMsg({ type: 'error', text: res.error || 'Could not complete purchase.' })
    }
  }

  const handleEquip = async (item) => {
    setProcessingId(item.id)
    playClick(soundEnabled)

    let avatarEmoji = playerProfile.avatar
    if (item.category === 'characters') {
      avatarEmoji = item.icon
    }

    const res = await equipShopItem({
      playerId: playerProfile.id,
      category: item.category,
      itemId: item.id,
      avatarEmoji,
    })

    setProcessingId(null)
    if (res.success) {
      playPurchase(soundEnabled)
      setFeedbackMsg({
        type: 'success',
        text: `Awesome! You are now wearing "${item.name}"!`,
      })
      onUpdatePlayerProfile({
        ...playerProfile,
        equipped: res.equipped,
        avatar: res.avatar,
      })
    }
  }

  return (
    <div className="shop-view-container">
      {/* Shop Header Banner */}
      <div className="shop-header-banner">
        <div className="shop-header-info">
          <div className="shop-title-row">
            <span className="shop-header-icon">🛍️</span>
            <div>
              <h2>JUNGLE REWARDS & AVATAR STUDIO</h2>
              <p>Spend your hard-earned Banana Points to customize your mascot & style!</p>
            </div>
          </div>
        </div>

        {/* Player Point Balance Pill */}
        <div className="shop-balance-pill">
          <span className="balance-label">Your Banana Bank</span>
          <div className="balance-amount">
            <span className="balance-coin">🍌</span>
            <span className="balance-number">{points.toLocaleString()}</span>
            <span className="balance-unit">pts</span>
          </div>
        </div>
      </div>

      {/* Live Avatar Preview Studio */}
      <div className="avatar-studio-stage">
        <div className="studio-card">
          <div className="studio-card-header">
            <span>✨ Live Mascot Preview</span>
            <span className="preview-tag">{currentCharacter?.name}</span>
          </div>

          <div className="studio-character-viewport">
            {/* The Character Visual Assembly */}
            <div className="mascot-composite-box">
              {/* Hat layer */}
              {currentHat && currentHat.id !== 'hat_none' && (
                <div className="composite-layer hat-layer" title={currentHat.name}>
                  {currentHat.icon}
                </div>
              )}
              {/* Base Mascot */}
              <div className="composite-layer body-layer">
                {currentCharacter?.icon || '🍌'}
              </div>
              {/* Glasses layer */}
              {currentGlasses && currentGlasses.id !== 'glass_none' && (
                <div className="composite-layer glasses-layer" title={currentGlasses.name}>
                  {currentGlasses.icon}
                </div>
              )}
            </div>
          </div>

          <div className="studio-equipped-summary">
            <div className="equipped-pill">
              <span className="pill-dot">🍌</span> {currentCharacter?.name}
            </div>
            {currentHat && currentHat.id !== 'hat_none' && (
              <div className="equipped-pill">
                <span className="pill-dot">🎩</span> {currentHat.name}
              </div>
            )}
            {currentGlasses && currentGlasses.id !== 'glass_none' && (
              <div className="equipped-pill">
                <span className="pill-dot">🕶️</span> {currentGlasses.name}
              </div>
            )}
          </div>
        </div>

        <div className="studio-tips-card">
          <h3>🌴 How to Earn More Points</h3>
          <ul className="studio-tips-list">
            <li>✅ Correct answers earn <strong>+100 Points</strong>!</li>
            <li>⚡ Answer on first attempt for <strong>+25 Speed Bonus</strong>!</li>
            <li>🔥 3-streak bonus gives <strong>+50 Points</strong>; 5-streak gives <strong>+100 Points</strong>!</li>
            <li>☀️ Complete the Daily Jungle Quest for <strong>+150 Points</strong>!</li>
            <li>🎮 Finish full 5-question sessions for a <strong>+100 Completion Bonus</strong>!</li>
          </ul>
        </div>
      </div>

      {/* Feedback Message Bar */}
      {feedbackMsg && (
        <div className={`shop-feedback-bar ${feedbackMsg.type}`}>
          <span>{feedbackMsg.type === 'error' ? '⚠️' : '🎉'}</span>
          <span>{feedbackMsg.text}</span>
          <button type="button" className="close-feedback-btn" onClick={() => setFeedbackMsg(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Category Tabs */}
      <div className="shop-categories-nav">
        {SHOP_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`shop-category-tab ${activeCategory === cat.id ? 'cat-active' : ''}`}
            onClick={() => {
              playClick(soundEnabled)
              setActiveCategory(cat.id)
            }}
          >
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-name">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Items Showcase Grid */}
      <div className="shop-items-grid">
        {categoryItems.map((item) => {
          const isOwned = inventory.includes(item.id)
          const isEquipped = equipped[activeCategory] === item.id
          const canAfford = points >= item.cost

          return (
            <div
              key={item.id}
              className={`shop-item-card ${isEquipped ? 'item-equipped' : ''} ${isOwned ? 'item-owned' : ''}`}
            >
              {item.badge && <span className="item-badge">{item.badge}</span>}

              <div className="item-icon-wrapper">
                <span className="item-display-emoji">{item.icon}</span>
              </div>

              <div className="item-text-info">
                <h4 className="item-name">{item.name}</h4>
                <p className="item-desc">{item.description}</p>
              </div>

              <div className="item-bottom-action">
                {/* Cost Tag */}
                <div className="item-cost-tag">
                  {item.cost === 0 ? (
                    <span className="free-tag">FREE</span>
                  ) : (
                    <span className="points-tag">🍌 {item.cost}</span>
                  )}
                </div>

                {/* Status / Button */}
                {isEquipped ? (
                  <button type="button" className="shop-btn btn-equipped" disabled>
                    ✓ Equipped
                  </button>
                ) : isOwned ? (
                  <button
                    type="button"
                    className="shop-btn btn-equip"
                    onClick={() => handleEquip(item)}
                    disabled={processingId === item.id}
                  >
                    Equip
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`shop-btn btn-unlock ${!canAfford ? 'btn-disabled' : ''}`}
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford || processingId === item.id}
                  >
                    {canAfford ? 'Unlock' : 'Locked'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
