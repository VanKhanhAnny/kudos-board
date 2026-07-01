import { BoardGrid } from '../components/BoardGrid'
import { Header } from '../components/Header'
import { HeroText } from '../components/HeroText'
import { mockBoards } from '../data/mockBoards'
import './HomePage.css'

export function HomePage() {
  return (
    <main className="home-page">
      <BoardGrid boards={mockBoards} />
      <div className="home-page__overlay" />
      <HeroText />
      <Header />
    </main>
  )
}
