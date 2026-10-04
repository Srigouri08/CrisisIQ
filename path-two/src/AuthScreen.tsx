import {useEffect, useState, type FormEvent} from 'react'
import {supabase} from './lib/supabase'

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset'

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>(() => window.location.pathname === '/reset-password' ? 'reset' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) return
    const {data: listener} = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('reset')
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      if (mode === 'login') {
        const {error: signInError} = await supabase.auth.signInWithPassword({email: email.trim(), password})
        if (signInError) throw signInError
      } else if (mode === 'signup') {
        const {data, error: signUpError} = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {data: {display_name: name.trim() || email.split('@')[0]}},
        })
        if (signUpError) throw signUpError
        if (!data.session) setMessage('Account created. Check your email to confirm the account, then sign in.')
      } else if (mode === 'forgot') {
        const redirectTo = `${window.location.origin}/reset-password`
        const {error: resetError} = await supabase.auth.resetPasswordForEmail(email.trim(), {redirectTo})
        if (resetError) throw resetError
        setMessage('Reset link sent. Check your email and open the link on this device.')
      } else {
        const {error: updateError} = await supabase.auth.updateUser({password})
        if (updateError) throw updateError
        setMessage('Password updated. You can sign in with your new password.')
        window.history.replaceState({}, '', '/')
        setMode('login')
        setPassword('')
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

  const isReset = mode === 'reset'
  const isForgot = mode === 'forgot'

  return <div className="auth-shell">
    <div className="auth-grid">
      <section className="auth-story">
        <div className="auth-brand"><span>CI</span><div><strong>CRISISIQ</strong><small>INCIDENT INVESTIGATION</small></div></div>
        <div className="auth-story-copy"><div className="auth-kicker">PRIVATE INVESTIGATION WORKSPACE</div><h1>Follow the signal.<br/><em>Keep the evidence.</em></h1><p>A structured case room for turning messy incidents into reviewable evidence, competing claims, and decisions that stay attached to the record.</p><div className="auth-points"><span>01 · Evidence chains</span><span>02 · Human review gates</span><span>03 · Live Sanity content</span></div></div>
      </section>
      <section className="auth-card">
        {!isReset && <div className="auth-tabs"><button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => {setMode('login'); setError(''); setMessage('')}}>Sign in</button><button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => {setMode('signup'); setError(''); setMessage('')}}>Create account</button></div>}
        <div className="auth-heading">
          <div className="auth-kicker">{isReset ? 'SECURE RECOVERY' : isForgot ? 'ACCOUNT RECOVERY' : mode === 'login' ? 'WELCOME BACK' : 'NEW INVESTIGATOR'}</div>
          <h2>{isReset ? 'Set a new password.' : isForgot ? 'Reset your password.' : mode === 'login' ? 'Enter CrisisIQ.' : 'Open a case room.'}</h2>
          <p>{isReset ? 'Choose a new password for your CrisisIQ account.' : isForgot ? 'Enter your email and we will send you a secure reset link.' : mode === 'login' ? 'Sign in to continue to your investigation workspace.' : 'Create a private account for the investigation workspace.'}</p>
        </div>
        <form onSubmit={submit}>
          {mode !== 'reset' && <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>}
          {mode === 'signup' && <label>Display name<input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" /></label>}
          {mode !== 'forgot' && <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={isReset ? 'At least 6 characters' : 'At least 6 characters'} minLength={6} autoComplete={isReset || mode === 'signup' ? 'new-password' : 'current-password'} required /></label>}
          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-message">{message}</div>}
          <button className="auth-submit" disabled={busy}>{busy ? 'Please wait…' : isReset ? 'Update password →' : isForgot ? 'Send reset link →' : mode === 'login' ? 'Sign in →' : 'Create account →'}</button>
        </form>
        <div className="auth-links">
          {mode === 'login' && <button type="button" onClick={() => {setMode('forgot'); setError(''); setMessage('')}}>Forgot password?</button>}
          {(isForgot || isReset) && <button type="button" onClick={() => {window.history.replaceState({}, '', '/'); setMode('login'); setError(''); setMessage('')}}>Back to sign in</button>}
        </div>
        <small className="auth-foot">Authentication is handled by Supabase. Investigation content stays in the Sanity Content Lake.</small>
      </section>
    </div>
  </div>
}
