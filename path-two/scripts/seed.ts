import {createClient} from '@sanity/client'

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET ?? 'production'
const token = process.env.SANITY_API_WRITE_TOKEN
if (!projectId || !token) throw new Error('Set SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN before seeding.')

const client = createClient({projectId, dataset, apiVersion: '2026-03-25', token, useCdn: false})

const exhibits = [
  {title: 'The Town That Rang at 3:17', hook: 'Every night, one empty bell tower rings exactly once.', story: 'For eleven months, residents recorded the same single bell note at 3:17 AM. The tower has no working bell, the key is held in a museum, and the sound disappears whenever someone sleeps inside the tower.', weirdness: 94, stage: 'approved', featured: true, tags: ['sound', 'ritual', 'town'], curatorNotes: 'Keep the competing explanations visible. The unexplained gap is part of the exhibit.', evidence: [{label: 'Audio log', detail: '47 recordings share the same timestamp pattern.'}]},
  {title: 'The Photograph With Tomorrow In It', hook: 'A disposable camera developed with one frame dated the next day.', story: 'A roll found in a closed seaside arcade contained ordinary photographs until the final frame: a photograph of the arcade entrance taken from outside, with a handwritten date one day in the future.', weirdness: 88, stage: 'review', featured: true, tags: ['photography', 'time', 'artifact'], curatorNotes: 'Needs source verification and a clearer timeline.'},
  {title: 'The Blue Door Nobody Built', hook: 'A door appeared on a wall that had been photographed for decades.', story: 'Archive photographs of a brick service corridor show a blank wall for 41 years. In one week of images, a blue door appears, complete with a handle and shadow. The wall was not rebuilt and the next renovation removed it.', weirdness: 76, stage: 'researching', featured: false, tags: ['architecture', 'archives'], curatorNotes: 'Find the original photo archive before moving to review.'},
  {title: 'The Vending Machine That Knows Your Name', hook: 'It prints a different message depending on who approaches.', story: 'A retired vending machine in a university basement displayed personalized maintenance messages even though its network board had been removed. Three students documented different messages on the same afternoon.', weirdness: 67, stage: 'inbox', featured: false, tags: ['machine', 'campus'], curatorNotes: 'Fun lead. We need independent witnesses.'}
]

const tx = client.transaction()
for (const exhibit of exhibits) tx.create({documentId: `oddity-${exhibit.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`, _type: 'oddity', ...exhibit})
await tx.commit()
console.log(`Seeded ${exhibits.length} oddities into ${projectId}/${dataset}.`)
