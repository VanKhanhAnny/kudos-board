import './RealBoardCard.css'

const CATEGORY_LABEL = {
  CELEBRATION: 'Celebration',
  THANK_YOU: 'Thank you',
  INSPIRATION: 'Inspiration',
}

export function RealBoardCard({ board }) {
  return (
    <article className="real-board-card">
      <div className="real-board-card__image-wrap">
        <img
          className="real-board-card__image"
          src={board.imageUrl}
          alt={board.title}
        />
      </div>
      <div className="real-board-card__meta">
        <span className="real-board-card__category">
          {CATEGORY_LABEL[board.category] ?? board.category}
        </span>
        <h3 className="real-board-card__title">{board.title}</h3>
      </div>
    </article>
  )
}
