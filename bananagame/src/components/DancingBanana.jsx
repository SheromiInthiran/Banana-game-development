import { useState } from 'react'

export default function DancingBanana({ mood = 'dancing', onTickle }) {
  const [isTickled, setIsTickled] = useState(false)

  const handlePointerDown = () => {
    setIsTickled(true)
    if (onTickle) onTickle()
    setTimeout(() => setIsTickled(false), 1400)
  }

  // Active mood (tickle overrides temporary mood)
  const effectiveMood = isTickled ? 'celebrating' : mood

  // Speech bubble text based on mood
  let speechText = 'Hey friend! Tap me to dance! 🍌🎵'
  if (effectiveMood === 'curious') {
    speechText = "What's your jungle explorer name? 🌴✨"
  } else if (effectiveMood === 'hiding') {
    speechText = "I won't peek at your secret key! 🙈🍌"
  } else if (effectiveMood === 'celebrating') {
    speechText = 'BANANA DANCE PARTY! YAHOOO! 🎉💃'
  }

  return (
    <div
      className={`dancing-banana-container mood-${effectiveMood}`}
      onClick={handlePointerDown}
      title="Click Benny to tickle him!"
    >
      {/* Speech Bubble */}
      <div className="banana-speech-bubble" aria-live="polite">
        <span className="speech-icon">
          {effectiveMood === 'hiding'
            ? '🙈'
            : effectiveMood === 'curious'
              ? '🧐'
              : effectiveMood === 'celebrating'
                ? '⭐'
                : '🍌'}
        </span>
        <span className="speech-text">{speechText}</span>
        <div className="speech-arrow" />
      </div>

      {/* Main Mascot SVG */}
      <div className="banana-mascot-wrapper">
        <svg
          viewBox="0 0 280 340"
          className="banana-mascot-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* 3D Banana Peel Gradient */}
            <radialGradient id="bananaBodyGrad" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fff885" />
              <stop offset="35%" stopColor="#ffdc2b" />
              <stop offset="70%" stopColor="#f5b800" />
              <stop offset="100%" stopColor="#d48800" />
            </radialGradient>

            {/* Banana Specular Highlight */}
            <linearGradient id="bananaSpecular" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Stem Top Gradient */}
            <linearGradient id="bananaStemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8ee83e" />
              <stop offset="60%" stopColor="#44b71d" />
              <stop offset="100%" stopColor="#1e6b0c" />
            </linearGradient>

            {/* Jungle Sneaker Gradient */}
            <linearGradient id="jungleShoeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#55e672" />
              <stop offset="70%" stopColor="#1ea844" />
              <stop offset="100%" stopColor="#0d6926" />
            </linearGradient>

            {/* Soft Shadow Blur */}
            <filter id="bananaShadowBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
            </filter>
          </defs>

          {/* 1. Ground Contact Shadow */}
          <ellipse
            cx="140"
            cy="325"
            rx="64"
            ry="13"
            fill="rgba(18, 56, 26, 0.35)"
            filter="url(#bananaShadowBlur)"
            className="banana-ground-shadow"
          />

          {/* 2. Dancing Legs & Jungle Sneakers */}
          <g className="banana-legs-group">
            {/* Left Leg & Sneaker */}
            <g className="banana-leg banana-leg-left">
              <path
                d="M 112 250 Q 106 280 98 304"
                stroke="#d48800"
                strokeWidth="11"
                strokeLinecap="round"
                fill="none"
              />
              <g className="banana-shoe shoe-left">
                {/* Shoe body */}
                <path
                  d="M 72 304 C 72 294, 100 292, 114 302 C 120 306, 122 316, 116 320 C 106 324, 72 324, 72 304 Z"
                  fill="url(#jungleShoeGrad)"
                />
                {/* Rubber sole */}
                <path
                  d="M 70 316 C 70 316, 96 318, 118 315 C 122 318, 120 323, 116 325 C 96 326, 70 325, 70 316 Z"
                  fill="#ffffff"
                  stroke="#dddddd"
                  strokeWidth="1.5"
                />
                <ellipse cx="78" cy="309" rx="7" ry="6" fill="#ffffff" />
                <line x1="92" y1="301" x2="102" y2="304" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="94" y1="307" x2="104" y2="310" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            </g>

            {/* Right Leg & Sneaker */}
            <g className="banana-leg banana-leg-right">
              <path
                d="M 168 250 Q 174 280 182 304"
                stroke="#d48800"
                strokeWidth="11"
                strokeLinecap="round"
                fill="none"
              />
              <g className="banana-shoe shoe-right">
                {/* Shoe body */}
                <path
                  d="M 166 302 C 180 292, 208 294, 208 304 C 208 324, 174 324, 164 320 C 158 316, 160 306, 166 302 Z"
                  fill="url(#jungleShoeGrad)"
                />
                {/* Rubber sole */}
                <path
                  d="M 162 315 C 184 318, 210 316, 210 316 C 210 325, 184 326, 164 325 C 160 323, 158 318, 162 315 Z"
                  fill="#ffffff"
                  stroke="#dddddd"
                  strokeWidth="1.5"
                />
                <ellipse cx="202" cy="309" rx="7" ry="6" fill="#ffffff" />
                <line x1="178" y1="304" x2="188" y2="301" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="176" y1="310" x2="186" y2="307" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            </g>
          </g>

          {/* 3. Main Torso (Bouncing & Hip Swaying Curved Banana) */}
          <g className="banana-torso-group">
            {/* Curved Banana Body */}
            <path
              d="M 130 52 C 185 58, 222 130, 205 210 C 190 262, 138 274, 98 255 C 65 240, 68 185, 82 135 C 95 88, 115 52, 130 52 Z"
              fill="url(#bananaBodyGrad)"
              stroke="#9e6600"
              strokeWidth="4"
              className="banana-body-shape"
            />

            {/* Banana Longitudinal Ridge / Contour Line */}
            <path
              d="M 134 56 C 172 82, 186 150, 168 220 C 156 252, 126 264, 102 254"
              fill="none"
              stroke="#f5a400"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* 3D Specular Curved Highlight */}
            <path
              d="M 125 70 C 155 85, 168 125, 158 175 C 152 205, 135 220, 120 225 C 122 200, 142 165, 140 120 C 138 88, 128 76, 125 70 Z"
              fill="url(#bananaSpecular)"
              opacity="0.8"
            />
            <circle cx="120" cy="80" r="6" fill="#ffffff" opacity="0.8" />

            {/* Banana Bottom Tip (Brown/Tan) */}
            <path
              d="M 96 254 C 92 258, 86 260, 84 256 C 85 252, 90 248, 96 254 Z"
              fill="#523812"
            />

            {/* Rosy Cheeks */}
            <ellipse cx="106" cy="180" rx="14" ry="8" fill="#ff7675" opacity="0.65" filter="url(#bananaShadowBlur)" />
            <ellipse cx="178" cy="180" rx="14" ry="8" fill="#ff7675" opacity="0.65" filter="url(#bananaShadowBlur)" />

            {/* Face Features */}
            <g className="banana-face">
              {/* EYES */}
              <g className="banana-eyes">
                {/* Left Eye */}
                <g className="banana-eye eye-left">
                  <ellipse cx="122" cy="150" rx="15" ry="21" fill="#ffffff" stroke="#2c1e18" strokeWidth="3.5" />
                  <g className="banana-pupil pupil-left">
                    <circle cx="124" cy="151" r="9.5" fill="#2c1e18" />
                    <circle cx="120" cy="146" r="3.8" fill="#ffffff" />
                    <circle cx="128" cy="154" r="1.8" fill="#ffffff" />
                  </g>
                  {/* Blink eyelid */}
                  <ellipse cx="122" cy="150" rx="15" ry="21" className="eyelid-blink" fill="#f5b800" />
                </g>

                {/* Right Eye */}
                <g className="banana-eye eye-right">
                  <ellipse cx="166" cy="150" rx="15" ry="21" fill="#ffffff" stroke="#2c1e18" strokeWidth="3.5" />
                  <g className="banana-pupil pupil-right">
                    <circle cx="164" cy="151" r="9.5" fill="#2c1e18" />
                    <circle cx="160" cy="146" r="3.8" fill="#ffffff" />
                    <circle cx="168" cy="154" r="1.8" fill="#ffffff" />
                  </g>
                  {/* Blink eyelid */}
                  <ellipse cx="166" cy="150" rx="15" ry="21" className="eyelid-blink" fill="#f5b800" />
                </g>
              </g>

              {/* Eyebrows */}
              <path
                d="M 112 124 Q 124 118 134 125"
                stroke="#5c3b06"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                className="eyebrow eyebrow-left"
              />
              <path
                d="M 154 125 Q 164 118 176 124"
                stroke="#5c3b06"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
                className="eyebrow eyebrow-right"
              />

              {/* Smiling Mouth */}
              <g className="banana-mouth">
                {effectiveMood === 'celebrating' ? (
                  /* Wide cheering open mouth */
                  <g>
                    <path
                      d="M 124 180 Q 146 220 168 180 Z"
                      fill="#4a0f0a"
                      stroke="#2c1e18"
                      strokeWidth="3"
                    />
                    <path d="M 132 195 Q 146 186 160 195 Q 146 215 132 195 Z" fill="#ff5d7d" />
                    <path d="M 140 180 L 152 180 L 150 187 L 142 187 Z" fill="#ffffff" />
                  </g>
                ) : (
                  /* Cheerful happy smile */
                  <g>
                    <path
                      d="M 126 180 Q 144 204 164 180"
                      fill="#4a0f0a"
                      stroke="#2c1e18"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path d="M 138 188 Q 145 195 152 188 Z" fill="#ff5d7d" />
                    <path d="M 122 178 Q 124 184 121 187" stroke="#b37200" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <path d="M 168 178 Q 166 184 169 187" stroke="#b37200" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  </g>
                )}
              </g>
            </g>

            {/* Banana Stem Top Crown */}
            <g className="banana-stem-crown">
              <path
                d="M 130 52 C 127 34, 134 18, 142 12 C 147 16, 145 32, 140 54 Z"
                fill="url(#bananaStemGrad)"
                stroke="#18520a"
                strokeWidth="2"
              />
              {/* Cute little tropical hibiscus flower on stem */}
              <g className="stem-jungle-flower">
                <circle cx="144" cy="22" r="7" fill="#ff477e" />
                <circle cx="144" cy="22" r="3.5" fill="#ffe135" />
              </g>
            </g>
          </g>

          {/* 4. Animated Cartoon Arms with White Gloves */}
          <g className="banana-arms-group">
            {/* Left Arm & Puffy White Glove */}
            <g className="banana-arm arm-left">
              <path
                d="M 80 170 Q 45 190 42 220"
                stroke="#d48800"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
                className="arm-path-left"
              />
              <g className="banana-glove glove-left">
                <ellipse cx="44" cy="220" rx="9" ry="5" fill="#f0f0f0" stroke="#d5d5d5" strokeWidth="2" />
                <circle cx="40" cy="232" r="12" fill="#ffffff" stroke="#2c1e18" strokeWidth="2" />
                <circle cx="30" cy="226" r="6" fill="#ffffff" stroke="#2c1e18" strokeWidth="1.8" />
                <circle cx="48" cy="240" r="5" fill="#ffffff" stroke="#2c1e18" strokeWidth="1.8" />
              </g>
            </g>

            {/* Right Arm & Puffy White Glove */}
            <g className="banana-arm arm-right">
              <path
                d="M 195 170 Q 230 190 234 220"
                stroke="#d48800"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
                className="arm-path-right"
              />
              <g className="banana-glove glove-right">
                <ellipse cx="232" cy="220" rx="9" ry="5" fill="#f0f0f0" stroke="#d5d5d5" strokeWidth="2" />
                <circle cx="236" cy="232" r="12" fill="#ffffff" stroke="#2c1e18" strokeWidth="2" />
                <circle cx="246" cy="226" r="6" fill="#ffffff" stroke="#2c1e18" strokeWidth="1.8" />
                <circle cx="228" cy="240" r="5" fill="#ffffff" stroke="#2c1e18" strokeWidth="1.8" />
              </g>
            </g>

            {/* OVER-EYES HANDS (When password field is focused: "No peeking! 🙈") */}
            {effectiveMood === 'hiding' && (
              <g className="hiding-hands-overlay">
                {/* Left hand over left eye */}
                <g className="peeking-hand-left">
                  <ellipse cx="120" cy="150" rx="18" ry="14" fill="#ffffff" stroke="#2c1e18" strokeWidth="2.5" />
                  <circle cx="106" cy="144" r="7" fill="#ffffff" stroke="#2c1e18" strokeWidth="2" />
                  <line x1="114" y1="140" x2="114" y2="158" stroke="#dddddd" strokeWidth="2" />
                  <line x1="124" y1="140" x2="124" y2="158" stroke="#dddddd" strokeWidth="2" />
                </g>
                {/* Right hand over right eye */}
                <g className="peeking-hand-right">
                  <ellipse cx="168" cy="150" rx="18" ry="14" fill="#ffffff" stroke="#2c1e18" strokeWidth="2.5" />
                  <circle cx="182" cy="144" r="7" fill="#ffffff" stroke="#2c1e18" strokeWidth="2" />
                  <line x1="164" y1="140" x2="164" y2="158" stroke="#dddddd" strokeWidth="2" />
                  <line x1="174" y1="140" x2="174" y2="158" stroke="#dddddd" strokeWidth="2" />
                </g>
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Jungle Mound Platform */}
      <div className="mascot-stage-mound">
        <div className="stage-grass-patch" />
      </div>
    </div>
  )
}
