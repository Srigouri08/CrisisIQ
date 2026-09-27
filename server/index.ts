import { config } from 'dotenv'
import express, { type Request, type Response } from 'express'
import { handleChat } from './chatHandler.js'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

config({ path: '.env.local' })

const app = express()
const port = Number(process.env.PORT ?? 3001)

app.use(express.json({ limit: '32kb' }))

app.post('/api/chat', (request: Request, response: Response) => {
  void handleChat(request, response)
})

const distDirectory = resolve('dist')
if (existsSync(distDirectory)) {
  app.use(express.static(distDirectory))
  app.get(/.*/, (_request, response) => response.sendFile(resolve(distDirectory, 'index.html')))
}

app.listen(port, () => {
  console.info(`CrisisIQ API listening on port ${port}`)
})