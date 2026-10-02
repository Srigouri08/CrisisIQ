import {useApplyDocumentActions, createDocument, createDocumentHandle} from '@sanity/sdk-react'

export function CreateIncident() {
  const apply = useApplyDocumentActions()
  const create = () => {
    const id = crypto.randomUUID()
    const handle = createDocumentHandle({documentId: id, documentType: 'incidentCase'})
    apply(createDocument(handle, {
      title: 'Untitled incident',
      incidentId: `INC-${id.slice(0, 8).toUpperCase()}`,
      summary: 'Start the investigation by documenting what happened, what was observed, and which services may be affected.',
      severity: 'medium',
      status: 'investigating',
      workflowStage: 'new',
      affectedServices: [],
      evidence: [],
      findings: [],
      contradictions: [],
    }))
  }
  return <button className="primary create" onClick={create}>+ New incident</button>
}
