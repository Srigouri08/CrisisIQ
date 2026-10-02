import {defineField, defineType} from 'sanity'

export const oddityType = defineType({
  name: 'oddity',
  title: 'Incident Record',
  type: 'document',
  groups: [
    {name: 'story', title: 'Incident'},
    {name: 'evidence', title: 'Evidence'},
    {name: 'curation', title: 'Investigation'},
  ],
  fields: [
    defineField({name: 'title', title: 'Case title', type: 'string', group: 'story', validation: r => r.required().min(4)}),
    defineField({name: 'hook', title: 'Signal summary', type: 'string', group: 'story', validation: r => r.max(140)}),
    defineField({name: 'story', title: 'Incident narrative', type: 'text', rows: 7, group: 'story', validation: r => r.required().min(40)}),
    defineField({name: 'tags', title: 'Signals / tags', type: 'array', group: 'story', of: [{type: 'string'}], options: {layout: 'tags'}}),
    defineField({name: 'sourceUrl', title: 'Primary source', type: 'url', group: 'evidence'}),
    defineField({name: 'evidence', title: 'Evidence chain', type: 'array', group: 'evidence', of: [{type: 'object', fields: [
      defineField({name: 'label', type: 'string', title: 'Evidence label'}),
      defineField({name: 'detail', type: 'string', title: 'What it establishes'}),
      defineField({name: 'sourceUrl', type: 'url', title: 'Source URL'}),
    ]}]}),
    defineField({name: 'contradictions', title: 'Conflicting claims', type: 'array', group: 'evidence', of: [{type: 'object', fields: [
      defineField({name: 'claimA', type: 'string', title: 'Claim A', validation: r => r.required()}),
      defineField({name: 'sourceA', type: 'url', title: 'Source A'}),
      defineField({name: 'claimB', type: 'string', title: 'Claim B', validation: r => r.required()}),
      defineField({name: 'sourceB', type: 'url', title: 'Source B'}),
      defineField({name: 'note', type: 'string', title: 'Why they conflict'}),
    ]}]}),
    defineField({name: 'weirdness', title: 'Signal intensity', type: 'number', group: 'curation', validation: r => r.required().min(1).max(100)}),
    defineField({name: 'stage', title: 'Investigation stage', type: 'string', group: 'curation', options: {list: [
      {title: 'Intake', value: 'inbox'},
      {title: 'Investigating', value: 'researching'},
      {title: 'Human review', value: 'review'},
      {title: 'Cleared', value: 'approved'},
      {title: 'Archived', value: 'archived'},
    ]}, initialValue: 'inbox'}),
    defineField({name: 'curatorNotes', title: 'Investigator notes', type: 'text', rows: 5, group: 'curation'}),
    defineField({name: 'featured', title: 'Mark as priority case', type: 'boolean', group: 'curation', initialValue: false}),
  ],
})
