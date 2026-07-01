import './CardTile.css'

export function CardTile({ card, onUpvote, onDelete }) {
  const handleUpvote = () => onUpvote?.(card.id)

  const handleDelete = () => {
    if (window.confirm('Delete this card?')) {
      onDelete?.(card.id)
    }
  }

  return (
    <article className="card-tile">
      <div className="card-tile__image-wrap">
        <img className="card-tile__image" src={card.gifUrl} alt="" />
        <button
          type="button"
          className="card-tile__delete"
          onClick={handleDelete}
          aria-label="Delete card"
        >
          ×
        </button>
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
