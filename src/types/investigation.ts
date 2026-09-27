export type EvidenceKind = 'change' | 'telemetry' | 'comms' | 'support'

export interface EvidenceSource {
  id: string
  category: 'Incident Report' | 'Deployment Log' | 'Monitoring Report' | 'Release Notes' | 'Engineering Messages' | 'Customer Reports'
  title: string
  source: string
  time: string
  kind: EvidenceKind
  excerpt: string
  note: string
}

export interface TimelineEvent {
  time: string
  title: string
  detail: string
  tone: 'neutral' | 'warning' | 'critical' | 'resolved'
}

export interface Finding {
  id: string
  title: string
  detail: string
  confidence: 'low' | 'medium'
  evidenceIds: string[]
}

export interface Contradiction {
  id: string
  title: string
  claim: string
  supportingEvidenceIds: string[]
  opposingEvidenceIds: string[]
  whyItMatters: string
}

export interface InvestigationCase {
  id: string
  organization: string
  title: string
  service: string
  status: string
  startedAt: string
  endedAt: string
  duration: string
  impactStartedAt: string
  impactDuration: string
  impact: string
  summary: string
  timeline: TimelineEvent[]
  evidence: EvidenceSource[]
  findings: Finding[]
  contradictions: Contradiction[]
}

export interface InvestigationRequest {
  caseId: string
  question: string
  evidence: EvidenceSource[]
}

export interface InvestigationResponse {
  answer: string
  citationIds: string[]
  isDemo: boolean
}