import { useEffect, useMemo, useState, type FormEvent } from 'react'
import App from './App'
import './auth.css'

type AuthSession = {
  access_token: string
  refresh_token: string
  user: { id: string; email?: string; user_metadata?: { full_name?: string } }
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const SESSION_KEY = 'crisisiq.auth.session'

function configReady() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

async function supabaseRequest(path: string, options: RequestInit = {}, accessToken?: string) {
  if (!configReady()) throw new Error('Supabase is not connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.')
  const response = await fetch(`${SUPABASE_URL!.replace(/\/$/, '')}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
  })
  const body = await response.text()
  let data: any = null
  try { data = body ? JSON.parse(body) : null } catch { data = null }
  if (!response.ok) throw new Error(data?.msg || data?.error_description || data?.message || 'Authentication request failed.')
  return data
}

function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveSession(session: AuthSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}

function getRecoveryToken() {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return hash.get('access_token')
}

function getRecoveryRedirect() {
  return `${window.location.origin}${window.location.pathname}`
}

export default function AuthGate() {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession())
  const [mode, setMode] = useState<AuthMode>(() => getRecoveryToken() ? 'reset' : 'login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const displayName = useMemo(() => session?.user.user_metadata?.full_name || session?.user.email?.split('@')[0] || 'Incident analyst', [session])
  const initials = useMemo(() => displayName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'U', [displayName])

  useEffect(() => {
    if (session) {
      document.documentElement.style.setProperty('--auth-user-name', JSON.stringify(displayName))
      document.documentElement.style.setProperty('--auth-user-initials', JSON.stringify(initials))
    }
  }, [displayName, initials, session])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setNotice('')
    if (mode === 'signup' && password !== confirmPassword) return setError('Passwords do not match.')
    if (password && password.length < 6 && mode !== 'forgot') return setError('Use at least 6 characters for your password.')
    setBusy(true)
    try {
      if (mode === 'login') {
        const data = await supabaseRequest('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) })
        saveSession(data)
        setSession(data)
      } else if (mode === 'signup') {
        const data = await supabaseRequest('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ email, password, data: { full_name: name }, options: { email_redirect_to: getRecoveryRedirect() } }) })
        if (data?.access_token) { saveSession(data); setSession(data) }
        else setNotice('Account created. Check your email to confirm your account, then sign in.')
      } else if (mode === 'forgot') {
        const redirectTo = getRecoveryRedirect()
        await supabaseRequest(`/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, { method: 'POST', body: JSON.stringify({ email }) })
        setNotice('If an account exists for that email, a password reset link has been sent.')
      } else {
        const token = getRecoveryToken()
        if (!token) throw new Error('Your reset link has expired. Request a new one.')
        await supabaseRequest('/auth/v1/user', { method: 'PUT', body: JSON.stringify({ password }) }, token)
        window.history.replaceState({}, document.title, window.location.pathname)
        setMode('login')
        setPassword('')
        setConfirmPassword('')
        setNotice('Password updated. You can now sign in.')
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Something went wrong.')
    } finally { setBusy(false) }
  }

  const signOut = async () => {
    const current = session
    saveSession(null)
    setSession(null)
    if (current?.access_token) { try { await supabaseRequest('/auth/v1/logout', { method: 'POST' }, current.access_token) } catch {} }
  }

  if (session) {
    return <div className="authenticated-app"><button className="auth-signout" onClick={signOut} aria-label="Sign out">Sign out</button><App /></div>
  }

  const title = mode === 'signup' ? 'Create your CrisisIQ workspace' : mode === 'forgot' ? 'Reset your password' : mode === 'reset' ? 'Choose a new password' : 'Welcome back to CrisisIQ'
  const subtitle = mode === 'signup' ? 'Create an account to access your investigation workspace.' : mode === 'forgot' ? 'Enter your email and we will send you a secure reset link.' : mode === 'reset' ? 'Set a new password for your CrisisIQ account.' : 'Sign in to your investigation workspace.'

  return <main className="auth-page">
    <div className="auth-glow auth-glow-one" /><div className="auth-glow auth-glow-two" />
    <section className="auth-card">
      <div className="auth-brand"><span className="auth-brand-mark">✦</span><span>crisis<span>iq</span></span></div>
      <div className="auth-heading"><span className="auth-eyebrow">INVESTIGATION WORKSPACE</span><h1>{title}</h1><p>{subtitle}</p></div>
      {!configReady() && <div className="auth-config">Connect Supabase first by adding <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your Vercel environment.</div>}
      {error && <div className="auth-message auth-error">{error}</div>}
      {notice && <div className="auth-message auth-notice">{notice}</div>}
      <form onSubmit={submit} className="auth-form">
        {mode === 'signup' && <label>Full name<input value={name} onChange={e => setName(e.target.value)} placeholder="Jordan Davis" autoComplete="name" required /></label>}
        {mode !== 'reset' && <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>}
        {mode !== 'forgot' && <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required /></label>}
        {(mode === 'signup' || mode === 'reset') && <label>Confirm password<input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" required /></label>}
        <button className="auth-submit" disabled={busy || !configReady()}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create workspace' : mode === 'forgot' ? 'Send reset link' : mode === 'reset' ? 'Update password' : 'Sign in'}</button>
      </form>
      <div className="auth-links">
        {mode === 'login' && <><button onClick={() => { setMode('forgot'); setError(''); setNotice('') }}>Forgot password?</button><span>Don’t have an account? <button onClick={() => { setMode('signup'); setError(''); setNotice('') }}>Create one</button></span></>}
        {mode === 'signup' && <span>Already have an account? <button onClick={() => { setMode('login'); setError(''); setNotice('') }}>Sign in</button></span>}
        {mode === 'forgot' && <span>Remembered it? <button onClick={() => { setMode('login'); setError(''); setNotice('') }}>Back to sign in</button></span>}
        {mode === 'reset' && <span>After updating your password, you can sign in normally.</span>}
      </div>
      <div className="auth-footer"><span className="auth-status-dot" /> Secure workspace access · CrisisIQ</div>
    </section>
  </main>
}
