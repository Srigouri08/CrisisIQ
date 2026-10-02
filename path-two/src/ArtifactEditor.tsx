import {useEffect, useState} from 'react'
import {useApplyDocumentActions, useCurrentUser, useDocument, useEditDocument, useNavigateToStudioDocument, publishDocument, type DocumentHandle} from '@sanity/sdk-react'

export function ArtifactEditor({handle, onClose}: {handle: DocumentHandle; onClose: () => void}) {
  return <aside className="drawer"><EditorBody handle={handle} onClose={onClose} /></aside>
}

function EditorBody({handle, onClose}: {handle: DocumentHandle; onClose: () => void}) {
  const {data: doc} = useDocument<Record<string, any>>(handle)
  const currentUser = useCurrentUser()
  const editTitle = useEditDocument<string>({...handle, path: 'title'})
  const editSummary = useEditDocument<string>({...handle, path: 'summary'})
  const editStage = useEditDocument<string>({...handle, path: 'workflowStage'})
  const editDecision = useEditDocument<string>({...handle, path: 'reviewDecision'})
  const editReviewer = useEditDocument<string>({...handle, path: 'reviewer'})
  const editNotes = useEditDocument<string>({...handle, path: 'reviewNotes'})
  const editReviewedAt = useEditDocument<string>({...handle, path: 'reviewedAt'})
  const apply = useApplyDocumentActions()
  const {navigateToStudioDocument} = useNavigateToStudioDocument(handle)
  const [flash, setFlash] = useState('')

  useEffect(() => { setFlash('') }, [handle.documentId])

  if (!doc) return <div className="drawer-inner"><button className="close" onClick={onClose}>×</button><p>Loading incident…</p></div>
  const isDraft = typeof doc._id === 'string' && doc._id.startsWith('drafts.')
  const review = (decision: 'approved' | 'changes-requested' | 'rejected') => {
    editDecision(decision)
    editReviewer(currentUser?.name ?? currentUser?.id ?? 'Investigator')
    editReviewedAt(new Date().toISOString())
    editStage(decision === 'approved' ? 'verified' : decision === 'changes-requested' ? 'investigating' : 'resolved')
    setFlash(decision === 'approved' ? 'Case approved and marked verified.' : decision === 'changes-requested' ? 'Changes requested; case returned to investigation.' : 'Case rejected and marked resolved.')
  }
  const publish = () => { apply(publishDocument(handle)); setFlash('Published case to the Content Lake.') }

  return <div className="drawer-inner">
    <button className="close" onClick={onClose}>×</button>
    <div className="eyebrow">INVESTIGATION REVIEW</div>
    <div className="drawer-title"><h2>{doc.title ?? 'Incident case'}</h2><span className={`status ${doc.workflowStage}`}>{doc.workflowStage ?? 'new'}</span></div>
    <label>Incident title<input value={doc.title ?? ''} onChange={e => editTitle(e.target.value)} /></label>
    <label>Summary<textarea value={doc.summary ?? ''} onChange={e => editSummary(e.target.value)} /></label>
    <label>Workflow stage<select value={doc.workflowStage ?? 'new'} onChange={e => editStage(e.target.value)}><option value="new">New</option><option value="investigating">Investigating</option><option value="review">Needs review</option><option value="verified">Verified</option><option value="resolved">Resolved</option></select></label>
    <div className="review-panel">
      <div className="eyebrow">HUMAN REVIEW GATE</div>
      <p>Record a decision on the case. The decision, reviewer, notes, and timestamp are stored on the Sanity document.</p>
      <div className="review-actions">
        <button className="primary" onClick={() => review('approved')}>✓ Approve</button>
        <button className="secondary" onClick={() => review('changes-requested')}>↻ Request changes</button>
        <button className="danger" onClick={() => review('rejected')}>× Reject</button>
      </div>
    </div>
    <label>Review notes<textarea value={doc.reviewNotes ?? ''} onChange={e => editNotes(e.target.value)} placeholder="Explain the decision or what needs to change…" /></label>
    {doc.reviewDecision && <div className="metadata"><span>Decision</span><strong>{String(doc.reviewDecision).replace('-', ' ')}</strong><span>Reviewer</span><strong>{doc.reviewer ?? '—'}</strong></div>}
    <div className="actions"><button className="secondary" onClick={navigateToStudioDocument}>Open in Studio</button>{isDraft && <button className="primary" onClick={publish}>Publish case</button>}</div>
    {flash && <div className="flash">✓ {flash}</div>}
    <div className="metadata"><span>Document</span><code>{handle.documentId}</code></div>
  </div>
}
