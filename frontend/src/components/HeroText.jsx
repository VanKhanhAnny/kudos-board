import './HeroText.css'

export function HeroText() {
  return (
    <div className="hero-text">
      <div className="hero-text__stack">
        <Sparkle />
        <div className="hero-text__word-wrap">
        <div className="hero-text__word hero-text__word--sharp" aria-hidden="true">
          g<span className="hero-text__rateful">rateful<span className="hero-text__underline" aria-hidden="true" /></span>
        </div>
        <div className="hero-text__word hero-text__word--blur-1" aria-hidden="true">
          g<span className="hero-text__rateful">rateful</span>
        </div>
        <div className="hero-text__word hero-text__word--blur-2" aria-hidden="true">
          g<span className="hero-text__rateful">rateful</span>
        </div>
        <div className="hero-text__word hero-text__word--blur-3" aria-hidden="true">
          g<span className="hero-text__rateful">rateful</span>
        </div>
        <span className="hero-text__sr-only">grateful</span>
        </div>
      </div>
    </div>
  )
}

function Sparkle() {
  return (
    <svg
      className="hero-text__sparkle"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M55 8 L60 38 L90 43 L60 48 L55 78 L50 48 L20 43 L50 38 Z"
        fill="white"
      />
      <path
        d="M30 75 L32 84 L41 86 L32 88 L30 97 L28 88 L19 86 L28 84 Z"
        fill="white"
      />
      <path
        d="M75 95 L76.5 100 L81 101 L76.5 102 L75 107 L73.5 102 L69 101 L73.5 100 Z"
        fill="white"
      />
    </svg>
  )
}
