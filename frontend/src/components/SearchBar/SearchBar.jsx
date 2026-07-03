import { useState } from 'react'
import './SearchBar.css'

export function SearchBar({ onSearch }) {
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch?.(value.trim())
  }

  const handleClear = () => {
    setValue('')
    onSearch?.('')
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <div className="search-bar__input-wrap">
        <input
          type="text"
          className="search-bar__input"
          placeholder="search boards..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {value && (
          <button
            type="button"
            className="search-bar__clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      <button
        type="submit"
        className="search-bar__submit"
        aria-label="Submit search"
      >
        search
      </button>
    </form>
  )
}
