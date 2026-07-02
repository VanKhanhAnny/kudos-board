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
import { heroTiles } from '../data/heroTiles'
import { realBoards } from '../data/realBoards'
import './HomePage.css'

const CATEGORY_KEY = 'kudos:home:category'
const SCROLL_KEY = 'kudos:home:scroll'

function filterBoards(boards, category, query) {
  let result = boards
  if (category === 'recent') result = result.slice(0, 6)
  else if (category !== 'all') result = result.filter((b) => b.category === category)
  if (query) {
    const q = query.toLowerCase()
    result = result.filter((b) => b.title.toLowerCase().includes(q))
  }
  return result
}

export function HomePage() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState(
    () => sessionStorage.getItem(CATEGORY_KEY) ?? 'all',
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [boards, setBoards] = useState(realBoards)
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false)
  const scrollRestoredRef = useRef(false)

  useEffect(() => {
    sessionStorage.setItem(CATEGORY_KEY, selectedCategory)
  }, [selectedCategory])

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

  const visibleBoards = filterBoards(boards, selectedCategory, searchQuery)

  const handleDeleteBoard = (id) => {
    setBoards((prev) => prev.filter((b) => b.id !== id))
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
        />
        <AddButton
          label="add a new board"
          tone="dark"
          onClick={() => setIsCreateBoardOpen(true)}
        />
      </div>
      <BoardsSection
        boards={visibleBoards}
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
