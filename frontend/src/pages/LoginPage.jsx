import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { IconField } from '../components/IconField'
import { useAuth } from '../context/AuthContext'
import userIcon from '../assets/icons/username.png'
import '../components/_shared/AuthForm.css'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('Please fill in both fields.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await login({ username: username.trim(), password })
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
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

        <button type="submit" className="auth-form__submit" disabled={isSubmitting}>
          {isSubmitting ? 'logging in…' : 'log in'}
        </button>

        <div className="auth-form__footer">
          <p className="auth-form__footer-text">Don't have an account</p>
          <Link to="/register" className="auth-form__footer-link">register</Link>
        </div>
      </form>
    </AuthLayout>
  )
}
