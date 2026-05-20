import { clientEntry, css, on, ref, type Handle } from "remix/ui";

import { Document } from "./document.tsx";

export function ChatPage() {
  return () => (
    <Document>
      <main
        mix={css({
          padding: "2rem",
          maxWidth: "600px",
          margin: "0 auto",
          fontFamily: "sans-serif",
        })}
      >
        <h1>WebSocket Chat POC</h1>
        <ChatClient />
      </main>
    </Document>
  );
}

export const ChatClient = clientEntry(
  import.meta.url,
  function ChatClient(handle: Handle) {
    let messages: string[] = [];
    let ws: WebSocket | null = null;
    let inputRef = { current: null as HTMLInputElement | null };

    if (typeof window !== "undefined" && !ws) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        messages.push("[System: Connected]");
        handle.update();
      };

      ws.onmessage = (event) => {
        console.log("event", event);
        const data = event.data;
        if (typeof data === "string") {
          messages.push(data);
          handle.update();
        } else {
          data.text().then((text: string) => {
            messages.push(text);
            handle.update();
          });
        }
      };

      ws.onclose = () => {
        messages.push("[System: Disconnected]");
        handle.update();
      };
    }

    return () => (
      <div mix={css({ display: "flex", flexDirection: "column", gap: "1rem" })}>
        <div
          mix={css({
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "1rem",
            minHeight: "300px",
            maxHeight: "400px",
            overflowY: "auto",
            backgroundColor: "#f9f9f9",
          })}
        >
          {messages.length === 0 ? (
            <p mix={css({ color: "#888", fontStyle: "italic" })}>
              No messages yet...
            </p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                mix={css({
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #eee",
                })}
              >
                {msg}
              </div>
            ))
          )}
        </div>

        <form
          mix={[
            on("submit", (e) => {
              e.preventDefault();
              const input = inputRef.current;
              if (
                input &&
                ws &&
                ws.readyState === WebSocket.OPEN &&
                input.value.trim() !== ""
              ) {
                ws.send(input.value);
                input.value = "";
              }
            }),
            css({
              display: "flex",
              gap: "0.5rem",
            }),
          ]}
        >
          <input
            type="text"
            placeholder="Type a message..."
            autoComplete="off"
            mix={[
              ref((node) => {
                inputRef.current = node as HTMLInputElement;
              }),
              css({
                flex: 1,
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }),
            ]}
          />
          <button
            type="submit"
            mix={css({
              padding: "0.5rem 1rem",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              ":hover": { backgroundColor: "#005bb5" },
            })}
          >
            Send
          </button>
        </form>
      </div>
    );
  },
);
