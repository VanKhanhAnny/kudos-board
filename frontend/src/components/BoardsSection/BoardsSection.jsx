import { useAuth } from '../../context/AuthContext'
import { canDeleteRow } from '../../lib/permissions'
import { BoardCard } from '../BoardCard'
import './BoardsSection.css'

export function BoardsSection({ boards, isLoading, onView, onDelete }) {
  const { user } = useAuth()
  return (
    <section className="boards-section">
      <div className="boards-section__inner">
        {isLoading ? (
          <p className="boards-section__empty">Loading boards…</p>
        ) : boards.length === 0 ? (
          <p className="boards-section__empty">No boards in this category yet.</p>
        ) : (
          <div className="boards-section__grid">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onView={onView}
                onDelete={onDelete}
                canDelete={canDeleteRow(user, board)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
