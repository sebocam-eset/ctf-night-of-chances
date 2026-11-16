import { useState, type FormEvent } from 'react'
import { ApiError, login } from '../api'

interface LoginProps {
  onSuccess: () => void
}

export default function Login({ onSuccess }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      await login(username, password)
      onSuccess()
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Wrong credentials.')
      } else {
        setError('Prihlásenie sa nepodarilo — skúste to znova.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Esetko</h1>
        <p className="login-subtitle">Interný AI asistent — prihlásenie</p>

        <label htmlFor="username">Meno</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
          required
        />

        <label htmlFor="password">Heslo</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy || !username || !password}>
          {busy ? 'Prihlasujem…' : 'Prihlásiť sa'}
        </button>
      </form>
    </div>
  )
}
