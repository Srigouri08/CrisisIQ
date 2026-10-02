import {useMemo, useState} from 'react'
import {useCurrentUser, useDocumentEvent, useDocuments, type DocumentHandle} from '@sanity/sdk-react'
import {ArtifactCard} from './ArtifactCard'
import {ArtifactEditor} from './ArtifactEditor'
import {CreateArtifact} from './CreateArtifact'

const tabs = ['observatory', 'curator', 'activity'] as const
type Tab = typeof tabs[number]

export function ArchiveApp() {
  const [tab, setTab] = useState<Tab>('observatory')
  const [selected, setSelected] = useState<DocumentHandle | null>(null)
  const [search, setSearch] = useState('')
  const [events, setEvents] = useState<string[]>([])
  const currentUser = useCurrentUser()

  useDocumentEvent({onEvent: event => {
    const label = event.type === 'remote-patches' ? 'A remote curator changed an exhibit' : `You ${event.type} an exhibit`
    setEvents(prev => [label, ...prev].slice(0, 8))
  }})

  const subtitle = useMemo(() => {
    if (tab === 'observatory') return 'A living museum of things that should not be this strange.'
    if (tab === 'curator') return 'Research, edit, and move exhibits through the curation pipeline.'
    return 'Real-time signals from the Content Lake.'
  }, [tab])

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">✦</span><span>THE WEIRD ARCHIVE</span></div>
        <div className="user-pill">{currentUser?.name ?? 'Curator'} <span>●</span></div>
      </header>

      <aside className="sidebar">
        <div className="eyebrow">SANITY CONTENT APP</div>
        <h1>Odd things.<br/><em>Properly archived.</em></h1>
        <p className="intro">A fit-for-purpose editorial desk for collecting, researching, and exhibiting delightful anomalies.</p>
        <nav>
          {tabs.map(item => (
            <button key={item} className={tab === item ? 'nav active' : 'nav'} onClick={() => setTab(item)}>
              <span>{item === 'observatory' ? '◉' : item === 'curator' ? '✎' : '◌'}</span>{item}
            </button>
          ))}
        </nav>
        <div className="side-note"><strong>LIVE LAKE</strong><br/>Changes made in Studio appear here without a refresh.</div>
      </aside>

      <main className="main">
        <section className="hero">
          <div><div className="eyebrow">{tab.toUpperCase()}</div><h2>{subtitle}</h2></div>
          {tab !== 'activity' && <CreateArtifact />}
        </section>

        {tab === 'observatory' && <Observatory search={search} setSearch={setSearch} onSelect={setSelected} />}
        {tab === 'curator' && <Curator onSelect={setSelected} />}
        {tab === 'activity' && <Activity events={events} />}
      </main>

      {selected && <ArtifactEditor handle={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function Observatory({search, setSearch, onSelect}: {search: string; setSearch: (v: string) => void; onSelect: (h: DocumentHandle) => void}) {
  const {data: handles = []} = useDocuments({documentType: 'oddity', batchSize: 30, orderings: [{field: '_updatedAt', direction: 'desc'}]})
  return (
    <>
      <div className="toolbar"><div className="search"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search the archive…" /></div><span className="count">{handles.length} exhibits</span></div>
      <div className="grid">
        {handles.map(handle => <ArtifactCard key={handle.documentId} handle={handle} search={search} onSelect={onSelect} />)}
      </div>
    </>
  )
}

function Curator({onSelect}: {onSelect: (h: DocumentHandle) => void}) {
  const {data: handles = []} = useDocuments({documentType: 'oddity', batchSize: 30, orderings: [{field: '_updatedAt', direction: 'desc'}]})
  const stages = ['inbox', 'researching', 'review', 'approved']
  return (
    <div className="board">
      {stages.map(stage => <div className="lane" key={stage}>
        <div className="lane-head"><span>{stage}</span><b>{handles.length}</b></div>
        {handles.map(handle => <ArtifactCard key={handle.documentId + stage} handle={handle} stageFilter={stage} compact onSelect={onSelect} />)}
      </div>)}
    </div>
  )
}

function Activity({events}: {events: string[]}) {
  return <div className="activity"><div className="signal">● LIVE</div><h3>Content Lake signals</h3>{events.length === 0 ? <p>Make an edit or publish an exhibit. The archive will notice.</p> : events.map((event, i) => <div className="event" key={`${event}-${i}`}><span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>{event}</div>)}</div>
}
