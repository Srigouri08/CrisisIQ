import {defineField, defineType} from 'sanity'

export const oddityType = defineType({
  name: 'oddity',
  title: 'Oddity',
  type: 'document',
  groups: [
    {name: 'story', title: 'Story'},
    {name: 'curation', title: 'Curation'},
  ],
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', group: 'story', validation: r => r.required().min(4)}),
    defineField({name: 'hook', title: 'One-line hook', type: 'string', group: 'story', validation: r => r.max(140)}),
    defineField({name: 'story', title: 'The strange story', type: 'text', rows: 7, group: 'story', validation: r => r.required().min(40)}),
    defineField({name: 'evidence', title: 'Evidence', type: 'array', group: 'story', of: [{type: 'object', fields: [
      defineField({name: 'label', type: 'string', title: 'Label'}),
      defineField({name: 'detail', type: 'string', title: 'Detail'}),
      defineField({name: 'sourceUrl', type: 'url', title: 'Source URL'}),
    ]}]}),
    defineField({name: 'tags', title: 'Tags', type: 'array', group: 'story', of: [{type: 'string'}], options: {layout: 'tags'}}),
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
    defineField({name: 'sourceUrl', title: 'Primary source', type: 'url', group: 'story'}),
  ],
})
