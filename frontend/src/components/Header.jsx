import { Link } from 'react-router-dom'
import './Header.css'

export function Header() {
  return (
    <header className="header">
      <div className="header__auth">
        <Link to="/login" className="header__auth-btn header__auth-btn--ghost">
          log in
        </Link>
        <Link to="/register" className="header__auth-btn header__auth-btn--solid">
          register
        </Link>
      </div>
    </header>
  )
}
