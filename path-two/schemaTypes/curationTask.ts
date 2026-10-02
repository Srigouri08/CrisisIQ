import {defineField, defineType} from 'sanity'

export const curationTaskType = defineType({
  name: 'curationTask',
  title: 'Investigation Review',
  type: 'document',
  groups: [
    {name: 'task', title: 'Review task'},
    {name: 'review', title: 'Decision'},
  ],
  fields: [
    defineField({name: 'title', title: 'Review task', type: 'string', group: 'task', validation: r => r.required()}),
    defineField({name: 'oddity', title: 'Incident record', type: 'reference', to: [{type: 'oddity'}], group: 'task', validation: r => r.required()}),
    defineField({name: 'status', title: 'Review status', type: 'string', group: 'task', options: {list: [
      {title: 'Open', value: 'open'},
      {title: 'In review', value: 'review'},
      {title: 'Approved', value: 'approved'},
      {title: 'Changes requested', value: 'changes'},
      {title: 'Blocked', value: 'blocked'},
    ]}, initialValue: 'open'}),
    defineField({name: 'priority', title: 'Priority', type: 'string', group: 'task', options: {list: [
      {title: 'Low', value: 'low'},
      {title: 'Normal', value: 'normal'},
      {title: 'High', value: 'high'},
      {title: 'Critical', value: 'critical'},
    ]}, initialValue: 'normal'}),
    defineField({name: 'reviewer', title: 'Reviewer', type: 'string', group: 'review'}),
    defineField({name: 'decision', title: 'Decision', type: 'string', group: 'review', options: {list: [
      {title: 'Approve', value: 'approve'},
      {title: 'Request changes', value: 'request_changes'},
      {title: 'Reject', value: 'reject'},
    ]}}),
    defineField({name: 'decisionNotes', title: 'Decision rationale', type: 'text', rows: 4, group: 'review'}),
    defineField({name: 'dueAt', title: 'Review due', type: 'datetime', group: 'review'}),
  ],
})
