import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Header.css'

export function Header() {
  const { user, logout } = useAuth()
  const isLoggedIn = Boolean(user)

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    if (!isMenuOpen) return
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [isMenuOpen])

  const handleSignOut = () => {
    setIsMenuOpen(false)
    logout()
  }

  return (
    <header className="header">
      {isLoggedIn ? (
        <div className="header__user" ref={wrapRef}>
          <button
            type="button"
            className="header__greeting"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            Hi {user.username}!
          </button>
          {isMenuOpen && (
            <div className="header__menu">
              <button
                type="button"
                className="header__menu-item"
                onClick={handleSignOut}
              >
                sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="header__auth">
          <Link to="/login" className="header__auth-btn header__auth-btn--ghost">
            log in
          </Link>
          <Link to="/register" className="header__auth-btn header__auth-btn--solid">
            register
          </Link>
        </div>
      )}
    </header>
  )
}
