import {Suspense} from 'react'
import {useDocumentProjection, type DocumentHandle} from '@sanity/sdk-react'

const stageLabels: Record<string, string> = {new: 'New', investigating: 'Investigating', review: 'Needs review', verified: 'Verified', resolved: 'Resolved'}
const stageColors: Record<string, string> = {new: 'gray', investigating: 'amber', review: 'violet', verified: 'green', resolved: 'gray'}

export function IncidentCard({handle, search = '', stageFilter, compact = false, onSelect}: {handle: DocumentHandle; search?: string; stageFilter?: string; compact?: boolean; onSelect: (h: DocumentHandle) => void}) {
  return <Suspense fallback={<div className="card skeleton" />}><IncidentContent handle={handle} search={search} stageFilter={stageFilter} compact={compact} onSelect={onSelect} /></Suspense>
}

function IncidentContent({handle, search, stageFilter, compact, onSelect}: {handle: DocumentHandle; search: string; stageFilter?: string; compact: boolean; onSelect: (h: DocumentHandle) => void}) {
  const {data} = useDocumentProjection<{title?: string; incidentId?: string; summary?: string; severity?: string; workflowStage?: string; affectedServices?: string[]}>({...handle, projection: `{title, incidentId, summary, severity, workflowStage, affectedServices}`})
  const title = data?.title ?? 'Untitled incident'
  const stage = data?.workflowStage ?? 'new'
  const haystack = `${title} ${data?.incidentId ?? ''} ${data?.summary ?? ''} ${(data?.affectedServices ?? []).join(' ')}`.toLowerCase()
  if (stageFilter && stage !== stageFilter) return null
  if (search && !haystack.includes(search.toLowerCase())) return null
  const severity = data?.severity ?? 'medium'
  const meter = severity === 'critical' ? 100 : severity === 'high' ? 80 : severity === 'medium' ? 55 : 30
  return <button className={compact ? 'card compact' : 'card'} onClick={() => onSelect(handle)}>
    <div className="card-top"><span className={`dot ${stageColors[stage] ?? 'gray'}`} /> <span>{stageLabels[stage] ?? stage}</span><span className="featured">{severity.toUpperCase()}</span></div>
    <div className="weird-meter"><span style={{width: `${meter}%`}} /></div>
    <h3>{title}</h3>
    {!compact && <p>{data?.summary ?? 'No incident summary yet.'}</p>}
    <div className="card-foot"><span>{data?.incidentId ?? 'No incident ID'}</span><span>{(data?.affectedServices ?? []).slice(0, 2).join(' · ')}</span></div>
  </button>
}
