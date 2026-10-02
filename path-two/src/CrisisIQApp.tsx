import {useMemo, useState} from 'react'
import {useCurrentUser, useDocumentEvent, useDocuments, type DocumentHandle} from '@sanity/sdk-react'
import {IncidentCard} from './IncidentCard'
import {IncidentEditor} from './IncidentEditor'
import {CreateIncident} from './CreateIncident'

const tabs = ['cases', 'review', 'activity'] as const
type Tab = typeof tabs[number]

export function CrisisIQApp() {
  const [tab, setTab] = useState<Tab>('cases')
  const [selected, setSelected] = useState<DocumentHandle | null>(null)
  const [search, setSearch] = useState('')
  const [events, setEvents] = useState<string[]>([])
  const currentUser = useCurrentUser()

  useDocumentEvent({onEvent: event => {
    const label = event.type === 'remote-patches' ? 'A remote investigator changed an incident' : `You ${event.type} an incident`
    setEvents(prev => [label, ...prev].slice(0, 8))
  }})

  const subtitle = useMemo(() => {
    if (tab === 'cases') return 'A live investigation desk powered by structured Sanity content.'
    if (tab === 'review') return 'Review evidence, findings, and incidents moving through the investigation workflow.'
    return 'Real-time signals from the Sanity Content Lake.'
  }, [tab])

  return <div className="shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">CI</span><span>CRISISIQ</span></div><div className="user-pill">{currentUser?.name ?? 'Investigator'} <span>●</span></div></header>
    <aside className="sidebar"><div className="eyebrow">SANITY CONTENT APP</div><h1>Investigate.<br/><em>With evidence.</em></h1><p className="intro">A fit-for-purpose investigation desk for collecting evidence, comparing findings, and moving incidents through review.</p><nav>{tabs.map(item => <button key={item} className={tab === item ? 'nav active' : 'nav'} onClick={() => setTab(item)}><span>{item === 'cases' ? '◉' : item === 'review' ? '✓' : '◌'}</span>{item}</button>)}</nav><div className="side-note"><strong>LIVE CONTENT LAKE</strong><br/>Changes made in Sanity Studio appear here without a refresh.</div></aside>
    <main className="main"><section className="hero"><div><div className="eyebrow">{tab.toUpperCase()}</div><h2>{subtitle}</h2></div>{tab === 'cases' && <CreateIncident />}</section>{tab === 'cases' && <Observatory search={search} setSearch={setSearch} onSelect={setSelected} />}{tab === 'review' && <ReviewBoard onSelect={setSelected} />}{tab === 'activity' && <Activity events={events} />}</main>
    {selected && <IncidentEditor handle={selected} onClose={() => setSelected(null)} />}
  </div>
}

function Observatory({search, setSearch, onSelect}: {search: string; setSearch: (v: string) => void; onSelect: (h: DocumentHandle) => void}) {
  const {data: handles = []} = useDocuments({documentType: 'incidentCase', batchSize: 30, orderings: [{field: '_updatedAt', direction: 'desc'}]})
  return <><div className="toolbar"><div className="search"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search incident cases…" /></div><span className="count">{handles.length} cases</span></div><div className="grid">{handles.map(handle => <IncidentCard key={handle.documentId} handle={handle} search={search} onSelect={onSelect} />)}</div></>
}

function ReviewBoard({onSelect}: {onSelect: (h: DocumentHandle) => void}) {
  const {data: handles = []} = useDocuments({documentType: 'incidentCase', batchSize: 30, orderings: [{field: '_updatedAt', direction: 'desc'}]})
  const stages = ['new', 'investigating', 'review', 'verified', 'resolved']
  return <div className="board">{stages.map(stage => <div className="lane" key={stage}><div className="lane-head"><span>{stage === 'review' ? 'Needs review' : stage}</span><b>{handles.filter(() => true).length}</b></div>{handles.map(handle => <IncidentCard key={handle.documentId + stage} handle={handle} stageFilter={stage} compact onSelect={onSelect} />)}</div>)}</div>
}

function Activity({events}: {events: string[]}) {
  return <div className="activity"><div className="signal">● LIVE</div><h3>Content Lake signals</h3>{events.length === 0 ? <p>Make an edit or publish an incident case in Sanity Studio. CrisisIQ will notice.</p> : events.map((event, i) => <div className="event" key={`${event}-${i}`}><span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>{event}</div>)}</div>
}
