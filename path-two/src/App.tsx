import {useEffect, useState} from 'react'
import {SanityApp, type SanityConfig} from '@sanity/sdk-react'
import '@sanity/ui/styles.css'
import {ThemeProvider, buildTheme} from '@sanity/ui'
import type {Session} from '@supabase/supabase-js'
import {ArchiveApp} from './ArchiveApp'
import {AuthScreen} from './AuthScreen'
import {supabase, supabaseConfigured} from './lib/supabase'
import './styles.css'

const config: SanityConfig[] = [{
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET ?? 'production',
}]

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setCheckingAuth(false)
      return
    }
    supabase.auth.getSession().then(({data}) => {
      setSession(data.session)
      setCheckingAuth(false)
    })
    const {data: listener} = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  if (!supabaseConfigured) return <AuthScreen />
  if (checkingAuth) return <div className="boot">Checking your CrisisIQ session…</div>
  if (!session) return <AuthScreen />

  return (
    <ThemeProvider theme={buildTheme()}>
      <SanityApp config={config} fallback={<div className="boot">Connecting to the CrisisIQ Content Lake…</div>}>
        <ArchiveApp accountEmail={session.user.email ?? ''} onSignOut={() => supabase?.auth.signOut()} />
      </SanityApp>
    </ThemeProvider>
  )
}
