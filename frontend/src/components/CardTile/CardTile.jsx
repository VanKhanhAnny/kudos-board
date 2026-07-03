import './CardTile.css'

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

export function CardTile({ card, onUpvote, onDelete, canDelete = false }) {
  const handleUpvote = () => onUpvote?.(card.id)

  const handleDelete = () => {
    if (window.confirm('Delete this card?')) {
      onDelete?.(card.id)
    }
  }

  return (
    <article className="card-tile">
      <div className="card-tile__image-wrap">
        <img
          className="card-tile__image"
          src={card.gifUrl}
          alt=""
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_IMAGE) {
              e.currentTarget.src = FALLBACK_IMAGE
            }
          }}
        />
        {canDelete && (
          <button
            type="button"
            className="card-tile__delete"
            onClick={handleDelete}
            aria-label="Delete card"
          >
            ×
          </button>
        )}
      </div>
      <div className="card-tile__body">
        <h3 className="card-tile__title">{card.title}</h3>
        <p className="card-tile__message">{card.message}</p>
        {card.author && (
          <p className="card-tile__author">— {card.author}</p>
        )}
        <button
          type="button"
          className="card-tile__upvote"
          onClick={handleUpvote}
        >
          <span className="card-tile__heart">♥</span>
          <span className="card-tile__upvote-count">{card.upvotes}</span>
        </button>
      </div>
    </article>
  )
}
