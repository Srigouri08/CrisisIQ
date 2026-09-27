# CrisisIQ

CrisisIQ is an incident investigation dashboard for turning scattered operational records into a clear, evidence-grounded investigation. It helps teams reconstruct what happened, compare conflicting accounts, and keep uncertainty visible instead of jumping to an unsupported root cause.

## Case #001

The first dashboard case is fictional **PulsePay — The 37-Minute Outage**. Its timeline and evidence panels are demonstration content; the investigation agent does not receive those panels as evidence and determines conclusions from content retrieved through Sanity Context.

## Investigation workflow

- **Evidence retrieval:** collect relevant source material through Sanity Context.
- **Timeline reconstruction:** arrange reported events into a sequence.
- **Contradiction analysis:** compare conflicting claims and the records that support or challenge them.
- **Uncertainty detection:** keep gaps and competing explanations visible rather than hardcoding a root cause.

## Architecture

**CrisisIQ → Gemini → Sanity Context MCP → Sanity Knowledge Base → evidence**

The browser chat sends messages to the Express `POST /api/chat` endpoint. The server uses the Vercel AI SDK with Google Gemini and an MCP client connected to the read-only Sanity Context endpoint. Retrieved Knowledge Base content grounds the streamed response. The configured MCP currently exposes `initial_context` and `knowledge_base_read`.

## Tech stack

React, TypeScript, and Vite power the responsive dashboard. Express hosts the server-side chat API; the Vercel AI SDK, `@ai-sdk/google`, and `@ai-sdk/mcp` connect Gemini to Sanity Context. Credentials remain server-side.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and replace its placeholders with a Sanity Context Viewer token and Google Generative AI API key. Keep `.env.local` private; it is ignored by Git. Do not prefix either variable with `VITE_`.
3. Start the frontend and API together with `npm run dev`, then open the local URL printed by Vite.

The model defaults to `gemini-3.8-flash`. `npm run build` creates a production frontend build, and `npm run lint` runs Oxlint.
