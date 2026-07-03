import { useEffect, useState } from 'react'
import './GiphySearch.css'

// Called directly from the browser per planning.md §1. Free-tier GIPHY keys are
// intended for client-side use, so no backend proxy. Key comes from
// frontend/.env.local (VITE_GIPHY_API_KEY) and is gitignored.
const GIPHY_KEY = import.meta.env.VITE_GIPHY_API_KEY
const GIPHY_BASE = 'https://api.giphy.com/v1/gifs'
const LIMIT = 12

async function fetchGiphy(path, params) {
  const url = new URL(`${GIPHY_BASE}/${path}`)
  url.searchParams.set('api_key', GIPHY_KEY)
  url.searchParams.set('limit', String(LIMIT))
  url.searchParams.set('rating', 'pg-13')
  for (const [k, v] of Object.entries(params ?? {})) {
    url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`GIPHY responded with ${res.status}`)
  }
  const body = await res.json()
  // fixed_height is ~200px tall — right size for both the picker grid and the
  // final card thumbnail. Fall back to original if fixed_height is missing.
  return body.data
    .map((gif) => gif.images?.fixed_height?.url ?? gif.images?.original?.url)
    .filter(Boolean)
}

export function GiphySearch({ selectedGifUrl, onSelectGif }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    if (!GIPHY_KEY) return
    let cancelled = false
    setIsLoading(true)
    fetchGiphy('trending', {})
      .then((urls) => {
        if (!cancelled) setResults(urls)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const runSearch = async () => {
    const q = query.trim()
    if (!q) return
    setHasSearched(true)
    setError(null)
    setIsLoading(true)
    try {
      const urls = await fetchGiphy('search', { q })
      setResults(urls)
    } catch (err) {
      setError(err.message)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      runSearch()
    }
  }

  // No <form> here on purpose: GiphySearch is used inside CreateCardModal's
  // outer <form>, and nested forms are invalid HTML — the browser will submit
  // the outer form when you click a nested type="submit" button, reloading
  // the page and closing the modal.
  return (
    <div className="giphy-search">
      <div className="giphy-search__input-row">
        <input
          type="text"
          className="giphy-search__input"
          placeholder="search gifs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKey}
        />
        <button
          type="button"
          className="giphy-search__submit"
          onClick={runSearch}
          disabled={!query.trim() || isLoading}
        >
          search
        </button>
      </div>

      {!GIPHY_KEY && (
        <p className="giphy-search__status">
          missing VITE_GIPHY_API_KEY — add it to frontend/.env.local and restart vite
        </p>
      )}

      {GIPHY_KEY && isLoading && (
        <p className="giphy-search__status">searching...</p>
      )}

      {GIPHY_KEY && !isLoading && error && (
        <p className="giphy-search__status">couldn't reach giphy: {error}</p>
      )}

      {GIPHY_KEY && !isLoading && !error && results.length === 0 && hasSearched && (
        <p className="giphy-search__status">no gifs found for "{query}"</p>
      )}

      {GIPHY_KEY && !isLoading && !error && results.length > 0 && (
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
