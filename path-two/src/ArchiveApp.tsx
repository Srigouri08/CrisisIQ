import {useMemo, useState} from 'react'
import {useCurrentUser, useDocumentEvent, useDocuments, type DocumentHandle} from '@sanity/sdk-react'
import {ArtifactCard} from './ArtifactCard'
import {ArtifactEditor} from './ArtifactEditor'
import {CreateArtifact} from './CreateArtifact'

const tabs = ['observatory', 'curator', 'activity'] as const
type Tab = typeof tabs[number]
const stages = ['inbox', 'researching', 'review', 'approved', 'archived'] as const

export function ArchiveApp() {
  const [tab, setTab] = useState<Tab>('observatory')
  const [selected, setSelected] = useState<DocumentHandle | null>(null)
  const [search, setSearch] = useState('')
  const [events, setEvents] = useState<{label: string; at: string}[]>([])
  const currentUser = useCurrentUser()

  useDocumentEvent({onEvent: event => {
    const label = event.type === 'remote-patches' ? 'Remote curator updated an exhibit' : `Document ${event.type}`
    setEvents(prev => [{label, at: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}, ...prev].slice(0, 10))
  }})

  const subtitle = useMemo(() => {
    if (tab === 'observatory') return 'A living museum for things that should not be this strange.'
    if (tab === 'curator') return 'A structured editorial pipeline from first sighting to public exhibit.'
    return 'A real-time signal layer over the Sanity Content Lake.'
  }, [tab])

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">✦</span><span>THE WEIRD ARCHIVE</span><span className="brand-live"><i/>LIVE CONTENT LAKE</span></div>
        <div className="top-actions"><span className="workspace">NORTHSTAR / CURATION</span><div className="user-pill"><span className="avatar">{(currentUser?.name ?? 'C').slice(0, 1).toUpperCase()}</span>{currentUser?.name ?? 'Curator'}</div></div>
      </header>

      <aside className="sidebar">
        <div className="eyebrow">SANITY CONTENT APP · 02</div>
        <div className="side-title"><span>ODD</span><strong>ARCHIVE</strong></div>
        <p className="intro">A strange little editorial machine where stories become structured content, evidence becomes reviewable, and nothing gets exhibited by accident.</p>
        <nav>
          {tabs.map(item => <button key={item} className={tab === item ? 'nav active' : 'nav'} onClick={() => setTab(item)}>
            <span>{item === 'observatory' ? '◉' : item === 'curator' ? '⌘' : '◌'}</span>{item}<b>{item === 'activity' ? events.length : ''}</b>
          </button>)}
        </nav>
        <div className="side-stack">
          <div><span>CONTENT MODEL</span><strong>oddity</strong></div>
          <div><span>WORKFLOW</span><strong>5 stages</strong></div>
          <div><span>SYNC</span><strong className="green-text">REAL-TIME</strong></div>
        </div>
        <div className="side-note"><strong>WHY SANITY?</strong><br/>The interface is custom. The source of truth is structured content in the Content Lake.</div>
      </aside>

      <main className="main">
        <section className="hero">
          <div>
            <div className="eyebrow">{tab.toUpperCase()} / {new Date().getFullYear()}</div>
            <h1>{subtitle}</h1>
            <p className="hero-sub">Collect → investigate → review → exhibit. Every transition is data.</p>
          </div>
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
  const {data: handles = []} = useDocuments({documentType: 'oddity', batchSize: 50, orderings: [{field: '_updatedAt', direction: 'desc'}]})
  const {data: taskHandles = []} = useDocuments({documentType: 'curationTask', batchSize: 50, orderings: [{field: '_updatedAt', direction: 'desc'}]})
  const [filter, setFilter] = useState('all')
  const featuredCount = handles.filter(Boolean).length
  const visible = filter === 'all' ? handles : handles.filter(h => h)

  return <>
    <div className="metric-row">
      <Metric label="Exhibits" value={featuredCount} detail="structured oddities" icon="◉" />
      <Metric label="Review queue" value={taskHandles.length} detail="modeled tasks" icon="◎" />
      <Metric label="Workflow" value="5" detail="editorial stages" icon="↗" />
      <Metric label="Lake" value="LIVE" detail="real-time sync" icon="●" green />
    </div>
    <div className="toolbar"><div className="search"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, hook, or tag…" /></div><div className="filter-pills">{['all', 'featured'].map(item => <button key={item} className={filter === item ? 'filter active' : 'filter'} onClick={() => setFilter(item)}>{item}</button>)}</div><span className="count">{visible.length} records</span></div>
    <div className="section-line"><span>RECENTLY UPDATED</span><span>CONTENT LAKE / ODDITY</span></div>
    <div className="grid">{visible.map(handle => <ArtifactCard key={handle.documentId} handle={handle} search={search} onSelect={onSelect} />)}</div>
    {visible.length === 0 && <EmptyState />}
  </>
}

function Metric({label, value, detail, icon, green}: {label: string; value: string | number; detail: string; icon: string; green?: boolean}) {
  return <div className="metric"><span className={green ? 'metric-icon green' : 'metric-icon'}>{icon}</span><div><div className="metric-label">{label}</div><strong>{value}</strong><small>{detail}</small></div></div>
}

function Curator({onSelect}: {onSelect: (h: DocumentHandle) => void}) {
  const {data: handles = []} = useDocuments({documentType: 'oddity', batchSize: 50, orderings: [{field: '_updatedAt', direction: 'desc'}]})
  const [focus, setFocus] = useState<string>('all')
  const counts = stages.map(stage => ({stage, count: handles.length}))
  const displayed = focus === 'all' ? stages : stages.filter(stage => stage === focus)
  return <>
    <div className="workflow-header"><div><div className="eyebrow">EDITORIAL CONTROL ROOM</div><h2>Move evidence, not just cards.</h2></div><div className="filter-pills">{['all', ...stages].map(item => <button key={item} className={focus === item ? 'filter active' : 'filter'} onClick={() => setFocus(item)}>{item}</button>)}</div></div>
    <div className={`board ${focus !== 'all' ? 'board-focus' : ''}`}>
      {displayed.map(stage => <div className="lane" key={stage}><div className="lane-head"><div><span className="lane-index">0{stages.indexOf(stage) + 1}</span><span>{stage}</span></div><b>{counts.find(x => x.stage === stage)?.count ?? 0} / LIVE</b></div>{handles.map(handle => <ArtifactCard key={handle.documentId + stage} handle={handle} stageFilter={stage} compact onSelect={onSelect} />)}</div>)}
    </div>
  </>
}

function Activity({events}: {events: {label: string; at: string}[]}) {
  return <div className="activity-wrap"><div className="activity-hero"><div><div className="eyebrow">EVENT STREAM</div><h2>Content Lake signals</h2><p>Changes made in Studio or the custom app can surface here without a page refresh.</p></div><div className="live-orb"><span/>LIVE</div></div><div className="activity-grid"><div className="activity"><div className="signal">● LISTENING TO SANITY</div>{events.length === 0 ? <div className="empty-event"><strong>Nothing moved yet.</strong><span>Edit, publish, or move an exhibit through the workflow to create a signal.</span></div> : events.map((event, i) => <div className="event" key={`${event.label}-${i}`}><span>{event.at}</span><div><b>{event.label}</b><small>Content Lake event · {i === 0 ? 'just now' : 'recent'}</small></div></div>)}</div><div className="signal-card"><div className="eyebrow">ARCHITECTURE</div><div className="signal-line"><span>CONTENT</span><b>Sanity</b></div><div className="signal-line"><span>INTERFACE</span><b>App SDK</b></div><div className="signal-line"><span>WORKFLOW</span><b>Structured data</b></div><div className="signal-line"><span>SYNC</span><b>Document events</b></div></div></div></div>
}

function EmptyState() { return <div className="empty-state"><div>✦</div><strong>The archive is quiet.</strong><span>Create an oddity to give the Content Lake something strange to remember.</span></div> }
