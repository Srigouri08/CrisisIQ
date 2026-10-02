import {Suspense} from 'react'
import {useDocumentProjection, type DocumentHandle} from '@sanity/sdk-react'

const colors: Record<string,string> = {new: 'gray', investigating: 'amber', review: 'violet', verified: 'green', resolved: 'gray'}

export function ArtifactCard({handle, search = '', stageFilter, compact = false, onSelect}: {handle: DocumentHandle; search?: string; stageFilter?: string; compact?: boolean; onSelect: (h: DocumentHandle) => void}) {
  return <Suspense fallback={<div className="card skeleton" />}><ArtifactContent handle={handle} search={search} stageFilter={stageFilter} compact={compact} onSelect={onSelect} /></Suspense>
}

function ArtifactContent({handle, search, stageFilter, compact, onSelect}: {handle: DocumentHandle; search: string; stageFilter?: string; compact: boolean; onSelect: (h: DocumentHandle) => void}) {
  const {data} = useDocumentProjection<{title?: string; incidentId?: string; summary?: string; severity?: string; status?: string; workflowStage?: string; affectedServices?: string[]}>({...handle, projection: `{title, incidentId, summary, severity, status, workflowStage, affectedServices}`})
  const title = data?.title ?? 'Untitled incident'
  const stage = data?.workflowStage ?? 'new'
  const haystack = `${title} ${data?.incidentId ?? ''} ${data?.summary ?? ''} ${(data?.affectedServices ?? []).join(' ')}`.toLowerCase()
  if (stageFilter && stage !== stageFilter) return null
  if (search && !haystack.includes(search.toLowerCase())) return null
  const severity = data?.severity ?? 'medium'
  return (
    <button className={compact ? 'card compact' : 'card'} onClick={() => onSelect(handle)}>
      <div className="card-top"><span className={`dot ${colors[stage] ?? 'gray'}`} /> <span>{stage.replace('-', ' ')}</span><span className="featured">{severity.toUpperCase()}</span></div>
      <div className="weird-meter"><span style={{width: `${severity === 'critical' ? 100 : severity === 'high' ? 80 : severity === 'medium' ? 55 : 30}%`}} /></div>
      <h3>{title}</h3>
      {!compact && <p>{data?.summary ?? 'No incident summary yet.'}</p>}
      <div className="card-foot"><span>{data?.incidentId ?? 'No incident ID'}</span><span>{(data?.affectedServices ?? []).slice(0, 2).join(' · ')}</span></div>
    </button>
  )
}
