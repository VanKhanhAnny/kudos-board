import { useState } from 'react'
import { Modal } from './Modal'
import { heroImages } from '../data/heroImages'
import './formFields.css'
import './CreateBoardModal.css'

const CATEGORIES = [
  { value: 'CELEBRATION', label: 'Celebration' },
  { value: 'THANK_YOU', label: 'Thank you' },
  { value: 'INSPIRATION', label: 'Inspiration' },
]

export function CreateBoardModal({ isOpen, onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('CELEBRATION')
  const [imageUrl, setImageUrl] = useState('')
  const [author, setAuthor] = useState('')
  const [error, setError] = useState(null)

  const reset = () => {
    setTitle('')
    setCategory('CELEBRATION')
    setImageUrl('')
    setAuthor('')
    setError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required.')
      return
    }
    if (!imageUrl.trim()) {
      setError('Image URL is required.')
      return
    }
    onCreate({
      id: `board-${Date.now()}`,
      title: title.trim(),
      category,
      imageUrl: imageUrl.trim(),
      author: author.trim() || null,
      createdAt: new Date().toISOString(),
    })
    reset()
    onClose()
  }

  const canSubmit = title.trim() && imageUrl.trim()

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="create a new board">
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="field__label" htmlFor="board-title">title</label>
          <input
            id="board-title"
            className="field__input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            autoFocus
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="board-category">category</label>
          <select
            id="board-category"
            className="field__select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="board-image">image url</label>
          <input
            id="board-image"
            className="field__input"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="paste an image url or pick one below"
          />
          <div className="board-image-picker">
            {heroImages.slice(0, 6).map((src) => (
              <button
                key={src}
                type="button"
                className={`board-image-picker__tile ${imageUrl === src ? 'is-selected' : ''}`}
                onClick={() => setImageUrl(src)}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field__label field__label--optional" htmlFor="board-author">
            author
          </label>
          <input
            id="board-author"
            className="field__input"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={50}
          />
        </div>

        {error && <p className="form__error">{error}</p>}

        <div className="form__actions">
          <button
            type="button"
            className="form__btn form__btn--cancel"
            onClick={handleClose}
          >
            cancel
          </button>
          <button
            type="submit"
            className="form__btn form__btn--submit"
            disabled={!canSubmit}
          >
            create board
          </button>
        </div>
      </form>
    </Modal>
  )
}
