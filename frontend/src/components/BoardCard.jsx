import { useMemo } from 'react'
import './BoardCard.css'

const ANIMATION_PROBABILITY = 0.2

export function BoardCard({ board }) {
  const { animates, delay, duration } = useMemo(() => {
    return {
      animates: Math.random() < ANIMATION_PROBABILITY,
      delay: Math.random() * 3000,
      duration: 1500 + Math.random() * 2500,
    }
  }, [])

  return (
    <div
      className={`board-card ${animates ? 'is-animating' : ''}`}
      style={
        animates
          ? {
              animationDelay: `${delay}ms`,
              animationDuration: `${duration}ms`,
            }
          : undefined
      }
    >
      {board.imageUrl ? (
        <img src={board.imageUrl} alt={board.title} />
      ) : (
        <div className="board-card__placeholder" aria-hidden="true" />
      )}
    </div>
  )
}
