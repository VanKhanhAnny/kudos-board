import { useState } from 'react'
import { heroImages } from '../data/heroImages'
import './GiphySearch.css'

// TODO: swap for a real fetch to `/api/giphy/search?q=${query}` once the backend proxy is live.
function mockSearch(query) {
  const q = query.trim().toLowerCase()
  if (!q) return heroImages.slice(0, 6)
  const shuffled = [...heroImages].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 8)
}

export function GiphySearch({ selectedGifUrl, onSelectGif }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(heroImages.slice(0, 6))
  const [isLoading, setIsLoading] = useState(false)

  const runSearch = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setResults(mockSearch(query))
      setIsLoading(false)
    }, 250)
  }

  return (
    <div className="giphy-search">
      <form onSubmit={runSearch} className="giphy-search__input-row">
        <input
          type="text"
          className="giphy-search__input"
          placeholder="search gifs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="giphy-search__submit">
          search
        </button>
      </form>

      {isLoading ? (
        <p className="giphy-search__status">searching...</p>
      ) : (
        <div className="giphy-search__grid">
          {results.map((url) => (
            <button
              key={url}
              type="button"
              className={`giphy-search__tile ${selectedGifUrl === url ? 'is-selected' : ''}`}
              onClick={() => onSelectGif(url)}
            >
              <img src={url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
