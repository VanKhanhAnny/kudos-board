import './BoardCard.css'

const CATEGORY_LABEL = {
  CELEBRATION: 'Celebration',
  THANK_YOU: 'Thank you',
  INSPIRATION: 'Inspiration',
}

// Neutral inline SVG shown when a board's imageUrl 404s or is otherwise unloadable.
// Keeps the card visually intact instead of showing a broken-image icon.
const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
       <rect width="400" height="300" fill="#f4f2ee"/>
       <text x="50%" y="50%" font-family="system-ui, sans-serif" font-size="14"
             fill="#8a857c" text-anchor="middle" dominant-baseline="middle">
         image unavailable
       </text>
     </svg>`
  )

export function BoardCard({ board, onView, onDelete, canDelete = false }) {
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
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_IMAGE) {
              e.currentTarget.src = FALLBACK_IMAGE
            }
          }}
        />
        <div className="board-card__actions">
          <button
            type="button"
            className="board-card__btn board-card__btn--view"
            onClick={handleView}
          >
            view
          </button>
          {canDelete && (
            <button
              type="button"
              className="board-card__btn board-card__btn--delete"
              onClick={handleDelete}
              aria-label={`Delete ${board.title}`}
            >
              delete
            </button>
          )}
        </div>
      </div>
      <div className="board-card__meta">
        <span className="board-card__category">
          {CATEGORY_LABEL[board.category] ?? board.category}
        </span>
        <h3 className="board-card__title">{board.title}</h3>
        {board.author && (
          <p className="board-card__author">— {board.author}</p>
        )}
      </div>
    </article>
  )
}
