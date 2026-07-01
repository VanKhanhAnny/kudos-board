import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AddButton } from '../components/AddButton'
import { CardGrid } from '../components/CardGrid'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { realBoards } from '../data/realBoards'
import { mockCardsByBoard } from '../data/mockCards'
import './BoardPage.css'

const CATEGORY_LABEL = {
  CELEBRATION: 'Celebration',
  THANK_YOU: 'Thank you',
  INSPIRATION: 'Inspiration',
}

export function BoardPage() {
  const { boardId } = useParams()
  const board = realBoards.find((b) => b.id === boardId)
  const [cards, setCards] = useState(mockCardsByBoard[boardId] ?? [])

  const handleUpvote = (id) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, upvotes: c.upvotes + 1 } : c)),
    )
  }

  const handleDelete = (id) => {
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  if (!board) {
    return (
      <main className="board-page">
        <Header />
        <div className="board-page__missing">
          <p>Board not found.</p>
          <Link to="/" className="board-page__back">← back to home</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="board-page">
      <Header />
      <section className="board-page__hero">
        <Link to="/" className="board-page__back">← back</Link>
        <h1 className="board-page__title">{board.title}</h1>
        <p className="board-page__category">
          {CATEGORY_LABEL[board.category] ?? board.category}
        </p>
        <div className="board-page__cta">
          <AddButton
            label="add a new card"
            tone="light"
            onClick={() => console.log('open create-card modal')}
          />
        </div>
      </section>
      <section className="board-page__cards">
        <CardGrid
          cards={cards}
          onUpvote={handleUpvote}
          onDelete={handleDelete}
        />
      </section>
      <Footer />
    </main>
  )
}
