import { useEffect, useRef, useState } from 'react'
import './Header.css'

const NAV_TABS = [
  { id: 'home', label: 'home' },
  { id: 'recent', label: 'recent' },
  { id: 'celebration', label: 'celebration' },
  { id: 'thank-you', label: 'thank you' },
  { id: 'inspiration', label: 'inspiration' },
]

export function Header() {
  const [activeTab, setActiveTab] = useState('home')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="header">
      <nav className="header__nav">
        {NAV_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`header__nav-tab ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="header__right">
        <div className="header__search">
          <input
            type="text"
            placeholder="search..."
            className="header__search-input"
          />
        </div>

        <div ref={userRef} className="header__user">
          <button
            className="header__user-button"
            aria-label="Account menu"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
          >
            <img src="/icons/human.png" alt="" />
          </button>

          {isUserMenuOpen && (
            <div className="header__user-menu">
              <button className="header__user-menu-item">log in</button>
              <button className="header__user-menu-item">register</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
