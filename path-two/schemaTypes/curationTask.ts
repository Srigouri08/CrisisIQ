import {defineField, defineType} from 'sanity'

export const curationTaskType = defineType({
  name: 'curationTask',
  title: 'Curation Task',
  type: 'document',
  groups: [
    {name: 'task', title: 'Task'},
    {name: 'review', title: 'Review'},
  ],
  fields: [
    defineField({name: 'title', title: 'Task', type: 'string', group: 'task', validation: r => r.required()}),
    defineField({name: 'oddity', title: 'Exhibit', type: 'reference', to: [{type: 'oddity'}], group: 'task', validation: r => r.required()}),
    defineField({name: 'status', title: 'Status', type: 'string', group: 'task', options: {list: [
      {title: 'Open', value: 'open'},
      {title: 'In review', value: 'review'},
      {title: 'Approved', value: 'approved'},
      {title: 'Blocked', value: 'blocked'},
    ]}, initialValue: 'open'}),
    defineField({name: 'priority', title: 'Priority', type: 'string', group: 'task', options: {list: [
      {title: 'Low', value: 'low'},
      {title: 'Normal', value: 'normal'},
      {title: 'High', value: 'high'},
      {title: 'Critical', value: 'critical'},
    ]}, initialValue: 'normal'}),
    defineField({name: 'reviewer', title: 'Reviewer', type: 'string', group: 'review'}),
    defineField({name: 'decision', title: 'Decision notes', type: 'text', rows: 4, group: 'review'}),
    defineField({name: 'dueAt', title: 'Due', type: 'datetime', group: 'review'}),
  ],
})
