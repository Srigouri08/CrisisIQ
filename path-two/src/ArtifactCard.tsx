import {Suspense} from 'react'
import {useDocumentProjection, type DocumentHandle} from '@sanity/sdk-react'

const colors: Record<string,string> = {inbox: 'gray', researching: 'amber', review: 'violet', approved: 'green', archived: 'gray'}
const stageLabels: Record<string,string> = {inbox: 'Intake', researching: 'Investigating', review: 'Human review', approved: 'Cleared', archived: 'Archived'}

export function ArtifactCard({handle, search = '', stageFilter, compact = false, onSelect}: {handle: DocumentHandle; search?: string; stageFilter?: string; compact?: boolean; onSelect: (h: DocumentHandle) => void}) {
  return <Suspense fallback={<div className="card skeleton" />}><ArtifactContent handle={handle} search={search} stageFilter={stageFilter} compact={compact} onSelect={onSelect} /></Suspense>
}

function ArtifactContent({handle, search, stageFilter, compact, onSelect}: {handle: DocumentHandle; search: string; stageFilter?: string; compact: boolean; onSelect: (h: DocumentHandle) => void}) {
  const {data} = useDocumentProjection<{title?: string; hook?: string; weirdness?: number; stage?: string; tags?: string[]; featured?: boolean}>({...handle, projection: `{title, hook, weirdness, stage, tags, featured}`})
  const title = data?.title ?? 'Untitled incident'
  const haystack = `${title} ${data?.hook ?? ''} ${(data?.tags ?? []).join(' ')}`.toLowerCase()
  if (stageFilter && data?.stage !== stageFilter) return null
  if (search && !haystack.includes(search.toLowerCase())) return null
  const score = Math.round(data?.weirdness ?? 0)
  return (
    <button className={compact ? 'card compact' : 'card'} onClick={() => onSelect(handle)}>
      <div className="card-top"><span className={`dot ${colors[data?.stage ?? 'inbox']}`} /> <span>{stageLabels[data?.stage ?? 'inbox'] ?? 'Intake'}</span>{data?.featured && <span className="featured">PRIORITY</span>}</div>
      <div className="weird-meter"><span style={{width: `${score}%`}} /></div>
      <h3>{title}</h3>
      {!compact && <p>{data?.hook ?? 'No signal summary yet.'}</p>}
      <div className="card-foot"><span>{score}/100 signal</span><span>{(data?.tags ?? []).slice(0, 2).join(' · ')}</span></div>
    </button>
  )
}
