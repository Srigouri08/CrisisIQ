import {defineField, defineType} from 'sanity'

export const incidentCaseType = defineType({
  name: 'incidentCase', title: 'Incident Case', type: 'document',
  groups: [
    {name: 'incident', title: 'Incident'}, {name: 'evidence', title: 'Evidence'},
    {name: 'investigation', title: 'Investigation'}, {name: 'workflow', title: 'Workflow'},
  ],
  fields: [
    defineField({name: 'title', title: 'Incident title', type: 'string', group: 'incident', validation: rule => rule.required().min(5)}),
    defineField({name: 'incidentId', title: 'Incident ID', type: 'string', group: 'incident', validation: rule => rule.required()}),
    defineField({name: 'summary', title: 'Incident summary', type: 'text', rows: 4, group: 'incident', validation: rule => rule.required().min(30)}),
    defineField({name: 'severity', title: 'Severity', type: 'string', group: 'incident', options: {list: [
      {title: 'Critical', value: 'critical'}, {title: 'High', value: 'high'}, {title: 'Medium', value: 'medium'}, {title: 'Low', value: 'low'},
    ], layout: 'radio'}, initialValue: 'high'}),
    defineField({name: 'status', title: 'Incident status', type: 'string', group: 'incident', options: {list: [
      {title: 'Investigating', value: 'investigating'}, {title: 'Mitigating', value: 'mitigating'}, {title: 'Monitoring', value: 'monitoring'}, {title: 'Resolved', value: 'resolved'},
    ]}, initialValue: 'investigating'}),
    defineField({name: 'affectedServices', title: 'Affected services', type: 'array', group: 'incident', of: [{type: 'string'}], options: {layout: 'tags'}}),
    defineField({name: 'startedAt', title: 'Started at', type: 'datetime', group: 'incident'}),
    defineField({name: 'resolvedAt', title: 'Resolved at', type: 'datetime', group: 'incident'}),
    defineField({name: 'evidence', title: 'Evidence records', type: 'array', group: 'evidence', of: [{type: 'object', fields: [
      defineField({name: 'label', title: 'Evidence label', type: 'string'}), defineField({name: 'detail', title: 'Observed detail', type: 'text', rows: 3}),
      defineField({name: 'sourceType', title: 'Source type', type: 'string', options: {list: ['log', 'metric', 'alert', 'ticket', 'document', 'external']}}),
      defineField({name: 'sourceUrl', title: 'Source URL', type: 'url'}), defineField({name: 'confidence', title: 'Confidence', type: 'number', validation: rule => rule.min(0).max(100)}),
    ], preview: {select: {title: 'label', subtitle: 'sourceType'}}}]}),
    defineField({name: 'timeline', title: 'Incident timeline', type: 'array', group: 'evidence', of: [{type: 'object', fields: [
      defineField({name: 'time', title: 'Time', type: 'datetime'}), defineField({name: 'event', title: 'Event', type: 'string'}), defineField({name: 'source', title: 'Source', type: 'string'}),
    ]}]}),
    defineField({name: 'findings', title: 'Investigation findings', type: 'array', group: 'investigation', of: [{type: 'object', fields: [
      defineField({name: 'finding', title: 'Finding', type: 'text', rows: 3}), defineField({name: 'reasoning', title: 'Reasoning', type: 'text', rows: 4}),
      defineField({name: 'confidence', title: 'Confidence', type: 'number', validation: rule => rule.min(0).max(100)}), defineField({name: 'sources', title: 'Supporting sources', type: 'array', of: [{type: 'url'}]}),
    ]}]}),
    defineField({name: 'contradictions', title: 'Contradictions to review', type: 'array', group: 'investigation', of: [{type: 'object', fields: [
      defineField({name: 'claimA', title: 'Claim A', type: 'text', rows: 2}), defineField({name: 'claimB', title: 'Claim B', type: 'text', rows: 2}), defineField({name: 'resolution', title: 'Resolution', type: 'text', rows: 3}),
    ]}]}),
    defineField({name: 'workflowStage', title: 'Workflow stage', type: 'string', group: 'workflow', options: {list: [
      {title: 'New', value: 'new'}, {title: 'Investigating', value: 'investigating'}, {title: 'Needs review', value: 'review'}, {title: 'Verified', value: 'verified'}, {title: 'Resolved', value: 'resolved'},
    ]}, initialValue: 'new'}),
    defineField({name: 'reviewDecision', title: 'Review decision', type: 'string', group: 'workflow', options: {list: [
      {title: 'Approved', value: 'approved'}, {title: 'Changes requested', value: 'changes-requested'}, {title: 'Rejected', value: 'rejected'},
    ]}),
    defineField({name: 'reviewer', title: 'Reviewer', type: 'string', group: 'workflow'}),
    defineField({name: 'reviewNotes', title: 'Reviewer notes', type: 'text', rows: 4, group: 'workflow'}),
    defineField({name: 'reviewedAt', title: 'Reviewed at', type: 'datetime', group: 'workflow'}),
    defineField({name: 'primarySource', title: 'Primary source', type: 'url', group: 'evidence'}),
  ],
  preview: {select: {title: 'title', subtitle: 'incidentId', status: 'status'}, prepare({title, subtitle, status}) { return {title, subtitle: `${subtitle ?? 'No ID'} · ${status ?? 'investigating'}`} }},
})
