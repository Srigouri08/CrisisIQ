# CrisisIQ — Sanity-powered investigation desk

CrisisIQ is a Sanity-powered investigation workspace built for the Sanity Challenge, Path Two. It treats an incident as structured content rather than a static page, then puts a custom App SDK interface on top of that content for investigation, evidence review, and human approval.

## What is actually in this repo

The `path-two` folder contains:

- A React + Vite custom app using the Sanity App SDK.
- A Sanity Studio with an `incidentCase` document type designed around investigation work.
- A live case view for browsing structured incidents.
- A review board for moving incidents through `New → Investigating → Needs review → Verified → Resolved`.
- Evidence records with source type, source URL, and confidence.
- Findings and contradictory claims stored alongside the incident.
- A custom editor that writes changes directly to Sanity.
- Persistent review decisions with reviewer, timestamp, notes, and decision state.
- A real-time activity view listening for Content Lake document events.
- A seed script containing fictional incident cases for the demo.

The demo cases are intentionally fictional. They exist to make the product usable during a walkthrough without presenting fabricated events as real-world incidents.

## Sanity content model

Each `incidentCase` can include:

- incident title and ID
- summary
- severity and operational status
- affected services
- start and resolution timestamps
- evidence records and provenance
- incident timeline
- investigation findings and confidence
- contradictory claims and their resolution
- primary source
- workflow stage
- review decision
- reviewer identity and review timestamp
- reviewer notes

The workflow is stored on the document itself:

`New → Investigating → Needs review → Verified → Resolved`

Review actions are also persisted as content. Approving an incident records an `approved` decision and moves it to `Verified`; requesting changes sends it back to `Investigating`; rejecting it moves it to `Resolved`.

## Sanity App SDK

The custom CrisisIQ interface uses the Sanity SDK to read document projections, edit document fields, create new incident cases, publish content, and navigate directly to the corresponding Studio document.

The app also listens for Sanity document events. Changes made in Sanity Studio can therefore surface in the custom interface without treating the frontend as a separate source of truth.

The goal is to make Sanity part of the actual product experience rather than using it as a hidden CMS behind a read-only frontend.

## Run locally

From this directory:

```bash
cd path-two
npm install
```

Set `VITE_SANITY_PROJECT_ID` and `VITE_SANITY_DATASET` in your local environment. Never commit tokens or other secrets.

Run the custom app:

```bash
npm run dev
```

Run the Studio:

```bash
npm run studio
```

### Optional demo data

The repository includes a seed script containing fictional CrisisIQ incident cases. Provide a project ID and write token through your local environment, then run:

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
├── src/              # CrisisIQ custom App SDK interface
├── schemaTypes/      # Structured incident schema
├── scripts/          # Optional demo-data seed script
├── sanity.config.ts  # Sanity Studio configuration
├── sanity.cli.ts
├── package.json
└── vercel.json
```

## Status

This is a challenge prototype, not a production incident-management system. The point of the build is to explore how far structured Sanity content, a custom App SDK interface, real-time Content Lake events, and a human review workflow can be combined into one coherent investigation experience.
