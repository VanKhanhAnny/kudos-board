import { RealBoardCard } from './RealBoardCard'
import './BoardsSection.css'

export function BoardsSection({ boards }) {
  return (
    <section className="boards-section">
      <div className="boards-section__inner">
        {boards.length === 0 ? (
          <p className="boards-section__empty">No boards in this category yet.</p>
        ) : (
          <div className="boards-section__grid">
            {boards.map((board) => (
              <RealBoardCard key={board.id} board={board} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
