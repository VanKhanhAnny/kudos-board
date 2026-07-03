const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

// Token storage lives here so every request can pick it up without each
// caller having to pass it. AuthContext writes to this same key on login
// and clears it on logout.
export const TOKEN_STORAGE_KEY = 'kudos:auth:token'

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error ?? 'Request failed')
  }

  if (res.status === 204) return null
  return res.json()
}

export function registerUser({ username, email, password }) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  })
}

export function loginUser({ username, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}

export function getMe() {
  return request('/auth/me')
}

export function getBoards({ category, filter, search, mine } = {}) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (filter) params.set('filter', filter)
  if (search) params.set('search', search)
  if (mine) params.set('mine', 'true')
  const qs = params.toString()
  return request(`/boards${qs ? `?${qs}` : ''}`)
}

export function createBoard(payload) {
  return request('/boards', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getBoard(id) {
  return request(`/boards/${id}`)
}

export function deleteBoard(id) {
  return request(`/boards/${id}`, { method: 'DELETE' })
}

export function createCard(boardId, payload) {
  return request(`/boards/${boardId}/cards`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function deleteCard(id) {
  return request(`/cards/${id}`, { method: 'DELETE' })
}

export function upvoteCard(id) {
  return request(`/cards/${id}/upvote`, { method: 'PATCH' })
}

export function searchGiphy(query) {
  return request(`/giphy/search?q=${encodeURIComponent(query)}`)
}
