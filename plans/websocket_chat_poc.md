# WebSocket Chat POC using Remix

This proof-of-concept will integrate a real-time WebSocket chat into the existing Remix 3 application. We will migrate the server from `node-fetch-server` to `remix/node-serve`, which provides high-performance native `uWebSockets.js` integration. Then, we will set up a new route and controller for the chat UI, and build an interactive chat page that uses Remix's native `clientEntry` to handle the WebSocket connection and state.

## User Review Required

> [!IMPORTANT]
> Since `remix/node-serve` uses uWebSockets.js, the chat logic will use `ws.subscribe('chat')` and `ws.publish('chat', message, isBinary)` for native high-performance pub/sub broadcasting instead of manually keeping track of connections.

## Open Questions

> [!NOTE]
> 1. Should the chat keep a history of previous messages in memory so new connections can see them, or just broadcast new messages live? (The current plan is live broadcasting only).

## Proposed Changes

---

### Backend & WebSocket Server

#### [MODIFY] [server.ts](file:///c:/Users/npc112/Desktop/remix-app/server.ts)
- Replace `http.createServer` and `createRequestListener` with `serve` from `remix/node-serve`.
- Pass the existing `router.fetch` logic to `serve`.
- Use the `setup(app)` option in `serve()` to register a native uWS endpoint `app.ws('/ws/chat', { ... })`.
- Inside `app.ws`:
  - `open(ws)`: Call `ws.subscribe('chat')`.
  - `message(ws, message, isBinary)`: Call `ws.publish('chat', message, isBinary)`.
- Update the graceful shutdown logic to use `server.close()`.

#### [MODIFY] [package.json](file:///c:/Users/npc112/Desktop/remix-app/package.json)
- (No new dependencies needed since `remix/node-serve` is built-in).

---

### Route Configuration

#### [MODIFY] [app/routes.ts](file:///c:/Users/npc112/Desktop/remix-app/app/routes.ts)
- Add a new route definition for the chat page: `chat: route('/chat')`.

#### [NEW] [app/actions/chat/controller.tsx](file:///c:/Users/npc112/Desktop/remix-app/app/actions/chat/controller.tsx)
- Create a dedicated controller for the `/chat` route.
- Implement the `index` action to return `context.render(<ChatPage />)`.

#### [MODIFY] [app/router.ts](file:///c:/Users/npc112/Desktop/remix-app/app/router.ts)
- Map the new `routes.chat` to the new `chatController`.

---

### UI Components

#### [NEW] [app/ui/chat-page.tsx](file:///c:/Users/npc112/Desktop/remix-app/app/ui/chat-page.tsx)
- Build the `ChatPage` UI shell containing a message list area and a text input form.
- Use `clientEntry(...)` to handle browser interactivity without React hooks.
- Inside `clientEntry`:
  - Open `new WebSocket('ws://' + window.location.host + '/ws/chat')`.
  - Maintain an array `let messages: string[] = []`.
  - On `ws.onmessage`, push the incoming message and call `handle.update()` to re-render.
  - Intercept the form submission using `on('submit', (e) => { ... })`.
  - Prevent default submission, read the input value, call `ws.send()`, and clear the input.

## Verification Plan

### Automated Tests
- Run `npm run typecheck` to ensure the updated server and route typings compile correctly.

### Manual Verification
1. Open `http://localhost:44100/chat` in two separate browser windows.
2. Send a message from Window A.
3. Verify that the message instantly appears in both Window A and Window B via the native pub/sub system.
