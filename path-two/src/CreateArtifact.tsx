import {useApplyDocumentActions, createDocument, createDocumentHandle} from '@sanity/sdk-react'

export function CreateArtifact() {
  const apply = useApplyDocumentActions()
  const create = () => {
    const handle = createDocumentHandle({documentId: crypto.randomUUID(), documentType: 'oddity'})
    apply(createDocument(handle, {
      title: 'Untitled anomaly',
      hook: 'Something here does not add up yet.',
      story: 'Start the investigation. What happened, where was it observed, and why is it worth preserving?',
      weirdness: 50,
      stage: 'inbox',
      tags: ['new'],
      evidence: [],
      curatorNotes: 'Freshly opened case. Research before promotion.',
      featured: false,
    }))
  }
  return <button className="primary create" onClick={create}>+ New oddity</button>
}
