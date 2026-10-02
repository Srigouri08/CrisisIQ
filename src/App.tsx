import { useRef, useState, type FormEvent } from 'react'
import {
  Activity, ArrowDown, ArrowUpRight, AudioLines, Bell, Check, ChevronDown, CircleHelp, Clock3, Command,
  FileClock, FileSearch, Filter, Globe2, Layers3, LogOut, Menu, MessageSquareText, Plus, Search, Send,
  ShieldAlert, Sparkles, UserRound, X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { demoCase } from './data/demoCase'
import { streamInvestigation, type ChatTurn } from './services/investigationProvider'
import type { EvidenceSource } from './types/investigation'
import './App.css'

type ChatMessage = { id: string; role: 'assistant' | 'user'; text: string; citations?: string[]; isError?: boolean }
const kindLabels: Record<EvidenceSource['kind'], string> = { change: 'Change record', telemetry: 'Telemetry', comms: 'Incident note', support: 'Support report' }

function App() {
  const [activeNav, setActiveNav] = useState('Overview')
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceSource | null>(null)
  const [selectedTimeline, setSelectedTimeline] = useState(1)
  const [showAllEvidence, setShowAllEvidence] = useState(false)
  const [question, setQuestion] = useState('')
  const [busy, setBusy] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', text: 'Ask a question about your Sanity content. I will retrieve relevant records through the CrisisIQ Investigation MCP before answering.' },
  ])
  const questionRef = useRef<HTMLTextAreaElement>(null)
  const visibleEvidence = demoCase.evidence.filter((item) => !searchQuery.trim() || `${item.title} ${item.source} ${item.excerpt}`.toLowerCase().includes(searchQuery.trim().toLowerCase()))
  const evidenceToShow = showAllEvidence ? visibleEvidence : visibleEvidence.slice(0, 6)

  const jumpToChat = (prompt?: string) => {
    setQuestion(prompt ?? '')
    questionRef.current?.focus()
    document.getElementById('investigation-chat')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  const openEvidenceById = (id: string) => {
    const evidence = demoCase.evidence.find((item) => item.id === id)
    if (evidence) setSelectedEvidence(evidence)
  }
  const submitQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const submittedQuestion = question.trim()
    if (!submittedQuestion || busy) return
    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: 'user', text: submittedQuestion }
    const assistantMessage: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', text: '' }
    const conversation: ChatTurn[] = [
      ...messages.filter((message) => message.text).map(({ role, text }) => ({ role, content: text })),
      { role: 'user', content: submittedQuestion },
    ]
    setMessages((current) => [...current, userMessage, assistantMessage])
    setQuestion('')
    setBusy(true)
    try {
      await streamInvestigation(conversation, (text) => {
        setMessages((current) => current.map((message) => message.id === assistantMessage.id ? { ...message, text: message.text + text } : message))
      })
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'The live investigation request failed.'
      setMessages((current) => current.map((message) => message.id === assistantMessage.id ? { ...message, text: detail, isError: true } : message))
    } finally {
      setBusy(false)
    }
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileSidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="brand-row"><div className="brand-mark"><Activity size={19} strokeWidth={2.5} /></div><span className="brand-name">crisis<span>iq</span></span><button className="icon-button sidebar-close" onClick={() => setMobileSidebarOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <button className="workspace-switcher"><span className="workspace-avatar">N</span><span className="workspace-copy"><strong>Northstar team</strong><small>Investigation workspace</small></span><ChevronDown size={15} /></button>
      <div className="nav-group-label">WORKSPACE <span>⌘ 1</span></div>
      <nav className="primary-nav" aria-label="Workspace">
        <button className={`nav-item ${activeNav === 'Overview' ? 'nav-active' : ''}`} onClick={() => setActiveNav('Overview')}><Layers3 size={17} /><span>Overview</span><span className="nav-count">1</span></button>
        <button className={`nav-item ${activeNav === 'Timeline' ? 'nav-active' : ''}`} onClick={() => { setActiveNav('Timeline'); document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' }) }}><FileClock size={17} /><span>Timeline</span></button>
        <button className={`nav-item ${activeNav === 'Evidence' ? 'nav-active' : ''}`} onClick={() => { setActiveNav('Evidence'); document.getElementById('evidence')?.scrollIntoView({ behavior: 'smooth' }) }}><FileSearch size={17} /><span>Evidence</span><span className="nav-count">06</span></button>
      </nav>
      <div className="cases-heading"><div className="nav-group-label">CASES <span>01</span></div><button className="icon-button tiny" aria-label="New investigation" title="Start another investigation" onClick={() => jumpToChat('I want to investigate a different incident: ')}><Plus size={15} /></button></div>
      <div className="case-list"><button className="case-item case-selected" onClick={() => setActiveNav('Overview')}><span className="case-indicator"><span /></span><span className="case-item-copy"><strong>PulsePay · Case #001</strong><small>{demoCase.title}</small></span><span className="case-unread" /></button></div>
      <div className="sidebar-note"><div className="sidebar-note-icon"><Globe2 size={15} /></div><strong>Built for every incident</strong><p>PulsePay is the first fictional case. CrisisIQ is designed for reliability, security, operations, and customer-impact investigations.</p><div className="incident-tags"><span>Reliability</span><span>Security</span><span>Operations</span></div></div>
      <div className="sidebar-bottom"><button className="nav-item muted-nav"><CircleHelp size={17} /><span>Help center</span><ArrowUpRight size={13} /></button><div className="user-profile"><div className="user-avatar" aria-hidden="true"><UserRound size={15} strokeWidth={2} /></div><div><strong>Jordan Davis</strong><small>Incident analyst</small></div><button className={`icon-button tiny profile-toggle ${profileOpen ? 'profile-open' : ''}`} aria-label="Profile options" aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)}><ChevronDown size={15} /></button>{profileOpen && <div className="profile-menu"><div className="profile-menu-heading"><UserRound size={14} /><span>Account</span></div><button className="profile-signout" type="button" onClick={() => setProfileOpen(false)}><LogOut size={14} /><span>Sign out</span></button></div>}</div></div>
    </aside>
    {mobileSidebarOpen && <button className="sidebar-backdrop" aria-label="Close navigation" onClick={() => setMobileSidebarOpen(false)} />}

    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileSidebarOpen(true)}><Menu size={19} /></button><span>Cases</span><span className="crumb-slash">/</span><strong>{demoCase.organization}</strong><span className="case-id">CASE #001</span></div><div className="topbar-actions"><span className="demo-pill"><span /> FICTIONAL CASE</span><button className="icon-button top-action" aria-label="Search evidence" title="Search evidence" onClick={() => { setSearchOpen((open) => !open); document.getElementById('evidence')?.scrollIntoView({ behavior: 'smooth' }) }}><Search size={17} /></button><button className="icon-button top-action notification-button" aria-label="Notifications"><Bell size={17} /><i /></button><div className="top-avatar" aria-label="Jordan Davis"><UserRound size={14} strokeWidth={2} /></div></div></header>
      <div className="page-content">
        <section className="case-heading"><div className="case-title-block"><div className="eyebrow"><span className="eyebrow-line" /> INCIDENT INVESTIGATION <span className="eyebrow-index">01 / 01</span></div><div className="title-row"><h1>{demoCase.organization} <span>—</span> {demoCase.title}</h1><span className="status-pill"><span />{demoCase.status}</span></div><p className="case-summary">{demoCase.summary}</p></div><button className="outline-button share-button" onClick={() => jumpToChat()}><MessageSquareText size={15} /> Ask CrisisIQ</button></section>
        <section className="metrics-strip" aria-label="Incident summary"><div className="metric-item"><span className="metric-icon metric-red"><ShieldAlert size={16} /></span><div><small>INCIDENT WINDOW</small><strong>{demoCase.startedAt} <span>—</span> {demoCase.endedAt}</strong></div></div><div className="metric-item"><span className="metric-icon metric-amber"><Clock3 size={16} /></span><div><small>DEPLOYMENT TO RECOVERY</small><strong>{demoCase.duration}</strong></div></div><div className="metric-item impact-metric"><span className="metric-icon metric-teal"><Activity size={16} /></span><div><small>CUSTOMER / PAYMENT IMPACT</small><strong>{demoCase.impactDuration} · {demoCase.impactStartedAt}–{demoCase.endedAt}</strong></div></div><div className="metric-updated"><span className="live-dot" /> Fictional case record</div></section>
        <nav className="investigation-flow" aria-label="Investigation workflow">
          <a href="#evidence"><span>01</span><strong>Evidence</strong><small>Fragmented source material</small><ArrowUpRight size={12} /></a>
          <a href="#timeline"><span>02</span><strong>Timeline</strong><small>Reconstructed sequence</small><ArrowUpRight size={12} /></a>
          <a href="#contradictions"><span>03</span><strong>Contradictions</strong><small>Conflicting source claims</small><ArrowUpRight size={12} /></a>
          <a href="#findings"><span>04</span><strong>Findings</strong><small>Evidence + uncertainty</small><ArrowUpRight size={12} /></a>
          <a href="#investigation-chat"><span>05</span><strong>AI Investigation</strong><small>Live Sanity Context MCP</small><ArrowUpRight size={12} /></a>
        </nav>
        <div className="content-grid">
          <div className="investigation-column">
            <section className="panel timeline-panel" id="timeline"><div className="section-heading"><div><div className="section-kicker">SEQUENCE OF EVENTS</div><h2>Incident timeline</h2></div><button className="quiet-action" onClick={() => setSelectedTimeline((selectedTimeline + 1) % demoCase.timeline.length)}><Filter size={14} /> Explore <ArrowDown size={13} /></button></div><div className="timeline-track" aria-label="Select an incident timeline event"><div className="timeline-rail"><span /></div>{demoCase.timeline.map((event, index) => <button className={`timeline-event event-${event.tone} ${selectedTimeline === index ? 'timeline-selected' : ''}`} key={event.time} onClick={() => setSelectedTimeline(index)} aria-pressed={selectedTimeline === index}><span className="event-node"><span /></span><span className="event-time">{event.time}</span><strong>{event.title}</strong><small>{event.detail}</small></button>)}</div><div className="timeline-detail"><span className={`detail-marker detail-${demoCase.timeline[selectedTimeline].tone}`} /><span><strong>{demoCase.timeline[selectedTimeline].time} UTC</strong> {demoCase.timeline[selectedTimeline].detail}</span><button onClick={() => openEvidenceById(['ev-098', 'ev-104', 'ev-111', 'ev-124', 'ev-126'][selectedTimeline])}>Related record <ArrowUpRight size={13} /></button></div></section>
            <section className="panel findings-panel" id="findings"><div className="section-heading"><div><div className="section-kicker">PROVISIONAL ANALYSIS</div><h2>Findings <span className="count-badge">{demoCase.findings.length}</span></h2></div><span className="working-label"><span /> WORKING NOTES</span></div><div className="finding-list">{demoCase.findings.map((finding, index) => <article className="finding-row" key={finding.id}><span className="finding-index">0{index + 1}</span><div className="finding-copy"><h3>{finding.title}</h3><p>{finding.detail}</p><div className="finding-citations">{finding.evidenceIds.map((id) => <button key={id} onClick={() => openEvidenceById(id)}>{id.toUpperCase()} <ArrowUpRight size={11} /></button>)}</div></div><span className={`confidence confidence-${finding.confidence}`}><i />{finding.confidence} confidence</span></article>)}</div><div className="provisional-footnote"><Sparkles size={14} /><span>Findings are provisional observations, not a confirmed root cause.</span></div></section>
            <section className="panel contradictions-panel" id="contradictions"><div className="section-heading"><div><div className="section-kicker">COMPETING EVIDENCE</div><h2>Contradictions <span className="count-badge count-warm">{demoCase.contradictions.length}</span></h2></div><span className="unresolved-label">OPEN TO INTERPRETATION</span></div><div className="contradiction-list">{demoCase.contradictions.map((item) => <article className="comparison-card" key={item.id}><div className="comparison-title"><span className="contradiction-mark">!</span><h3>{item.title}</h3></div><div className="comparison-claim"><span className="comparison-label">CONFLICTING CLAIM</span><p>{item.claim}</p></div><div className="comparison-columns"><div className="comparison-side supports-side"><span className="comparison-label">SUPPORTING SOURCE</span>{item.supportingEvidenceIds.map((id) => { const source = demoCase.evidence.find((entry) => entry.id === id); return source ? <button className="comparison-source" key={id} onClick={() => openEvidenceById(id)}><span>{source.category} · {source.time}</span><strong>{source.title}</strong><small>{source.excerpt}</small></button> : null })}</div><div className="comparison-side opposing-side"><span className="comparison-label">OPPOSING EVIDENCE</span>{item.opposingEvidenceIds.map((id) => { const source = demoCase.evidence.find((entry) => entry.id === id); return source ? <button className="comparison-source" key={id} onClick={() => openEvidenceById(id)}><span>{source.category} · {source.time}</span><strong>{source.title}</strong><small>{source.excerpt}</small></button> : null })}</div></div><div className="why-matters"><strong>Why this matters</strong><p>{item.whyItMatters}</p></div></article>)}</div></section>
          </div>
          <aside className="right-column">
            <section className="panel evidence-panel" id="evidence"><div className="section-heading evidence-heading"><div><div className="section-kicker">SOURCE RECORDS</div><h2>Evidence <span className="count-badge">{visibleEvidence.length.toString().padStart(2, '0')}</span></h2></div><button className="icon-button tiny filter-button" aria-label="Filter evidence" title="Filter evidence" onClick={() => setSearchOpen((open) => !open)}><Filter size={15} /></button></div>{searchOpen && <div className="evidence-search"><Search size={14} /><input aria-label="Filter evidence" placeholder="Filter source records..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /><button className="icon-button tiny" aria-label="Clear evidence filter" onClick={() => { setSearchQuery(''); setSearchOpen(false) }}><X size={13} /></button></div>}<div className="evidence-list">{evidenceToShow.map((item) => <button className="evidence-item" key={item.id} onClick={() => setSelectedEvidence(item)}><span className={`source-glyph glyph-${item.kind}`}>{item.kind === 'change' ? <Command size={15} /> : item.kind === 'comms' ? <MessageSquareText size={15} /> : item.kind === 'support' ? <AudioLines size={15} /> : <Activity size={15} />}</span><span className="evidence-copy"><span className="evidence-category">{item.category}</span><strong>{item.title}</strong><small>{item.source}</small><span className="evidence-meta"><span>{item.id.toUpperCase()}</span><i />{item.time}</span></span><ArrowUpRight className="evidence-open" size={14} /></button>)}{visibleEvidence.length === 0 && <div className="empty-evidence">No records match “{searchQuery}”.</div>}</div>{visibleEvidence.length > 6 && <button className="view-all-button" onClick={() => setShowAllEvidence((all) => !all)}>{showAllEvidence ? 'Show fewer records' : `View all ${visibleEvidence.length} records`}<ArrowUpRight size={13} /></button>}<div className="evidence-source-note"><span className="source-lock"><Check size={11} /></span> Fictional Case #001 sources <span>·</span> Chat retrieves live Sanity context</div></section>
            <section className="chat-panel" id="investigation-chat">
              <div className="chat-flow-label">05 · AI INVESTIGATION <span>Ask CrisisIQ about this case using live Sanity Context MCP retrieval.</span></div>
              <div className="chat-heading">
                <div className="ai-avatar"><Sparkles size={16} /></div>
                <div><strong>CrisisIQ Investigation Agent</strong><small>Evidence-grounded case analysis</small></div>
                <span className="demo-tag">LIVE MCP</span>
              </div>
              <div className="chat-messages" aria-live="polite">
                {messages.map((message) => <div className={`chat-message ${message.role === 'user' ? 'chat-user' : 'chat-assistant'}`} key={message.id}>
                  {message.role === 'assistant' && <span className="message-avatar"><Sparkles size={12} /></span>}
                  <div className="message-body">
                    {message.role === 'assistant'
                      ? <div className="message-markdown"><ReactMarkdown>{message.text}</ReactMarkdown></div>
                      : <p>{message.text}</p>}
                    {message.citations && <div className="message-citations">{message.citations.map((id) => <button key={id} onClick={() => openEvidenceById(id)}>{id.toUpperCase()}</button>)}</div>}
                    {message.isError && <small className="demo-disclaimer">No answer was generated. Please retry when the model is available.</small>}
                  </div>
                </div>)}
                {busy && <div className="typing-indicator"><span /><span /><span /> Retrieving Sanity context…</div>}
              </div>
              <div className="suggested-questions"><span>TRY ASKING</span><button onClick={() => jumpToChat('What is the strongest evidence in the Sanity content?')}>Strongest evidence?</button><button onClick={() => jumpToChat('What evidence is still missing?')}>What is missing?</button></div>
              <form className="chat-composer" onSubmit={submitQuestion}>
                <textarea ref={questionRef} value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} placeholder="Ask about your Sanity content..." rows={2} aria-label="Ask an investigation question" />
                <div className="composer-footer"><span><kbd>↵</kbd> to send <span className="composer-dot">·</span> <kbd>⇧ ↵</kbd> new line</span><button className="send-button" type="submit" disabled={!question.trim() || busy} aria-label="Send question">{busy ? <span className="send-spinner" /> : <Send size={15} />}</button></div>
              </form>
              <div className="chat-footnote"><span className="sparkle-mini"><Sparkles size={11} /></span> Answers use retrieved Sanity content, not the demo case records.</div>
            </section>
          </aside>
        </div>
        <footer className="page-footer"><span>CRISISIQ <i>·</i> INCIDENT INTELLIGENCE</span><span>CASE #001 <i>·</i> FICTIONAL REFERENCE <i>·</i> 2026</span></footer>
      </div>
    </main>

    {selectedEvidence && <div className="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSelectedEvidence(null) }}><section className="evidence-modal" role="dialog" aria-modal="true" aria-labelledby="evidence-modal-title"><div className="modal-topline"><span className="section-kicker">SOURCE RECORD · {selectedEvidence.id.toUpperCase()}</span><button className="icon-button" aria-label="Close evidence detail" onClick={() => setSelectedEvidence(null)}><X size={18} /></button></div><span className={`source-glyph modal-glyph glyph-${selectedEvidence.kind}`}><FileSearch size={17} /></span><div className="modal-source">{selectedEvidence.source} <span>·</span> {selectedEvidence.time}</div><h2 id="evidence-modal-title">{selectedEvidence.title}</h2><blockquote>{selectedEvidence.excerpt}</blockquote><div className="evidence-caveat"><ShieldAlert size={15} /><p>{selectedEvidence.note}</p></div><div className="modal-kind">{kindLabels[selectedEvidence.kind]} <span>·</span> Fictional Case #001 record</div></section></div>}
  </div>
}

export default App
