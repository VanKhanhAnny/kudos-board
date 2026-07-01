import { useMemo } from 'react'
import './HeroTile.css'

const AMBIENT_PROBABILITY = 0.2
const INTRO_DURATION_MS = 2600

export function HeroTile({ tile }) {
  const { animates, ambientDelay, ambientDuration, introDelay } = useMemo(() => {
    return {
      animates: Math.random() < AMBIENT_PROBABILITY,
      ambientDelay: Math.random() * 3000,
      ambientDuration: 1500 + Math.random() * 2500,
      introDelay: Math.random() * 1400,
    }
  }, [])

  const style = {
    '--intro-delay': `${introDelay}ms`,
    '--intro-duration': `${INTRO_DURATION_MS}ms`,
  }
  if (animates) {
    style['--ambient-delay'] = `${INTRO_DURATION_MS + ambientDelay}ms`
    style['--ambient-duration'] = `${ambientDuration}ms`
  }

  return (
    <div
      className={`hero-tile is-intro ${animates ? 'is-animating' : ''}`}
      style={style}
    >
      {tile.imageUrl ? (
        <img src={tile.imageUrl} alt="" />
      ) : (
        <div className="hero-tile__placeholder" aria-hidden="true" />
      )}
    </div>
  )
}
