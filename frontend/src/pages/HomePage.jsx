import { useState } from 'react'
import { BoardGrid } from '../components/BoardGrid'
import { BoardsSection } from '../components/BoardsSection'
import { CategoryFilter } from '../components/CategoryFilter'
import { Header } from '../components/Header'
import { HeroText } from '../components/HeroText'
import { ScrollQuote } from '../components/ScrollQuote'
import { SearchBar } from '../components/SearchBar'
import { mockBoards } from '../data/mockBoards'
import { realBoards } from '../data/realBoards'
import './HomePage.css'

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
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const visibleBoards = filterBoards(realBoards, selectedCategory, searchQuery)

  return (
    <main className="home-page">
      <Header />
      <section className="home-page__hero">
        <BoardGrid boards={mockBoards} />
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
      </div>
      <BoardsSection boards={visibleBoards} />
    </main>
  )
}
