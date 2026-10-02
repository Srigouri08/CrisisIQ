import {useApplyDocumentActions, createDocument, createDocumentHandle} from '@sanity/sdk-react'

export function CreateArtifact() {
  const apply = useApplyDocumentActions()
  const create = () => {
    const handle = createDocumentHandle({documentId: crypto.randomUUID(), documentType: 'oddity'})
    apply(createDocument(handle, {
      title: 'Untitled incident',
      hook: 'A signal that does not add up yet.',
      story: 'Start the investigation. What happened, where was it observed, and why does the evidence deserve a closer look?',
      weirdness: 50,
      stage: 'inbox',
      tags: ['new-case'],
      evidence: [],
      curatorNotes: 'Fresh case. Verify the source before promoting it to human review.',
      featured: false,
    }))
  }
  return <button className="primary create" onClick={create}>+ New incident</button>
}
