import { CardTile } from './CardTile'
import './CardGrid.css'

export function CardGrid({ cards, onUpvote, onDelete }) {
  if (cards.length === 0) {
    return (
      <p className="card-grid__empty">No cards yet. Be the first to add one.</p>
    )
  }

  return (
    <div className="card-grid">
      {cards.map((card) => (
        <CardTile
          key={card.id}
          card={card}
          onUpvote={onUpvote}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
