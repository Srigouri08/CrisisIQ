import {SanityApp, type SanityConfig} from '@sanity/sdk-react'
import '@sanity/ui/styles.css'
import {ThemeProvider, buildTheme} from '@sanity/ui'
import {CrisisIQApp} from './CrisisIQApp'
import './styles.css'

const config: SanityConfig[] = [{
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET ?? 'production',
}]

export default function App() {
  return <ThemeProvider theme={buildTheme()}><SanityApp config={config} fallback={<div className="boot">Opening CrisisIQ…</div>}><CrisisIQApp /></SanityApp></ThemeProvider>
}
