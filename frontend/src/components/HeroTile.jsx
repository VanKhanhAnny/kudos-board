import { useMemo } from 'react'
import './HeroTile.css'

const ANIMATION_PROBABILITY = 0.2

export function HeroTile({ tile }) {
  const { animates, delay, duration } = useMemo(() => {
    return {
      animates: Math.random() < ANIMATION_PROBABILITY,
      delay: Math.random() * 3000,
      duration: 1500 + Math.random() * 2500,
    }
  }, [])

  return (
    <div
      className={`hero-tile ${animates ? 'is-animating' : ''}`}
      style={
        animates
          ? {
              animationDelay: `${delay}ms`,
              animationDuration: `${duration}ms`,
            }
          : undefined
      }
    >
      {tile.imageUrl ? (
        <img src={tile.imageUrl} alt="" />
      ) : (
        <div className="hero-tile__placeholder" aria-hidden="true" />
      )}
    </div>
  )
}
