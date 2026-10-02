# The Weird Archive

A Sanity-powered content application for curating strange stories, evidence, and unresolved anomalies.

## Why this is a Path Two build

This is not a read-only frontend. The app is a custom curator desk sitting directly on top of Sanity Content Lake.

- **App SDK:** `SanityApp`, `useDocuments`, `useDocumentProjection`, `useDocument`, `useEditDocument`, `useApplyDocumentActions`, `useDocumentEvent`, and `useNavigateToStudioDocument`.
- **Real-time editing:** title, hook, story, workflow stage, weirdness score, and curator notes write directly to Sanity with optimistic updates.
- **Workflow:** each oddity carries a `stage` field: inbox → researching → review → approved → archived. The curator can move an item through the pipeline and publish it from the custom interface.
- **Custom interface:** the Observatory is a visual archive; the Curator board is a workflow view; Activity is a live mutation feed.
- **Structured content:** evidence, tags, sources, curation notes, feature status, and workflow state are modeled as Sanity fields instead of being hard-coded into the UI.

## Run it

Node 22.12+ is recommended.

```bash
cd path-two
npm install
```

Copy `.env.example` to `.env.local` and add your Sanity project ID and dataset.

Start the custom app:

```bash
npm run dev
```

Start the Studio separately:

```bash
npm run studio
```

To seed four demo exhibits, create a Sanity write token and run:

```bash
npm run seed
```

The seed script uses `SANITY_API_WRITE_TOKEN` only from your local environment. Never commit the token.

## Vercel

Set `VITE_SANITY_PROJECT_ID` and `VITE_SANITY_DATASET` in the Vercel project. Set the Vercel root directory to `path-two` and use:

- Build command: `npm run build`
- Output directory: `dist`

The Sanity Studio can be deployed separately with `npm run studio:deploy` after configuring the project ID and dataset.

## The strange part

The UI intentionally treats each content document like a museum object. A story is not just a post: it has a weirdness score, evidence, competing research notes, a curation state, and a path from raw lead to public exhibit.

That makes Sanity part of the experience itself, rather than a database hidden behind a conventional website.
