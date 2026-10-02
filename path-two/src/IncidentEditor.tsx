import {useEffect, useState} from 'react'
import {useApplyDocumentActions, useCurrentUser, useDocument, useEditDocument, useNavigateToStudioDocument, type DocumentHandle} from '@sanity/sdk-react'

export function IncidentEditor({handle, onClose}: {handle: DocumentHandle; onClose: () => void}) {
  return <aside className="drawer"><EditorBody handle={handle} onClose={onClose} /></aside>
}

function EditorBody({handle, onClose}: {handle: DocumentHandle; onClose: () => void}) {
  const {data: doc} = useDocument<Record<string, any>>(handle)
  const currentUser = useCurrentUser()
  const apply = useApplyDocumentActions()
  const {navigateToStudioDocument} = useNavigateToStudioDocument(handle)
  const editTitle = useEditDocument<string>({...handle, path: 'title'})
  const editSummary = useEditDocument<string>({...handle, path: 'summary'})
  const editSeverity = useEditDocument<string>({...handle, path: 'severity'})
  const editStage = useEditDocument<string>({...handle, path: 'workflowStage'})
  const editNotes = useEditDocument<string>({...handle, path: 'reviewNotes'})
  const [flash, setFlash] = useState('')

  useEffect(() => setFlash(''), [handle.documentId])
  if (!doc) return <div className="drawer-inner"><button className="close" onClick={onClose}>×</button><p>Loading incident…</p></div>

  const reviewer = (currentUser as any)?.name ?? (currentUser as any)?.email ?? 'Investigator'
  const setReview = (decision: 'approved' | 'changes_requested' | 'rejected') => {
    const nextStage = decision === 'approved' ? 'verified' : decision === 'changes_requested' ? 'investigating' : 'resolved'
    editStage(nextStage)
    apply([{type: 'set', path: 'reviewDecision', value: decision}, {type: 'set', path: 'reviewer', value: reviewer}, {type: 'set', path: 'reviewedAt', value: new Date().toISOString()}] as any)
    setFlash(decision === 'approved' ? 'Incident verified.' : decision === 'changes_requested' ? 'Changes requested.' : 'Incident rejected.')
  }

  return <div className="drawer-inner">
    <button className="close" onClick={onClose}>×</button>
    <div className="eyebrow">INVESTIGATION DESK</div>
    <div className="drawer-title"><h2>{doc.title ?? 'Incident'}</h2><span className={`status ${doc.workflowStage}`}>{doc.workflowStage ?? 'new'}</span></div>
    <label>Incident title<input value={doc.title ?? ''} onChange={e => editTitle(e.target.value)} /></label>
    <label>Summary<textarea value={doc.summary ?? ''} onChange={e => editSummary(e.target.value)} /></label>
    <div className="two"><label>Severity<select value={doc.severity ?? 'medium'} onChange={e => editSeverity(e.target.value)}><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label><label>Workflow<select value={doc.workflowStage ?? 'new'} onChange={e => editStage(e.target.value)}><option value="new">New</option><option value="investigating">Investigating</option><option value="review">Needs review</option><option value="verified">Verified</option><option value="resolved">Resolved</option></select></label></div>
    <label>Reviewer notes<textarea value={doc.reviewNotes ?? ''} onChange={e => editNotes(e.target.value)} placeholder="Explain what should happen next…" /></label>
    <div className="actions"><button className="secondary" onClick={navigateToStudioDocument}>Open in Studio</button></div>
    <div className="review-actions"><button className="primary" onClick={() => setReview('approved')}>✓ Approve</button><button className="secondary" onClick={() => setReview('changes_requested')}>↻ Request changes</button><button className="danger" onClick={() => setReview('rejected')}>Reject</button></div>
    {doc.reviewDecision && <div className="flash">Decision: {doc.reviewDecision.replace('_', ' ')} · {doc.reviewer ?? 'Reviewer'}</div>}
    {flash && <div className="flash">✓ {flash}</div>}
    <div className="metadata"><span>Incident</span><code>{doc.incidentId ?? handle.documentId}</code></div>
  </div>
}
