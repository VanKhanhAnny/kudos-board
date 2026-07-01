import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import './Header.css'

const MOCK_USERNAME = 'Anny'

export function Header() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isLoggedIn = params.get('logged-in') === 'true'

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
    const nextParams = new URLSearchParams(params)
    nextParams.delete('logged-in')
    const search = nextParams.toString()
    navigate(`${location.pathname}${search ? `?${search}` : ''}`)
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
            Hi {MOCK_USERNAME}!
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
