import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleChat } from '../server/chatHandler.js'

export default function chat(request: VercelRequest, response: VercelResponse) {
  return handleChat(request, response)
}
