import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AddButton } from '../components/AddButton'
import { BoardsSection } from '../components/BoardsSection'
import { CategoryFilter } from '../components/CategoryFilter'
import { CreateBoardModal } from '../components/CreateBoardModal'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { HeroText } from '../components/HeroText'
import { HeroTileGrid } from '../components/HeroTileGrid'
import { ScrollQuote } from '../components/ScrollQuote'
import { SearchBar } from '../components/SearchBar'
import { useAuth } from '../context/AuthContext'
import { heroTiles } from '../data/heroTiles'
import { deleteBoard, getBoards } from '../lib/api'
import './HomePage.css'

const CATEGORY_KEY = 'kudos:home:category'
const SCROLL_KEY = 'kudos:home:scroll'

// Translate the UI's single "selectedCategory" state into the query params
// the backend understands (see planning.md §2 GET /api/boards):
//   "all"        -> {}
//   "recent"     -> { filter: "recent" }
//   "mine"       -> { mine: true }        (requires auth on the backend)
//   "CELEBRATION"/etc -> { category: ... }
function toQuery(selectedCategory, searchQuery) {
  const q = {}
  if (selectedCategory === 'recent') q.filter = 'recent'
  else if (selectedCategory === 'mine') q.mine = true
  else if (selectedCategory !== 'all') q.category = selectedCategory
  if (searchQuery) q.search = searchQuery
  return q
}

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState(
    () => sessionStorage.getItem(CATEGORY_KEY) ?? 'all',
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [boards, setBoards] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false)
  const scrollRestoredRef = useRef(false)

  useEffect(() => {
    sessionStorage.setItem(CATEGORY_KEY, selectedCategory)
  }, [selectedCategory])

  // When the user logs out, "mine" no longer makes sense (backend returns
  // 401). Snap back to "all" instead of hammering a forbidden endpoint.
  useEffect(() => {
    if (!user && selectedCategory === 'mine') {
      setSelectedCategory('all')
    }
  }, [user, selectedCategory])

  useEffect(() => {
    if (scrollRestoredRef.current) return
    scrollRestoredRef.current = true

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    const savedScroll = sessionStorage.getItem(SCROLL_KEY)
    sessionStorage.removeItem(SCROLL_KEY)
    if (savedScroll) {
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(savedScroll, 10))
      })
    } else {
      window.scrollTo(0, 0)
    }
  }, [])

  // Re-fetch whenever category or search changes. `ignore` guards against a
  // stale response overwriting fresher state if the user clicks two filters
  // in quick succession.
  useEffect(() => {
    let ignore = false
    setIsLoading(true)
    setError(null)
    getBoards(toQuery(selectedCategory, searchQuery))
      .then((data) => {
        if (!ignore) setBoards(data)
      })
      .catch((err) => {
        if (!ignore) setError(err.message)
      })
      .finally(() => {
        if (!ignore) setIsLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [selectedCategory, searchQuery])

  const handleDeleteBoard = async (id) => {
    try {
      await deleteBoard(id)
      setBoards((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const handleViewBoard = (id) => {
    sessionStorage.setItem(SCROLL_KEY, String(window.scrollY))
    navigate(`/boards/${id}`)
  }

  const handleCreateBoard = (board) => {
    setBoards((prev) => [board, ...prev])
  }

  return (
    <main className="home-page">
      <Header />
      <section className="home-page__hero">
        <HeroTileGrid tiles={heroTiles} />
        <div className="home-page__overlay" />
        <HeroText />
      </section>
      <ScrollQuote />
      <div className="home-page__controls">
        <SearchBar onSearch={setSearchQuery} />
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          showMine={!!user}
        />
        {user && (
          <AddButton
            label="add a new board"
            tone="dark"
            onClick={() => setIsCreateBoardOpen(true)}
          />
        )}
      </div>
      {error && <p className="home-page__error">Couldn't load boards: {error}</p>}
      <BoardsSection
        boards={boards}
        isLoading={isLoading}
        onView={handleViewBoard}
        onDelete={handleDeleteBoard}
      />
      <Footer />
      <CreateBoardModal
        isOpen={isCreateBoardOpen}
        onClose={() => setIsCreateBoardOpen(false)}
        onCreate={handleCreateBoard}
      />
    </main>
  )
}
