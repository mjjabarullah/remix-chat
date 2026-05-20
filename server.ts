import { serve } from 'remix/node-serve'

import { router } from './app/router.ts'

const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 44100

const server = serve(
  async (request) => {
    try {
      return await router.fetch(request)
    } catch (error) {
      console.error(error)
      return new Response('Internal Server Error', { status: 500 })
    }
  },
  {
    port,
    setup(app) {
      app.ws('/ws/chat', {
        open(ws) {
          ws.subscribe('chat')
        },
        message(ws, message, isBinary) {
          ws.publish('chat', message, isBinary)
          ws.send(message, isBinary)
        },
      })
    },
  },
)

await server.ready
console.log(`Server listening on http://localhost:${server.port}`)

let shuttingDown = false

function shutdown() {
  if (shuttingDown) {
    return
  }

  shuttingDown = true
  server.close()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
