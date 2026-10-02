import {createClient} from '@sanity/client'

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET ?? 'production'
const token = process.env.SANITY_API_WRITE_TOKEN
if (!projectId || !token) throw new Error('Set SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN before seeding.')

const client = createClient({projectId, dataset, apiVersion: '2026-03-25', token, useCdn: false})

const cases = [
  {title: 'Checkout failures after certificate rotation', incidentId: 'INC-2026-001', summary: 'Checkout requests began failing shortly after a certificate rotation. Investigation is comparing gateway logs, deployment timing, and service health signals.', severity: 'high', status: 'investigating', workflowStage: 'review', affectedServices: ['Checkout API', 'Payments Gateway'], evidence: [{label: 'Gateway error spike', detail: 'TLS handshake failures increased immediately after the rotation.', sourceType: 'log', confidence: 92}], findings: [{finding: 'Certificate configuration is the leading hypothesis.', reasoning: 'The error onset overlaps the certificate change and is isolated to TLS-dependent requests.', confidence: 86, sources: []}], contradictions: [{claimA: 'Certificate rotation caused the failures.', claimB: 'Payment gateway latency increased before the rotation.', resolution: 'Keep both claims open until the gateway timeline is verified.'}], reviewNotes: 'Verify the gateway timeline before marking the incident resolved.'},
  {title: 'Unexpected queue growth in notification service', incidentId: 'INC-2026-002', summary: 'Notification queues are growing faster than workers can process them. The investigation is checking recent deploys, retry behavior, and downstream response times.', severity: 'medium', status: 'mitigating', workflowStage: 'investigating', affectedServices: ['Notification Worker', 'Message Queue'], evidence: [{label: 'Queue depth metric', detail: 'Backlog crossed the normal operating range for three consecutive intervals.', sourceType: 'metric', confidence: 95}], findings: [], contradictions: [], reviewNotes: ''},
  {title: 'Intermittent authentication timeouts', incidentId: 'INC-2026-003', summary: 'A subset of authentication requests time out intermittently. Evidence is being collected across identity, network, and session services.', severity: 'high', status: 'monitoring', workflowStage: 'verified', affectedServices: ['Identity API', 'Session Service'], evidence: [{label: 'Timeout alert', detail: 'Authentication timeout rate exceeded the alert threshold for two intervals.', sourceType: 'alert', confidence: 88}], findings: [{finding: 'The issue appears isolated to a dependency path.', reasoning: 'Core identity health remains stable while dependent session requests show elevated latency.', confidence: 79, sources: []}], contradictions: [], reviewNotes: 'Verified after dependency health returned to baseline.'}
]

const tx = client.transaction()
for (const incident of cases) tx.create({documentId: incident.incidentId.toLowerCase(), _type: 'incidentCase', ...incident})
await tx.commit()
console.log(`Seeded ${cases.length} CrisisIQ incident cases into ${projectId}/${dataset}.`)
