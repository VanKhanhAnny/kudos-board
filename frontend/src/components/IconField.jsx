import { useState } from 'react'
import eyeIcon from '../assets/icons/eye.png'
import hiddenIcon from '../assets/icons/hidden.png'
import './IconField.css'

export function IconField({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  autoComplete,
}) {
  const isPassword = type === 'password'
  const [revealed, setRevealed] = useState(false)
  const inputType = isPassword ? (revealed ? 'text' : 'password') : type

  return (
    <label className="icon-field">
      <input
        className="icon-field__input"
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
      />
      {isPassword ? (
        <button
          type="button"
          className="icon-field__icon icon-field__icon--button"
          onClick={() => setRevealed((prev) => !prev)}
          aria-label={revealed ? 'Hide password' : 'Show password'}
        >
          <img src={revealed ? eyeIcon : hiddenIcon} alt="" />
        </button>
      ) : (
        icon && (
          <span className="icon-field__icon" aria-hidden="true">
            <img src={icon} alt="" />
          </span>
        )
      )}
    </label>
  )
}
