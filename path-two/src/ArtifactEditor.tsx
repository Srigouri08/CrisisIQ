import {useEffect, useState} from 'react'
import {useApplyDocumentActions, useDocument, useEditDocument, useNavigateToStudioDocument, publishDocument, type DocumentHandle} from '@sanity/sdk-react'

export function ArtifactEditor({handle, onClose}: {handle: DocumentHandle; onClose: () => void}) {
  return <aside className="drawer"><EditorBody handle={handle} onClose={onClose} /></aside>
}

function EditorBody({handle, onClose}: {handle: DocumentHandle; onClose: () => void}) {
  const {data: doc} = useDocument<Record<string, any>>(handle)
  const editTitle = useEditDocument<string>({...handle, path: 'title'})
  const editHook = useEditDocument<string>({...handle, path: 'hook'})
  const editStory = useEditDocument<string>({...handle, path: 'story'})
  const editStage = useEditDocument<string>({...handle, path: 'stage'})
  const editWeirdness = useEditDocument<number>({...handle, path: 'weirdness'})
  const editNotes = useEditDocument<string>({...handle, path: 'curatorNotes'})
  const apply = useApplyDocumentActions()
  const {navigateToStudioDocument} = useNavigateToStudioDocument(handle)
  const [flash, setFlash] = useState('')

  useEffect(() => { setFlash('') }, [handle.documentId])

  if (!doc) return <div className="drawer-inner"><button className="close" onClick={onClose}>×</button><p>Loading exhibit…</p></div>
  const isDraft = typeof doc._id === 'string' && doc._id.startsWith('drafts.')
  const publish = () => { apply(publishDocument(handle)); setFlash('Published to the exhibit.') }

  return <div className="drawer-inner">
    <button className="close" onClick={onClose}>×</button>
    <div className="eyebrow">CURATOR DESK</div>
    <div className="drawer-title"><h2>Edit exhibit</h2><span className={`status ${doc.stage}`}>{doc.stage ?? 'inbox'}</span></div>
    <label>Title<input value={doc.title ?? ''} onChange={e => editTitle(e.target.value)} /></label>
    <label>Hook<input value={doc.hook ?? ''} onChange={e => editHook(e.target.value)} /></label>
    <label>Story<textarea value={doc.story ?? ''} onChange={e => editStory(e.target.value)} /></label>
    <div className="two"><label>Weirdness<input type="number" min="1" max="100" value={doc.weirdness ?? 50} onChange={e => editWeirdness(Number(e.target.value))} /></label><label>Stage<select value={doc.stage ?? 'inbox'} onChange={e => editStage(e.target.value)}><option value="inbox">Inbox</option><option value="researching">Researching</option><option value="review">Needs review</option><option value="approved">Exhibit ready</option><option value="archived">Archived</option></select></label></div>
    <label>Curator notes<textarea value={doc.curatorNotes ?? ''} onChange={e => editNotes(e.target.value)} /></label>
    <div className="actions"><button className="secondary" onClick={navigateToStudioDocument}>Open in Studio</button>{isDraft && <button className="primary" onClick={publish}>Publish exhibit</button>}</div>
    {flash && <div className="flash">✓ {flash}</div>}
    <div className="metadata"><span>Document</span><code>{handle.documentId}</code></div>
  </div>
}
