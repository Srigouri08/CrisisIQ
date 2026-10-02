import {useState} from 'react'
import {supabase} from './lib/supabase'

export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      if (mode === 'login') {
        const {error: signInError} = await supabase.auth.signInWithPassword({email: email.trim(), password})
        if (signInError) throw signInError
      } else {
        const {data, error: signUpError} = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {data: {display_name: name.trim() || email.split('@')[0]}},
        })
        if (signUpError) throw signUpError
        if (!data.session) setMessage('Account created. Check your email to confirm the account, then sign in.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (!supabase) {
    return <div className="auth-shell"><div className="auth-card"><div className="auth-brand"><span>CI</span><div><strong>CRISISIQ</strong><small>INCIDENT INVESTIGATION</small></div></div><div className="auth-kicker">SETUP REQUIRED</div><h1>Connect the workspace.</h1><p>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to the Vercel project environment, then redeploy.</p></div></div>
  }

  return <div className="auth-shell">
    <div className="auth-grid">
      <section className="auth-story">
        <div className="auth-brand"><span>CI</span><div><strong>CRISISIQ</strong><small>INCIDENT INVESTIGATION</small></div></div>
        <div className="auth-story-copy"><div className="auth-kicker">PRIVATE INVESTIGATION WORKSPACE</div><h1>Follow the signal.<br/><em>Keep the evidence.</em></h1><p>A structured case room for turning messy incidents into reviewable evidence, competing claims, and decisions that stay attached to the record.</p><div className="auth-points"><span>01 · Evidence chains</span><span>02 · Human review gates</span><span>03 · Live Sanity content</span></div></div>
      </section>
      <section className="auth-card">
        <div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button><button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Create account</button></div>
        <div className="auth-heading"><div className="auth-kicker">{mode === 'login' ? 'WELCOME BACK' : 'NEW INVESTIGATOR'}</div><h2>{mode === 'login' ? 'Enter CrisisIQ.' : 'Open a case room.'}</h2><p>{mode === 'login' ? 'Sign in to continue to your investigation workspace.' : 'Create a private account for the investigation workspace.'}</p></div>
        <form onSubmit={submit}>
          {mode === 'signup' && <label>Display name<input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" /></label>}
          <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
          <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /></label>
          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-message">{message}</div>}
          <button className="auth-submit" disabled={busy}>{busy ? 'Opening workspace…' : mode === 'login' ? 'Sign in →' : 'Create account →'}</button>
        </form>
        <small className="auth-foot">Authentication is handled by Supabase. Investigation content stays in the Sanity Content Lake.</small>
      </section>
    </div>
  </div>
}
