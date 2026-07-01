import { useState } from 'react'
import { GiphySearch } from './GiphySearch'
import { Modal } from './Modal'
import './formFields.css'

export function CreateCardModal({ isOpen, boardId, onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [author, setAuthor] = useState('')
  const [selectedGifUrl, setSelectedGifUrl] = useState(null)
  const [error, setError] = useState(null)

  const reset = () => {
    setTitle('')
    setMessage('')
    setAuthor('')
    setSelectedGifUrl(null)
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
    if (!message.trim()) {
      setError('Message is required.')
      return
    }
    if (!selectedGifUrl) {
      setError('Please pick a gif.')
      return
    }
    onCreate({
      id: `${boardId}-card-${Date.now()}`,
      boardId,
      title: title.trim(),
      message: message.trim(),
      gifUrl: selectedGifUrl,
      author: author.trim() || null,
      upvotes: 0,
      createdAt: new Date().toISOString(),
    })
    reset()
    onClose()
  }

  const canSubmit = title.trim() && message.trim() && selectedGifUrl

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="add a new card">
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="field__label" htmlFor="card-title">title</label>
          <input
            id="card-title"
            className="field__input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            autoFocus
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="card-message">message</label>
          <textarea
            id="card-message"
            className="field__textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="card-gif-url">gif url</label>
          <input
            id="card-gif-url"
            className="field__input"
            type="text"
            value={selectedGifUrl ?? ''}
            onChange={(e) => setSelectedGifUrl(e.target.value || null)}
            placeholder="paste a gif url or search below"
          />
        </div>

        <div className="field">
          <label className="field__label">search gifs</label>
          <GiphySearch
            selectedGifUrl={selectedGifUrl}
            onSelectGif={setSelectedGifUrl}
          />
        </div>

        <div className="field">
          <label className="field__label field__label--optional" htmlFor="card-author">
            author
          </label>
          <input
            id="card-author"
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
            post card
          </button>
        </div>
      </form>
    </Modal>
  )
}
