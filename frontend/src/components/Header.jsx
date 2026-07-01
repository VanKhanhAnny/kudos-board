import './Header.css'

export function Header() {
  return (
    <header className="header">
      <div className="header__auth">
        <button className="header__auth-btn header__auth-btn--ghost" type="button">
          log in
        </button>
        <button className="header__auth-btn header__auth-btn--solid" type="button">
          register
        </button>
      </div>
    </header>
  )
}
