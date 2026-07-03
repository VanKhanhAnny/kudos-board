import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AddButton } from '../components/AddButton'
import { CardGrid } from '../components/CardGrid'
import { CreateCardModal } from '../components/CreateCardModal'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { deleteCard, getBoard, upvoteCard } from '../lib/api'
import './BoardPage.css'

const CATEGORY_LABEL = {
  CELEBRATION: 'Celebration',
  THANK_YOU: 'Thank you',
  INSPIRATION: 'Inspiration',
}

export function BoardPage() {
  const { boardId } = useParams()
  const [board, setBoard] = useState(null)
  const [cards, setCards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [boardId])

  // GET /api/boards/:id returns board + cards in one payload; unpack both.
  // A 404 becomes an Error whose message we can't cleanly distinguish from
  // other errors, so we surface a dedicated notFound state via the "Board
  // not found" prefix check.
  useEffect(() => {
    let ignore = false
    setIsLoading(true)
    setError(null)
    setNotFound(false)
    getBoard(boardId)
      .then((data) => {
        if (ignore) return
        const { cards: cardList = [], ...boardData } = data
        setBoard(boardData)
        setCards(cardList)
      })
      .catch((err) => {
        if (ignore) return
        if (err.message === 'Board not found') setNotFound(true)
        else setError(err.message)
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [boardId])

  // Splice server-truth back into local state instead of doing +1 locally,
  // so the count stays honest across tabs/users.
  const handleUpvote = async (id) => {
    try {
      const updated = await upvoteCard(id)
      setCards((prev) => prev.map((c) => (c.id === id ? updated : c)))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteCard(id)
      setCards((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCreateCard = (card) => {
    setCards((prev) => [card, ...prev])
  }

  if (isLoading) {
    return (
      <main className="board-page">
        <Header />
        <div className="board-page__missing">
          <p>Loading board…</p>
        </div>
      </main>
    )
  }

  if (notFound || !board) {
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
        {board.author && (
          <p className="board-page__author">— {board.author}</p>
        )}
        <div className="board-page__cta">
          <AddButton
            label="add a new card"
            tone="light"
            onClick={() => setIsCreateCardOpen(true)}
          />
        </div>
      </section>
      {error && <p className="board-page__error">{error}</p>}
      <section className="board-page__cards">
        <CardGrid
          cards={cards}
          onUpvote={handleUpvote}
          onDelete={handleDelete}
        />
      </section>
      <Footer />
      <CreateCardModal
        isOpen={isCreateCardOpen}
        boardId={boardId}
        onClose={() => setIsCreateCardOpen(false)}
        onCreate={handleCreateCard}
      />
    </main>
  )
}
