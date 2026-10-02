# CrisisIQ — Incident Investigation Workspace

A Sanity-powered custom content app built for **Sanity Challenge — Path Two: Vibe-Code Something Strange**.

CrisisIQ treats strange or hard-to-explain incidents as structured investigation records rather than ordinary posts. A case can be opened, researched, backed by evidence, compared against conflicting claims, sent through a human review gate, cleared, and archived — with the workflow stored as content.

## What I built

The `path-two` folder contains a React + Vite custom app running on the **Sanity App SDK**, a Sanity Studio, and a small fictional seed dataset.

The custom app has three views:

- **Command center** — live case counts, search, recent investigation records, and Content Lake status.
- **Investigation** — a five-stage workflow board: `Intake → Investigating → Human review → Cleared → Archived`.
- **Activity** — live Sanity document-event signals showing changes made in Studio or the custom app.

Selecting a case opens a custom investigation drawer. Investigators can edit the narrative, signal intensity, evidence chain, source URLs, conflicting claims, notes, and workflow state. The same record can also be opened in Sanity Studio.

## Authentication

The app has a real account boundary using **Supabase Auth**. Users can create an account, sign in, and sign out before entering the investigation workspace.

The browser only receives the Supabase public/publishable key. No service-role secret is shipped to the client. Configure:

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

and the Sanity variables from `.env.example` in the Vercel project environment.

## Why Sanity is doing real work here

Sanity is the source of truth for investigation content. The custom app is not backed by a hard-coded JSON list.

The interface uses `@sanity/sdk-react` for document reads, projections, edits, document creation, publishing actions, current-user information, Studio navigation, and document-event subscriptions. Changes made in the Content Lake can surface in the custom app without a manual page refresh.

The schema is designed around an investigation process rather than just presentation fields.

### `oddity` document — presented as an Incident Record

- `title` — case title
- `hook` — short signal summary
- `story` — incident narrative
- `evidence[]` — structured evidence with labels, details, and source URLs
- `tags[]` — searchable signals/classification
- `weirdness` — displayed as signal intensity (1–100)
- `stage` — workflow state stored directly on the Sanity document
- `curatorNotes` — investigator notes and rationale
- `featured` — priority-case flag
- `sourceUrl` — primary source

### `curationTask` — presented as Investigation Review

A separate Sanity document is created when a case reaches human review. It stores the linked incident, review status, priority, reviewer, decision, decision rationale, and optional due date.

This makes the review process actual structured data rather than a visual button pretending to be a workflow.

## App SDK / custom interface

This project deliberately goes beyond a read-only frontend. The React interface is wrapped in Sanity's `SanityApp` and uses the Sanity SDK directly.

There are two complementary surfaces over the same Content Lake:

1. **CrisisIQ** — the purpose-built investigation interface.
2. **Sanity Studio** — the underlying content-management interface for the same records.

The `Open in Studio` action connects the two instead of creating a separate copy of the content.

## Workflow gates

The custom editor applies lightweight transition rules:

- A case needs a fuller narrative before it can enter human review.
- A cleared case needs evidence and investigator notes.
- Moving into review creates a linked `Investigation Review` document.
- Reviewers can **Approve**, **Request changes**, or **Reject**.
- The decision, reviewer identity, and rationale are stored with the review task.

## Demo content

The repository includes a small seed script with four **fictional** incident records. They are explicitly demo content so the project does not present invented stories as real investigations.

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

The project started as a small experiment around a strange-content archive and evolved into CrisisIQ: a custom investigation workspace where the data model drives the interface.

The important design decision was to make the same Sanity documents power the case gallery, workflow board, editor, review task, activity stream, and Studio. That is what makes the app more than a polished frontend placed in front of static content.

It is still a challenge prototype rather than a production incident-management platform. The seed records are fictional, the workflow is intentionally lightweight, and the goal is to demonstrate a thoughtful Sanity-backed build honestly.

## Project structure

```text
path-two/
├── src/              # React custom app + Sanity App SDK + Supabase auth
├── schemaTypes/      # Sanity incident + review schemas
├── scripts/          # Fictional demo-data seed
├── sanity.config.ts  # Sanity Studio configuration
├── sanity.cli.ts
├── package.json
└── vercel.json
```
