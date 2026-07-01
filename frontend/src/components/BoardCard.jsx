import './BoardCard.css'

const CATEGORY_LABEL = {
  CELEBRATION: 'Celebration',
  THANK_YOU: 'Thank you',
  INSPIRATION: 'Inspiration',
}

export function BoardCard({ board, onView, onDelete }) {
  const handleDelete = (e) => {
    e.stopPropagation()
    if (window.confirm(`Delete "${board.title}"?`)) {
      onDelete?.(board.id)
    }
  }

  const handleView = (e) => {
    e.stopPropagation()
    onView?.(board.id)
  }

  return (
    <article className="board-card">
      <div className="board-card__image-wrap">
        <img
          className="board-card__image"
          src={board.imageUrl}
          alt={board.title}
        />
        <div className="board-card__actions">
          <button
            type="button"
            className="board-card__btn board-card__btn--view"
            onClick={handleView}
          >
            view
          </button>
          <button
            type="button"
            className="board-card__btn board-card__btn--delete"
            onClick={handleDelete}
            aria-label={`Delete ${board.title}`}
          >
            delete
          </button>
        </div>
      </div>
      <div className="board-card__meta">
        <span className="board-card__category">
          {CATEGORY_LABEL[board.category] ?? board.category}
        </span>
        <h3 className="board-card__title">{board.title}</h3>
      </div>
    </article>
  )
}
