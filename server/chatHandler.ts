import { google } from '@ai-sdk/google'
import { createMCPClient } from '@ai-sdk/mcp'
import { isStepCount, streamText, type ModelMessage } from 'ai'
import type { IncomingMessage, ServerResponse } from 'node:http'

const mcpUrl = 'https://api.sanity.io/v1/context/organizations/obxrne2do/mcp/crisisiq-investigation'

type ChatRequest = IncomingMessage & { body?: unknown }

function sendJson(response: ServerResponse, statusCode: number, payload: { error: string }) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

export async function handleChat(request: ChatRequest, response: ServerResponse): Promise<void> {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    sendJson(response, 405, { error: 'Method not allowed.' })
    return
  }

  const body = (request.body ?? {}) as { messages?: unknown }
  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 20) {
    sendJson(response, 400, { error: 'Send between 1 and 20 chat messages.' })
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
      sendJson(response, 400, { error: 'Each message must have a user or assistant role and text content under 4,000 characters.' })
      return
    }
    messages.push({ role: item.role, content: item.content })
  }

  // Support the canonical names plus the shorter aliases people commonly use in Vercel.
  // Secrets stay server-side and are never exposed to the browser.
  const sanityToken = process.env.SANITY_API_READ_TOKEN ?? process.env.SANITY_CONTEXT_TOKEN
  const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY

  if (!sanityToken || !googleApiKey) {
    const missing = [
      !sanityToken ? 'SANITY_API_READ_TOKEN (Sanity Context viewer token)' : null,
      !googleApiKey ? 'GOOGLE_GENERATIVE_AI_API_KEY (Gemini API key)' : null,
    ].filter(Boolean).join(' and ')
    sendJson(response, 503, {
      error: `The live investigation service is not configured yet. Missing ${missing}. Add these as Vercel server environment variables, then redeploy.`,
    })
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
        headers: { Authorization: `Bearer ${sanityToken}` },
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
        if (toolCalls.length > 0) console.info('Sanity Context MCP calls:', toolCalls.map((call) => call.toolName).join(', '))
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
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/plain; charset=utf-8')
        response.setHeader('Cache-Control', 'no-cache, no-transform')
        response.setHeader('X-Content-Type-Options', 'nosniff')
        response.setHeader('X-Accel-Buffering', 'no')
      }
      if (!response.write(textPart)) await new Promise<void>((resolveDrain) => response.once('drain', resolveDrain))
    }

    if (!response.headersSent && (!streamedText || streamFailure)) {
      sendJson(response, 502, {
        error: streamFailure
          ? 'Gemini could not complete this investigation. The model may be busy or rate-limited; please try again later.'
          : 'Gemini returned an empty response. Please try again.',
      })
      return
    }
    if (!response.writableEnded) response.end()
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown investigation error.'
    console.error('Sanity-backed investigation request failed:', detail)
    if (!response.headersSent) sendJson(response, 502, { error: 'The live investigation could not complete. Check the Sanity Context connection, token, and Gemini model configuration.' })
    else if (!response.writableEnded) response.end()
  } finally {
    await mcpClient?.close().catch(() => undefined)
  }
}
