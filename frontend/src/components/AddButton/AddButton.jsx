import './AddButton.css'

export function AddButton({ label, onClick, tone = 'dark' }) {
  return (
    <button
      type="button"
      className={`add-button add-button--${tone}`}
      onClick={onClick}
    >
      <span className="add-button__plus" aria-hidden="true">+</span>
      <span className="add-button__label">{label}</span>
    </button>
  )
}
