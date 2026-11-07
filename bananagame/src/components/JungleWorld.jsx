export default function JungleWorld({ mousePos = { x: 0, y: 0 } }) {
  // Soft parallax translation values
  const bgShiftX = mousePos.x * 12
  const bgShiftY = mousePos.y * 6
  const midShiftX = mousePos.x * 20
  const midShiftY = mousePos.y * 10

  // Rain of bananas — 18 falling banana drops
  const fallingBananas = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 5.8 + 2) % 98}%`,
    delay: `${(i * 0.41) % 6}s`,
    duration: `${3.5 + (i % 5) * 0.6}s`,
    size: `${18 + (i % 4) * 6}px`,
    rotation: `${(i % 2 === 0 ? '' : '-')}${10 + (i % 30)}deg`,
  }))

  // Glowing orbs (banana-colored)
  const glowOrbs = [
    { cls: 'orb-g1', top: '15%', left: '8%' },
    { cls: 'orb-g2', top: '55%', left: '90%' },
    { cls: 'orb-g3', top: '75%', left: '5%' },
    { cls: 'orb-g4', top: '30%', left: '75%' },
    { cls: 'orb-g5', top: '10%', left: '50%' },
  ]

  return (
    <div className="jungle-world" aria-hidden="true">

      {/* ── LAYER 0: DEEP BANANA GRADIENT SKY ── */}
      <div className="sky-gradient-layer jungle-sky jungle-sky-enhanced" />

      {/* ── AURORA / LIGHT SWEEP across the sky ── */}
      <div className="aurora-sweep aurora-1" />
      <div className="aurora-sweep aurora-2" />

      {/* ── GLOWING BANANA-YELLOW ORBS ── */}
      {glowOrbs.map(({ cls, top, left }) => (
        <div
          key={cls}
          className={`banana-glow-orb ${cls}`}
          style={{ top, left }}
        />
      ))}

      {/* ── RADIANT TROPICAL SUN ── */}
      <div
        className="jungle-sun-wrapper"
        style={{ transform: `translate3d(${bgShiftX * 0.3}px, ${bgShiftY * 0.3}px, 0)` }}
      >
        <div className="sun-rays" />
        <div className="sun-orb jungle-sun-orb">
          <div className="sun-face">
            <span className="sun-shades">🕶️</span>
            <span className="sun-smile" />
          </div>
        </div>
        <div className="sun-lens-flare" />
      </div>

      {/* ── TROPICAL RAINBOW ── */}
      <div className="jungle-rainbow" />

      {/* ── DRIFTING TROPICAL CLOUDS ── */}
      <div className="clouds-layer">
        <div className="jungle-cloud cloud-deep cloud-c1" />
        <div className="jungle-cloud cloud-deep cloud-c2" />
        <div className="jungle-cloud cloud-mid cloud-c3" />
        <div className="jungle-cloud cloud-mid cloud-c4" />
        <div className="jungle-cloud cloud-fore cloud-c5" />
      </div>

      {/* ── 🍌 BANANA RAIN — falling banana shower ── */}
      <div className="banana-rain-layer">
        {fallingBananas.map(({ id, left, delay, duration, size, rotation }) => (
          <span
            key={id}
            className="rain-banana"
            style={{
              left,
              animationDelay: delay,
              animationDuration: duration,
              fontSize: size,
              '--rot': rotation,
            }}
          >
            🍌
          </span>
        ))}
      </div>

      {/* ── FLOATING PARTICLES: bananas, stars, leaves ── */}
      <div className="particles-layer">
        <span className="floating-banana fb1">🍌</span>
        <span className="floating-banana fb2">🍌</span>
        <span className="floating-banana fb3">🍌</span>
        <span className="floating-banana fb4">🍌</span>

        <span className="sparkle-star s1">✨</span>
        <span className="sparkle-star s2">⭐</span>
        <span className="sparkle-star s3">✨</span>
        <span className="sparkle-star s4">⭐</span>
        <span className="sparkle-star s5">✨</span>
        <span className="sparkle-star s6">⭐</span>
        <span className="magic-bubble b1" />
        <span className="magic-bubble b2" />
        <span className="magic-bubble b3" />
        <span className="magic-bubble b4" />

        <span className="drifting-leaf dl1">🌴</span>
        <span className="drifting-leaf dl2">🌿</span>
        <span className="drifting-leaf dl3">🍃</span>
        <span className="drifting-leaf dl4">🌱</span>
        <span className="drifting-leaf dl5">🌿</span>
      </div>

      {/* ── BIG SPINNING BANANA WHEEL (decorative) ── */}
      <div className="banana-wheel-wrapper" style={{ transform: `translate3d(${midShiftX * 0.4}px, ${midShiftY * 0.3}px, 0)` }}>
        <div className="banana-wheel">
          {['0deg','45deg','90deg','135deg','180deg','225deg','270deg','315deg'].map((rot, i) => (
            <span key={i} className="wheel-banana" style={{ '--wrot': rot }}>🍌</span>
          ))}
        </div>
      </div>

      {/* ── FLYING TROPICAL BUTTERFLIES ── */}
      <div className="butterflies-container">
        <div className="flying-butterfly bf1">
          <div className="bf-wing wing-left bf-blue-morpho" />
          <div className="bf-body" />
          <div className="bf-wing wing-right bf-blue-morpho" />
        </div>
        <div className="flying-butterfly bf2">
          <div className="bf-wing wing-left bf-tropical-gold" />
          <div className="bf-body" />
          <div className="bf-wing wing-right bf-tropical-gold" />
        </div>
        <div className="flying-butterfly bf3">
          <div className="bf-wing wing-left bf-emerald" />
          <div className="bf-body" />
          <div className="bf-wing wing-right bf-emerald" />
        </div>
      </div>

      {/* ── DISTANT HILLS LAYER 1 ── */}
      <div
        className="hills-layer hills-back jungle-hills-back"
        style={{ transform: `translate3d(${bgShiftX * 0.5}px, ${bgShiftY * 0.5}px, 0)` }}
      >
        <svg viewBox="0 0 1440 380" preserveAspectRatio="none" className="hills-svg">
          <path d="M 0 160 Q 240 80 500 140 T 1000 110 T 1440 170 L 1440 380 L 0 380 Z" fill="#52b788" />
        </svg>
        <div className="distant-palm dp1">🌴</div>
        <div className="distant-palm dp2">🌴</div>
        <div className="distant-palm dp3">🌴</div>
      </div>

      {/* ── MIDGROUND HILLS LAYER 2 ── */}
      <div
        className="hills-layer hills-mid jungle-hills-mid"
        style={{ transform: `translate3d(${midShiftX * 0.7}px, ${midShiftY * 0.7}px, 0)` }}
      >
        <svg viewBox="0 0 1440 420" preserveAspectRatio="none" className="hills-svg">
          <path d="M 0 200 Q 340 100 720 170 T 1440 140 L 1440 420 L 0 420 Z" fill="#2d6a4f" />
        </svg>

        {/* Animated Banana Vines hanging from top */}
        <div className="banana-vines-row">
          {[0,1,2,3,4,5,6].map((v) => (
            <div key={v} className={`banana-vine vine-${v}`}>
              <div className="vine-rope" />
              <span className="vine-banana">🍌</span>
            </div>
          ))}
        </div>

        <div className="jungle-fence">
          <div className="fence-picket p1" />
          <div className="fence-picket p2" />
          <div className="fence-picket p3" />
          <div className="fence-picket p4" />
          <div className="fence-picket p5" />
          <div className="fence-picket p6" />
          <div className="party-bunting banana-bunting">
            <span className="bunting-flag f-yellow">🍌</span>
            <span className="bunting-flag f-green">★</span>
            <span className="bunting-flag f-orange">🌴</span>
            <span className="bunting-flag f-yellow">🍌</span>
            <span className="bunting-flag f-blue">♪</span>
            <span className="bunting-flag f-green">★</span>
          </div>
        </div>
      </div>

      {/* ── SECONDARY BANANA CHARACTERS ── */}
      <div className="secondary-bananas-layer">
        <div className="extra-banana bongo-trampoline">
          <div className="trampoline-leaf">
            <div className="leaf-trampoline-cap" />
            <div className="leaf-stem" />
          </div>
          <div className="jumping-bongo">
            <div className="bongo-body">
              <span className="bongo-stem">🌱</span>
              <span className="bongo-shades">🕶️</span>
              <span className="bongo-smile">‿</span>
            </div>
          </div>
        </div>

        <div className="extra-banana bella-waving">
          <div className="bella-body">
            <span className="bella-flower">🌺</span>
            <div className="bella-eyes">
              <span className="beye">◕</span>
              <span className="beye">◕</span>
            </div>
            <span className="bella-smile">ω</span>
            <span className="waving-hand-left">👋</span>
            <span className="waving-hand-right">👋</span>
          </div>
        </div>

        <div className="extra-banana balloon-banani">
          <div className="banani-balloon">
            <div className="balloon-sphere jungle-balloon" />
            <div className="balloon-string" />
          </div>
          <div className="banani-body">
            <span className="banani-stem">🌱</span>
            <div className="banani-face">^ ‿ ^</div>
            <div className="banani-shoes">
              <span className="bshoe">👟</span>
              <span className="bshoe">👟</span>
            </div>
          </div>
        </div>

        <div className="extra-banana dj-peel">
          <div className="peel-headphones">
            <div className="hp-band" />
            <div className="hp-ear left-ear" />
            <div className="hp-ear right-ear" />
          </div>
          <div className="peel-body">
            <span className="peel-stem">🌱</span>
            <div className="peel-eyes">◠ ◠</div>
            <span className="peel-mouth">ヮ</span>
            <div className="peel-shoes">
              <span className="pshoe pleft">👟</span>
              <span className="pshoe pright">👟</span>
            </div>
          </div>
          <span className="peel-music-note n1">🎵</span>
          <span className="peel-music-note n2">🎶</span>
        </div>
      </div>

      {/* ── FOREGROUND HILL + FLORA ── */}
      <div className="hills-layer hills-fore jungle-hills-fore">
        <svg viewBox="0 0 1440 280" preserveAspectRatio="none" className="hills-svg">
          <path d="M 0 120 Q 380 30 820 110 T 1440 80 L 1440 280 L 0 280 Z" fill="#1b4332" />
        </svg>

        {/* Giant banana bunch signs on the foreground hill */}
        <div className="foreground-banana-sign sign-left">
          <div className="banana-sign-pole" />
          <div className="banana-sign-board">🍌🍌🍌<br/><span className="sign-text">BANANA GAME</span></div>
        </div>
        <div className="foreground-banana-sign sign-right">
          <div className="banana-sign-pole" />
          <div className="banana-sign-board">🏆⭐🍌<br/><span className="sign-text">PLAY NOW!</span></div>
        </div>

        <div className="jungle-flora">
          <div className="flower-item f-hibiscus fh1"><div className="stem" /><div className="petals">🌺</div></div>
          <div className="flower-item f-palm fp1"><div className="stem" /><div className="petals">🌴</div></div>
          <div className="flower-item f-orchid fo1"><div className="stem" /><div className="petals">🌸</div></div>
          <div className="flower-item f-banana-bunch fbb1"><div className="stem" /><div className="petals">🍌</div></div>
          <div className="flower-item f-hibiscus fh2"><div className="stem" /><div className="petals">🌺</div></div>
          <div className="jungle-shroom jsh1">🍄</div>
          <div className="jungle-shroom jsh2">🍄</div>
        </div>

        {/* Ground grass blades */}
        <div className="grass-border jungle-grass-border">
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className="grass-blade jungle-blade"
              style={{ animationDelay: `${(i % 7) * 0.15}s`, height: `${30 + (i % 5) * 9}px` }}
            />
          ))}
        </div>
      </div>

      {/* ── BOTTOM SPOTLIGHT BEAMS ── */}
      <div className="spotlight-layer">
        <div className="spotlight-beam beam-1" />
        <div className="spotlight-beam beam-2" />
        <div className="spotlight-beam beam-3" />
      </div>

    </div>
  )
}
