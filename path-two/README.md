# The Weird Archive

A Sanity-powered custom content app built for **Sanity Challenge — Path Two: Vibe-Code Something Strange**.

The premise is intentionally odd: treat unexplained stories like museum objects. The result is not a normal blog frontend. It is a small editorial system where a curator can collect an oddity, attach evidence, research it, review it, publish it as an exhibit, and eventually archive it.

## What I built

The `path-two` folder contains a React + Vite app that runs on top of the Sanity App SDK, plus a Sanity Studio and a small seed dataset.

The custom app has three views:

- **Observatory** — a public-facing-feeling gallery of the current oddities in the Content Lake.
- **Curator** — a workflow board for moving documents through `Inbox → Researching → Needs review → Exhibit ready → Archived`.
- **Activity** — live document-event signals from Sanity.

Selecting an exhibit opens a custom curator drawer. From there the curator can edit the story, score its weirdness, add evidence and source URLs, write curator notes, open the same document in Sanity Studio, and publish drafts.

## Why Sanity is doing real work here

Sanity is the source of truth for the archive. The app is not backed by a hard-coded JSON list.

The custom interface uses `@sanity/sdk-react` for document reads, projections, edits, document creation, publishing actions, current-user information, navigation into Studio, and document-event subscriptions. Changes made in the Content Lake can surface in the custom app without a manual page refresh.

The schema is designed around the actual editorial process rather than just presentation fields.

### `oddity` document

- `title` — exhibit name
- `hook` — short description for the gallery
- `story` — the longer narrative
- `evidence[]` — structured evidence items with labels, details, and source URLs
- `tags[]` — searchable classification
- `weirdness` — a 1–100 editorial score
- `stage` — workflow state stored directly on the Sanity document
- `curatorNotes` — internal editorial notes
- `featured` — whether the exhibit should be highlighted
- `sourceUrl` — primary source

The workflow is therefore data, not just CSS labels. The custom editor also applies simple transition gates: an exhibit needs a fuller story before review, and at least one evidence item plus curator notes before it can become exhibit-ready.

## App SDK / custom interface

This project deliberately goes beyond a read-only frontend. The custom React interface is wrapped in Sanity's `SanityApp` and uses the Sanity SDK directly.

That gives the project two complementary editing surfaces:

1. **The Weird Archive** — a purpose-built interface for the curator workflow.
2. **Sanity Studio** — the underlying content-management interface for the same documents.

The `Open in Studio` action connects the two instead of creating a separate copy of the content.

## Demo content

The repository includes a small seed script with four fictional oddities. They are explicitly fictional demo content so the project does not present invented stories as real investigations.

To seed a dataset locally:

```bash
cd path-two
npm install
npm run seed
```

The seed script expects a Sanity project ID, dataset, and write token in the local environment. Secrets should never be committed.

## Run locally

From `path-two`:

```bash
npm install
npm run dev
```

For the Sanity Studio:

```bash
npm run studio
```

Build the custom app with:

```bash
npm run build
```

The environment template is in `.env.example`.

## Build process

This started as a deliberately small idea — a strange-story archive — and grew through the Sanity data model first, then the custom interface around that model. The useful part of the experiment was discovering that the same document could drive a gallery, a workflow board, an editor, and Studio instead of building separate state for each screen.

The finished project is still a challenge prototype rather than a production editorial platform. The content is fictional, the workflow is intentionally lightweight, and the app is focused on demonstrating a real Sanity-backed interaction rather than pretending to solve every problem a production CMS would have.

## Project structure

```text
path-two/
├── src/              # React custom app + Sanity App SDK integration
├── schemaTypes/      # Sanity document schema
├── scripts/          # Optional fictional demo-data seed
├── sanity.config.ts  # Sanity Studio configuration
├── sanity.cli.ts
├── package.json
└── vercel.json
```
