import { config } from 'dotenv'
import express, { type Request, type Response } from 'express'
import { google } from '@ai-sdk/google'
import { createMCPClient } from '@ai-sdk/mcp'
import { isStepCount, streamText, type ModelMessage } from 'ai'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

config({ path: '.env.local' })

const app = express()
const port = Number(process.env.PORT ?? 3001)
const mcpUrl = 'https://api.sanity.io/v1/context/organizations/obxrne2do/mcp/crisisiq-investigation'

app.use(express.json({ limit: '32kb' }))

app.post('/api/chat', async (request: Request, response: Response) => {
  const body = request.body as { messages?: unknown }
  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 20) {
    response.status(400).json({ error: 'Send between 1 and 20 chat messages.' })
    return
  }

  const messages: ModelMessage[] = []
  for (const item of body.messages) {
    if (
      typeof item !== 'object' || item === null ||
      !('role' in item) || !('content' in item) ||
      (item.role !== 'user' && item.role !== 'assistant') ||
      typeof item.content !== 'string' || item.content.length > 4000
    ) {
      response.status(400).json({ error: 'Each message must have a user or assistant role and text content under 4,000 characters.' })
      return
    }
    messages.push({ role: item.role, content: item.content })
  }

  if (!process.env.SANITY_API_READ_TOKEN || !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    response.status(503).json({ error: 'The investigation service is missing server credentials.' })
    return
  }

  const abortController = new AbortController()
  response.on('close', () => {
    if (!response.writableEnded) abortController.abort()
  })

  let mcpClient: Awaited<ReturnType<typeof createMCPClient>> | undefined
  try {
    console.info('Investigation request received.')
    mcpClient = await createMCPClient({
      transport: {
        type: 'http',
        url: mcpUrl,
        headers: { Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}` },
      },
    })
    const tools = await mcpClient.tools()
    console.info('Sanity Context MCP tools available:', Object.keys(tools).join(', ') || 'none')

    let streamFailure: unknown
    let streamedText = false
    const result = streamText({
      model: google.interactions(process.env.GOOGLE_GENERATIVE_AI_MODEL ?? 'gemini-3.8-flash'),
      system: [
        'You are CrisisIQ, an incident investigation analyst.',
        'For every user question, retrieve relevant information from the connected Sanity Context MCP tools before answering.',
        'Use initial_context to orient to the Sanity content and schema, then use the available content retrieval tools as needed.',
        'Ground factual claims only in retrieved Sanity content. Never substitute model knowledge for missing records.',
        'Clearly distinguish evidence, inference, uncertainty, and contradictions. Never declare a root cause unless the retrieved evidence supports it.',
        'If no relevant Sanity content is available, say so plainly and do not invent records or conclusions.',
      ].join(' '),
      messages,
      tools,
      stopWhen: isStepCount(10),
      abortSignal: abortController.signal,
      onStepFinish: ({ toolCalls }) => {
        if (toolCalls.length > 0) {
          console.info('Sanity Context MCP calls:', toolCalls.map((call) => call.toolName).join(', '))
        }
      },
      onError: ({ error }) => {
        streamFailure = error
        const detail = error instanceof Error ? error.message : 'Unknown model stream error.'
        console.error('Gemini stream failed:', detail)
      },
    })

    for await (const textPart of result.textStream) {
      if (abortController.signal.aborted) break
      streamedText ||= textPart.length > 0
      if (!response.headersSent) {
        response.status(200).set({
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'X-Content-Type-Options': 'nosniff',
          'X-Accel-Buffering': 'no',
        })
      }
      if (!response.write(textPart)) {
        await new Promise<void>((resolveDrain) => response.once('drain', resolveDrain))
      }
    }
    if (!response.headersSent && (!streamedText || streamFailure)) {
      response.status(502).json({
        error: streamFailure
          ? 'Gemini could not complete this investigation. The model may be busy or rate-limited; please try again later.'
          : 'Gemini returned an empty response. Please try again.',
      })
      return
    }
    if (!response.writableEnded) {
      response.end()
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown investigation error.'
    console.error('Sanity-backed investigation request failed:', detail)
    if (!response.headersSent) {
      response.status(502).json({ error: 'The live investigation could not complete. Check Sanity Context and model availability.' })
    } else if (!response.writableEnded) {
      response.end()
    }
  } finally {
    await mcpClient?.close().catch(() => undefined)
  }
})

const distDirectory = resolve('dist')
if (existsSync(distDirectory)) {
  app.use(express.static(distDirectory))
  app.get(/.*/, (_request, response) => response.sendFile(resolve(distDirectory, 'index.html')))
}

app.listen(port, () => {
  console.info(`CrisisIQ API listening on port ${port}`)
})