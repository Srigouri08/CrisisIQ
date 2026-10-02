import {useMemo, useState} from 'react'
import {useCurrentUser, useDocumentEvent, useDocuments, type DocumentHandle} from '@sanity/sdk-react'
import {ArtifactCard} from './ArtifactCard'
import {ArtifactEditor} from './ArtifactEditor'
import {CreateArtifact} from './CreateArtifact'

const tabs = ['command', 'investigate', 'activity'] as const
type Tab = typeof tabs[number]
const stages = ['inbox', 'researching', 'review', 'approved', 'archived'] as const
const stageLabels: Record<string, string> = {inbox: 'Intake', researching: 'Investigating', review: 'Human review', approved: 'Cleared', archived: 'Archived'}

export function ArchiveApp({accountEmail, onSignOut}: {accountEmail: string; onSignOut: () => void}) {
  const [tab, setTab] = useState<Tab>('command')
  const [selected, setSelected] = useState<DocumentHandle | null>(null)
  const [search, setSearch] = useState('')
  const [events, setEvents] = useState<{label: string; at: string}[]>([])
  const currentUser = useCurrentUser()

  useDocumentEvent({onEvent: event => {
    const label = event.type === 'remote-patches' ? 'Remote investigator updated a case' : `Document ${event.type}`
    setEvents(prev => [{label, at: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}, ...prev].slice(0, 10))
  }})

  const subtitle = useMemo(() => {
    if (tab === 'command') return 'A live investigation room for incidents that deserve more than a timeline.'
    if (tab === 'investigate') return 'Move a case from first signal to a human-reviewed conclusion.'
    return 'A real-time signal layer over the CrisisIQ Content Lake.'
  }, [tab])

  const displayName = currentUser?.name ?? accountEmail.split('@')[0] ?? 'Investigator'

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">CI</span><span>CRISISIQ</span><span className="brand-live"><i/>LIVE CONTENT LAKE</span></div>
        <div className="top-actions"><span className="workspace">INCIDENTS / PRIVATE WORKSPACE</span><div className="user-pill"><span className="avatar">{displayName.slice(0, 1).toUpperCase()}</span><span>{displayName}</span><button className="signout" onClick={onSignOut}>Sign out</button></div></div>
      </header>

      <aside className="sidebar">
        <div className="eyebrow">SANITY CONTENT APP · 02</div>
        <div className="side-title"><span>CRISIS</span><strong>IQ</strong></div>
        <p className="intro">A structured incident workspace where evidence becomes reviewable, competing claims stay visible, and every decision remains attached to the case.</p>
        <nav>{tabs.map(item => <button key={item} className={tab === item ? 'nav active' : 'nav'} onClick={() => setTab(item)}><span>{item === 'command' ? '◉' : item === 'investigate' ? '⌁' : '◌'}</span>{item === 'command' ? 'Command center' : item === 'investigate' ? 'Investigation' : 'Activity'}<b>{item === 'activity' ? events.length : ''}</b></button>)}</nav>
        <div className="side-stack"><div><span>CONTENT MODEL</span><strong>incident record</strong></div><div><span>WORKFLOW</span><strong>5 stages</strong></div><div><span>SYNC</span><strong className="green-text">REAL-TIME</strong></div></div>
        <div className="side-note"><strong>BUILT FOR PATH TWO</strong><br/>Custom App SDK interface + structured Sanity workflow + live document events.</div>
      </aside>

      <main className="main">
        <section className="hero"><div><div className="eyebrow">{tab.toUpperCase()} / {new Date().getFullYear()}</div><h1>{subtitle}</h1><p className="hero-sub">Signal → investigate → review → clear. Every transition is data.</p></div>{tab !== 'activity' && <CreateArtifact />}</section>
        {tab === 'command' && <Observatory search={search} setSearch={setSearch} onSelect={setSelected} />}
        {tab === 'investigate' && <Curator onSelect={setSelected} />}
        {tab === 'activity' && <Activity events={events} />}
      </main>
      {selected && <ArtifactEditor handle={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function Observatory({search, setSearch, onSelect}: {search: string; setSearch: (v: string) => void; onSelect: (h: DocumentHandle) => void}) {
  const {data: handles = []} = useDocuments({documentType: 'oddity', batchSize: 50, orderings: [{field: '_updatedAt', direction: 'desc'}]})
  const {data: taskHandles = []} = useDocuments({documentType: 'curationTask', batchSize: 50, orderings: [{field: '_updatedAt', direction: 'desc'}]})
  return <>
    <div className="metric-row"><Metric label="Open cases" value={handles.length} detail="structured records" icon="◉" /><Metric label="Review queue" value={taskHandles.length} detail="modeled tasks" icon="◎" /><Metric label="Workflow" value="5" detail="decision stages" icon="↗" /><Metric label="Lake" value="LIVE" detail="real-time sync" icon="●" green /></div>
    <div className="toolbar"><div className="search"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search case title, signal, or tag…" /></div><span className="count">{handles.length} cases</span></div>
    <div className="section-line"><span>RECENT CASE SIGNALS</span><span>CONTENT LAKE / INCIDENT RECORDS</span></div>
    <div className="grid">{handles.map(handle => <ArtifactCard key={handle.documentId} handle={handle} search={search} onSelect={onSelect} />)}</div>
    {handles.length === 0 && <EmptyState />}
  </>
}

function Metric({label, value, detail, icon, green}: {label: string; value: string | number; detail: string; icon: string; green?: boolean}) {
  return <div className="metric"><span className={green ? 'metric-icon green' : 'metric-icon'}>{icon}</span><div><div className="metric-label">{label}</div><strong>{value}</strong><small>{detail}</small></div></div>
}

function Curator({onSelect}: {onSelect: (h: DocumentHandle) => void}) {
  const {data: handles = []} = useDocuments({documentType: 'oddity', batchSize: 50, orderings: [{field: '_updatedAt', direction: 'desc'}]})
  const [focus, setFocus] = useState<string>('all')
  const displayed = focus === 'all' ? stages : stages.filter(stage => stage === focus)
  return <>
    <div className="workflow-header"><div><div className="eyebrow">CASE CONTROL ROOM</div><h2>Move evidence, not just cards.</h2></div><div className="filter-pills">{['all', ...stages].map(item => <button key={item} className={focus === item ? 'filter active' : 'filter'} onClick={() => setFocus(item)}>{item === 'all' ? 'all' : stageLabels[item]}</button>)}</div></div>
    <div className={`board ${focus !== 'all' ? 'board-focus' : ''}`}>
      {displayed.map(stage => <div className="lane" key={stage}><div className="lane-head"><div><span className="lane-index">0{stages.indexOf(stage) + 1}</span><span>{stageLabels[stage]}</span></div><b>LIVE</b></div>{handles.map(handle => <ArtifactCard key={handle.documentId + stage} handle={handle} stageFilter={stage} compact onSelect={onSelect} />)}</div>)}
    </div>
  </>
}

function Activity({events}: {events: {label: string; at: string}[]}) {
  return <div className="activity-wrap"><div className="activity-hero"><div><div className="eyebrow">EVENT STREAM</div><h2>Content Lake signals</h2><p>Changes made in Studio or the custom app surface here without a page refresh.</p></div><div className="live-orb"><span/>LIVE</div></div><div className="activity-grid"><div className="activity"><div className="signal">● LISTENING TO SANITY</div>{events.length === 0 ? <div className="empty-event"><strong>Nothing moved yet.</strong><span>Edit, publish, or move a case through the workflow to create a signal.</span></div> : events.map((event, i) => <div className="event" key={`${event.label}-${i}`}><span>{event.at}</span><div><b>{event.label}</b><small>Content Lake event · {i === 0 ? 'just now' : 'recent'}</small></div></div>)}</div><div className="signal-card"><div className="eyebrow">ARCHITECTURE</div><div className="signal-line"><span>CONTENT</span><b>Sanity</b></div><div className="signal-line"><span>INTERFACE</span><b>App SDK</b></div><div className="signal-line"><span>WORKFLOW</span><b>Structured data</b></div><div className="signal-line"><span>SYNC</span><b>Document events</b></div></div></div></div>
}

function EmptyState() { return <div className="empty-state"><div>CI</div><strong>No cases yet.</strong><span>Create an incident record to give the Content Lake something to investigate.</span></div> }
