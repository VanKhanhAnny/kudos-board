const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error ?? 'Request failed')
  }

  if (res.status === 204) return null
  return res.json()
}

export function getBoards({ category, filter, search } = {}) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (filter) params.set('filter', filter)
  if (search) params.set('search', search)
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
