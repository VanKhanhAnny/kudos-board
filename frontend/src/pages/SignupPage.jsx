import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthLayout } from '../components/AuthLayout'
import { IconField } from '../components/IconField'
import { useAuth } from '../context/AuthContext'
import userIcon from '../assets/icons/username.png'
import mailIcon from '../assets/icons/mail.png'
import '../components/_shared/AuthForm.css'

export function SignupPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in every field.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await register({ username: username.trim(), email: email.trim(), password })
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
        <h1 className="auth-form__title">signUp</h1>

        <IconField
          placeholder="username"
          value={username}
          onChange={setUsername}
          icon={userIcon}
          autoComplete="username"
        />
        <IconField
          type="email"
          placeholder="gmail"
          value={email}
          onChange={setEmail}
          icon={mailIcon}
          autoComplete="email"
        />
        <IconField
          type="password"
          placeholder="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <IconField
          type="password"
          placeholder="confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
        />

        {error && <p className="auth-form__error">{error}</p>}

        <div className="auth-form__divider" />

        <button type="submit" className="auth-form__submit" disabled={isSubmitting}>
          {isSubmitting ? 'registering…' : 'register'}
        </button>

        <div className="auth-form__footer">
          <p className="auth-form__footer-text">Already have an account?</p>
          <Link to="/login" className="auth-form__footer-link">log in</Link>
        </div>
      </form>
    </AuthLayout>
  )
}
