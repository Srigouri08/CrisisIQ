import {defineField, defineType} from 'sanity'

export const oddityType = defineType({
  name: 'oddity',
  title: 'Oddity',
  type: 'document',
  groups: [
    {name: 'story', title: 'Story'},
    {name: 'evidence', title: 'Evidence'},
    {name: 'curation', title: 'Curation'},
  ],
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', group: 'story', validation: r => r.required().min(4)}),
    defineField({name: 'hook', title: 'One-line hook', type: 'string', group: 'story', validation: r => r.max(140)}),
    defineField({name: 'story', title: 'The strange story', type: 'text', rows: 7, group: 'story', validation: r => r.required().min(40)}),
    defineField({name: 'tags', title: 'Tags', type: 'array', group: 'story', of: [{type: 'string'}], options: {layout: 'tags'}}),
    defineField({name: 'sourceUrl', title: 'Primary source', type: 'url', group: 'evidence'}),
    defineField({name: 'evidence', title: 'Evidence chain', type: 'array', group: 'evidence', of: [{type: 'object', fields: [
      defineField({name: 'label', type: 'string', title: 'Label'}),
      defineField({name: 'detail', type: 'string', title: 'What it shows'}),
      defineField({name: 'sourceUrl', type: 'url', title: 'Source URL'}),
    ]}]}),
    defineField({name: 'contradictions', title: 'Conflicting claims', type: 'array', group: 'evidence', of: [{type: 'object', fields: [
      defineField({name: 'claimA', type: 'string', title: 'Claim A', validation: r => r.required()}),
      defineField({name: 'sourceA', type: 'url', title: 'Source A'}),
      defineField({name: 'claimB', type: 'string', title: 'Claim B', validation: r => r.required()}),
      defineField({name: 'sourceB', type: 'url', title: 'Source B'}),
      defineField({name: 'note', type: 'string', title: 'Why they conflict'}),
    ]}]}),
    defineField({name: 'weirdness', title: 'Weirdness', type: 'number', group: 'curation', validation: r => r.required().min(1).max(100)}),
    defineField({name: 'stage', title: 'Workflow stage', type: 'string', group: 'curation', options: {list: [
      {title: 'Inbox', value: 'inbox'},
      {title: 'Researching', value: 'researching'},
      {title: 'Needs review', value: 'review'},
      {title: 'Exhibit ready', value: 'approved'},
      {title: 'Archived', value: 'archived'},
    ]}, initialValue: 'inbox'}),
    defineField({name: 'curatorNotes', title: 'Curator notes', type: 'text', rows: 5, group: 'curation'}),
    defineField({name: 'featured', title: 'Feature in Observatory', type: 'boolean', group: 'curation', initialValue: false}),
  ],
})
