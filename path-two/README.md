# CrisisIQ

A small Sanity-powered prototype built 

The idea is simple: treat strange stories like museum objects. Instead of building a normal blog frontend, this app gives a curator a custom interface for creating, researching, editing, and moving those objects through a simple workflow.

## What is actually in this repo

The `path-two` folder contains:

- A React + Vite custom app using the Sanity App SDK.
- A Sanity Studio with an `oddity` document type.
- An Observatory view for browsing oddities.
- A Curator view with workflow stages.
- An Activity view that listens for Sanity document events.
- An editor for changing an oddity from the custom app.
- A small seed script with four fictional demo oddities.

The demo content is intentionally fictional. It is there to make the prototype usable without pretending that the stories are real investigations.

## Sanity model

Each `oddity` document currently includes:

- title
- one-line hook
- story
- evidence
- evidence/source URLs
- tags
- weirdness score
- workflow stage
- curator notes
- featured flag
- primary source URL

The workflow is stored on the document itself:

`Inbox → Researching → Needs review → Exhibit ready → Archived`

That means the workflow state is content in Sanity, rather than a list of UI-only labels.

## Sanity App SDK

The custom interface uses the Sanity SDK to read and work with documents. It also listens for document events so changes made through Sanity can be reflected in the app without a manual refresh.

The goal here is not to hide Sanity behind a normal website. The Sanity Content Lake and Studio are part of the actual editing experience.

## Run locally

From this directory:

```bash
cd path-two
npm install
```

Set the Sanity project and dataset values in your local environment. Do not commit tokens or other secrets.

Run the custom app:

```bash
npm run dev
```

Run the Studio:

```bash
npm run studio
```

### Optional demo data

The repository includes a seed script containing four fictional exhibits. To add them to a Sanity dataset, provide a project ID and a write token through your local environment and run:

```bash
npm run seed
```

The seed data is only sample content for the prototype.

## Build

```bash
npm run build
```

## Project structure

```text
path-two/
├── src/              # React custom app
├── schemaTypes/      # Sanity document schema
├── scripts/          # Optional demo-data seed script
├── sanity.config.ts  # Sanity Studio configuration
├── sanity.cli.ts
├── package.json
└── vercel.json
```

## Status

This is a challenge prototype, not a production content-management system. The interesting part is the experiment: how far a custom Sanity app can turn a simple content model into an actual working curation interface.
