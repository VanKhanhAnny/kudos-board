import { BoardCard } from './BoardCard'
import './BoardsSection.css'

export function BoardsSection({ boards, onView, onDelete }) {
  return (
    <section className="boards-section">
      <div className="boards-section__inner">
        {boards.length === 0 ? (
          <p className="boards-section__empty">No boards in this category yet.</p>
        ) : (
          <div className="boards-section__grid">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onView={onView}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
