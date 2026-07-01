import { HeroTileGrid } from './HeroTileGrid'
import { heroTiles } from '../data/heroTiles'
import './AuthLayout.css'

export function AuthLayout({ children }) {
  return (
    <main className="auth-layout">
      <div className="auth-layout__bg">
        <HeroTileGrid tiles={heroTiles} />
        <div className="auth-layout__overlay" />
      </div>
      <div className="auth-layout__row">
        <div className="auth-layout__panel">{children}</div>
        <Sparkle />
      </div>
    </main>
  )
}

function Sparkle() {
  return (
    <svg
      className="auth-layout__sparkle"
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <path d="M55 8 L60 38 L90 43 L60 48 L55 78 L50 48 L20 43 L50 38 Z" fill="white" />
      <path d="M30 75 L32 84 L41 86 L32 88 L30 97 L28 88 L19 86 L28 84 Z" fill="white" />
      <path d="M75 95 L76.5 100 L81 101 L76.5 102 L75 107 L73.5 102 L69 101 L73.5 100 Z" fill="white" />
    </svg>
  )
}
