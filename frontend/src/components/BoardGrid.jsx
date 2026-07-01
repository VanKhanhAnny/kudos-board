import { BoardCard } from './BoardCard'
import './BoardGrid.css'

export function BoardGrid({ boards }) {
  return (
    <div className="board-grid">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  )
}
