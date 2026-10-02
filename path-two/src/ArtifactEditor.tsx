import {useMemo, useState} from 'react'
import {useApplyDocumentActions, useCurrentUser, useDocument, useDocuments, useEditDocument, useNavigateToStudioDocument, publishDocument, createDocument, createDocumentHandle, type DocumentHandle} from '@sanity/sdk-react'

type Evidence = {label?: string; detail?: string; sourceUrl?: string}
type Contradiction = {claimA?: string; sourceA?: string; claimB?: string; sourceB?: string; note?: string}

const stages = ['inbox', 'researching', 'review', 'approved', 'archived'] as const
const stageLabels: Record<string, string> = {inbox: 'Inbox', researching: 'Researching', review: 'Needs review', approved: 'Exhibit ready', archived: 'Archived'}

export function ArtifactEditor({handle, onClose}: {handle: DocumentHandle; onClose: () => void}) { return <aside className="drawer"><EditorBody handle={handle} onClose={onClose} /></aside> }

function EditorBody({handle, onClose}: {handle: DocumentHandle; onClose: () => void}) {
  const {data: doc} = useDocument<Record<string, any>>(handle)
  const currentUser = useCurrentUser()
  const editTitle = useEditDocument<string>({...handle, path: 'title'})
  const editHook = useEditDocument<string>({...handle, path: 'hook'})
  const editStory = useEditDocument<string>({...handle, path: 'story'})
  const editStage = useEditDocument<string>({...handle, path: 'stage'})
  const editWeirdness = useEditDocument<number>({...handle, path: 'weirdness'})
  const editNotes = useEditDocument<string>({...handle, path: 'curatorNotes'})
  const editEvidence = useEditDocument<Evidence[]>({...handle, path: 'evidence'})
  const editContradictions = useEditDocument<Contradiction[]>({...handle, path: 'contradictions'})
  const editSource = useEditDocument<string>({...handle, path: 'sourceUrl'})
  const apply = useApplyDocumentActions()
  const {navigateToStudioDocument} = useNavigateToStudioDocument(handle)
  const {data: taskHandles = []} = useDocuments({documentType: 'curationTask', filter: 'oddity._ref == $oddityId', params: {oddityId: handle.documentId}, batchSize: 5, orderings: [{field: '_updatedAt', direction: 'desc'}]})
  const taskHandle = taskHandles[0] ?? {documentId: '__no_task__', documentType: 'curationTask'}
  const editTaskStatus = useEditDocument<string>({...taskHandle, path: 'status'})
  const editTaskDecision = useEditDocument<string>({...taskHandle, path: 'decision'})
  const editTaskNotes = useEditDocument<string>({...taskHandle, path: 'decisionNotes'})
  const editTaskReviewer = useEditDocument<string>({...taskHandle, path: 'reviewer'})
  const [flash, setFlash] = useState('')
  const [error, setError] = useState('')

  const evidence: Evidence[] = doc?.evidence ?? []
  const contradictions: Contradiction[] = doc?.contradictions ?? []
  const currentStage = doc?.stage ?? 'inbox'
  const nextStage = useMemo(() => { const index = stages.indexOf(currentStage as typeof stages[number]); return index >= 0 && index < stages.length - 1 ? stages[index + 1] : null }, [currentStage])

  if (!doc) return <div className="drawer-inner"><button className="close" onClick={onClose}>×</button><p>Loading exhibit…</p></div>
  const isDraft = typeof doc._id === 'string' && doc._id.startsWith('drafts.')
  const publish = () => { apply(publishDocument(handle)); setFlash('Published to the exhibit.') }

  const advance = () => {
    setError('')
    if (!nextStage) return
    if (nextStage === 'review' && (doc.story ?? '').trim().length < 40) { setError('Add a fuller story before sending this exhibit to review.'); return }
    if (nextStage === 'approved' && (evidence.length === 0 || (doc.curatorNotes ?? '').trim().length < 10)) { setError('Exhibit ready requires evidence and curator notes. Use the human review gate before approval.'); return }
    editStage(nextStage)
    if (nextStage === 'review' && taskHandles.length === 0) {
      const newTask = createDocumentHandle({documentId: crypto.randomUUID(), documentType: 'curationTask'})
      apply(createDocument(newTask, {title: `Review: ${doc.title ?? 'Untitled exhibit'}`, oddity: {_type: 'reference', _ref: handle.documentId}, status: 'open', priority: 'normal', reviewer: '', decision: '', decisionNotes: ''}))
      setFlash('Moved to review and created a curation task in Sanity.')
    } else setFlash(`Moved to ${stageLabels[nextStage]}.`)
  }

  const decide = (decision: 'approve' | 'request_changes' | 'reject') => {
    setError('')
    if (taskHandles.length === 0) { setError('No curation task is linked to this exhibit yet. Move it to review first.'); return }
    if (!(doc.curatorNotes ?? '').trim() && decision !== 'request_changes') { setError('Add curator notes so the decision has an editorial rationale.'); return }
    editTaskReviewer(currentUser?.name ?? currentUser?.email ?? 'Sanity curator')
    editTaskDecision(decision)
    editTaskNotes(doc.curatorNotes ?? '')
    editTaskStatus(decision === 'approve' ? 'approved' : decision === 'request_changes' ? 'changes' : 'blocked')
    if (decision === 'approve') { editStage('approved'); setFlash('Approved. The exhibit is now ready for publication.') }
    if (decision === 'request_changes') { editStage('researching'); setFlash('Changes requested. The exhibit returned to Researching.') }
    if (decision === 'reject') { editStage('archived'); setFlash('Rejected. The exhibit is archived and the task is blocked.') }
  }

  const updateEvidence = (index: number, patch: Partial<Evidence>) => editEvidence(evidence.map((item, i) => i === index ? {...item, ...patch} : item))
  const addEvidence = () => editEvidence([...evidence, {label: '', detail: '', sourceUrl: ''}])
  const removeEvidence = (index: number) => editEvidence(evidence.filter((_, i) => i !== index))
  const updateContradiction = (index: number, patch: Partial<Contradiction>) => editContradictions(contradictions.map((item, i) => i === index ? {...item, ...patch} : item))
  const addContradiction = () => editContradictions([...contradictions, {claimA: '', sourceA: '', claimB: '', sourceB: '', note: ''}])
  const removeContradiction = (index: number) => editContradictions(contradictions.filter((_, i) => i !== index))

  return <div className="drawer-inner">
    <button className="close" onClick={onClose}>×</button>
    <div className="eyebrow">CURATOR DESK / LIVE DOCUMENT</div>
    <div className="drawer-title"><div><div className="tiny-kicker">EXHIBIT RECORD</div><h2>{doc.title ?? 'Edit exhibit'}</h2></div><span className={`status ${currentStage}`}>{stageLabels[currentStage] ?? currentStage}</span></div>
    <label>Title<input value={doc.title ?? ''} onChange={e => editTitle(e.target.value)} /></label>
    <label>Hook<input value={doc.hook ?? ''} onChange={e => editHook(e.target.value)} /></label>
    <label>Story<textarea value={doc.story ?? ''} onChange={e => editStory(e.target.value)} /></label>
    <div className="two"><label>Weirdness<input type="number" min="1" max="100" value={doc.weirdness ?? 50} onChange={e => editWeirdness(Number(e.target.value))} /></label><label>Primary source<input type="url" value={doc.sourceUrl ?? ''} onChange={e => editSource(e.target.value)} placeholder="https://…" /></label></div>
    <div className="evidence-block"><div className="section-head"><span>Evidence chain</span><button className="secondary small" onClick={addEvidence}>+ Add evidence</button></div>{evidence.length === 0 && <p className="muted">No evidence attached yet. Add at least one item before approval.</p>}{evidence.map((item, index) => <div className="evidence-item" key={index}><input value={item.label ?? ''} onChange={e => updateEvidence(index, {label: e.target.value})} placeholder="Label" /><input value={item.detail ?? ''} onChange={e => updateEvidence(index, {detail: e.target.value})} placeholder="What does it show?" /><input type="url" value={item.sourceUrl ?? ''} onChange={e => updateEvidence(index, {sourceUrl: e.target.value})} placeholder="Source URL" /><button className="remove" onClick={() => removeEvidence(index)}>Remove evidence</button></div>)}</div>
    <div className="evidence-block"><div className="section-head"><span>Contradiction map</span><button className="secondary small" onClick={addContradiction}>+ Add conflict</button></div><p className="muted">Keep competing claims side by side instead of forcing one answer.</p>{contradictions.map((item, index) => <div className="contradiction-item" key={index}><div className="claim-column"><span>CLAIM A</span><input value={item.claimA ?? ''} onChange={e => updateContradiction(index, {claimA: e.target.value})} placeholder="What one source says" /><input type="url" value={item.sourceA ?? ''} onChange={e => updateContradiction(index, {sourceA: e.target.value})} placeholder="Source A URL" /></div><div className="claim-column"><span>CLAIM B</span><input value={item.claimB ?? ''} onChange={e => updateContradiction(index, {claimB: e.target.value})} placeholder="What another source says" /><input type="url" value={item.sourceB ?? ''} onChange={e => updateContradiction(index, {sourceB: e.target.value})} placeholder="Source B URL" /></div><input className="conflict-note" value={item.note ?? ''} onChange={e => updateContradiction(index, {note: e.target.value})} placeholder="Why these claims conflict" /><button className="remove" onClick={() => removeContradiction(index)}>Remove conflict</button></div>)}</div>
    <label>Curator notes<textarea value={doc.curatorNotes ?? ''} onChange={e => editNotes(e.target.value)} placeholder="What still needs checking? Why is this ready?" /></label>
    {currentStage === 'review' && <div className="review-panel"><div><span className="eyebrow">HUMAN REVIEW GATE</span><strong>Make the editorial decision in the same workflow.</strong></div><div className="review-actions"><button className="secondary" onClick={() => decide('request_changes')}>Request changes</button><button className="danger" onClick={() => decide('reject')}>Reject</button><button className="primary" onClick={() => decide('approve')}>Approve exhibit</button></div><small>Decision, reviewer identity and notes are stored on the linked Sanity Curation Task.</small></div>}
    <div className="workflow-box"><div><span className="eyebrow">MODELED WORKFLOW</span><strong>{stageLabels[currentStage] ?? currentStage}</strong></div><div className="workflow-rail">{stages.map((stage, i) => <span key={stage} className={i <= stages.indexOf(currentStage as any) ? 'done' : ''}>{i + 1}</span>)}</div>{nextStage ? <button className="primary full" onClick={advance}>Move to {stageLabels[nextStage]} <span>→</span></button> : <span className="complete">✓ Workflow complete</span>}{error && <div className="error-flash">{error}</div>}</div>
    <div className="actions"><button className="secondary" onClick={navigateToStudioDocument}>Open in Studio ↗</button>{isDraft && <button className="primary" onClick={publish}>Publish exhibit</button>}</div>
    {flash && <div className="flash">✓ {flash}</div>}
    <div className="metadata"><span>SANITY DOCUMENT</span><code>{handle.documentId}</code></div>
  </div>
}
