import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { IconField } from '../components/IconField'
import userIcon from '../assets/icons/username.png'
import '../components/_shared/AuthForm.css'

export function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('Please fill in both fields.')
      return
    }
    // TODO: replace with real POST /auth/login when backend is ready.
    navigate('/?logged-in=true')
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleSubmit}>
        <p className="auth-form__intro">want to make someone's day?</p>
        <h1 className="auth-form__title">logIn</h1>

        <IconField
          placeholder="username"
          value={username}
          onChange={setUsername}
          icon={userIcon}
          autoComplete="username"
        />
        <IconField
          type="password"
          placeholder="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        {error && <p className="auth-form__error">{error}</p>}

        <div className="auth-form__divider" />

        <button type="submit" className="auth-form__submit">log in</button>

        <div className="auth-form__footer">
          <p className="auth-form__footer-text">Don't have an account</p>
          <Link to="/register" className="auth-form__footer-link">register</Link>
        </div>
      </form>
    </AuthLayout>
  )
}
