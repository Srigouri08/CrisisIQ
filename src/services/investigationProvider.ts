export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

export async function streamInvestigation(
  messages: ChatTurn[],
  onText: (text: string) => void,
): Promise<void> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })

  if (!response.ok) {
    const result = await response.json() as { error?: string }
    throw new Error(result.error ?? 'The investigation request failed.')
  }
  if (!response.body) throw new Error('The investigation response did not include a stream.')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      onText(decoder.decode(value, { stream: true }))
    }
    const remaining = decoder.decode()
    if (remaining) onText(remaining)
  } finally {
    reader.releaseLock()
  }
}