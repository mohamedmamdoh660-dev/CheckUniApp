// ══════════════════════════════════════════════════════════
//  SIT CONNECT AI — Background Service Worker
//  Handles n8n fetch + chat history persistence via API.
// ══════════════════════════════════════════════════════════

const N8N_WEBHOOK_URL    = "https://darwish1.daxow.com/webhook/daxow-extensions";
const CHAT_HISTORY_URL   = "https://darwish1.daxow.com/webhook/extension-chat";

// ── Call the chat history API ──────────────────────────────
async function chatHistoryAPI(payload) {
  const res = await fetch(CHAT_HISTORY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`History API error: ${res.status}`);
  return res.json();
}

// ── Listen for messages from popup ────────────────────────
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {

  // ─── CHAT: Send message to n8n AI + save to DB ──────────
  if (request.action === "chat") {
    const { agent_id, email, message, session_id } = request;

    (async () => {
      try {
        // Save user message to DB
        await chatHistoryAPI({
          action: "save",
          agent_id,
          session_id,
          role: "user",
          content: message,
        });

        // Send to AI
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_id, email, message }),
        });

        if (!response.ok) throw new Error(`Webhook error: ${response.status}`);

        const data = await response.json();
        const aiText = data.output || data.message || data.response || data.text
                     || JSON.stringify(data);

        // Save AI response to DB
        await chatHistoryAPI({
          action: "save",
          agent_id,
          session_id,
          role: "ai",
          content: aiText,
        });

        sendResponse({ ok: true, text: aiText });
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
    })();

    return true;
  }

  // ─── LOAD: Get messages for a session ───────────────────
  if (request.action === "load-history") {
    const { agent_id, session_id } = request;

    (async () => {
      try {
        const data = await chatHistoryAPI({
          action: "load",
          agent_id,
          session_id,
        });
        sendResponse({ ok: true, messages: data.messages || [] });
      } catch (err) {
        sendResponse({ ok: false, messages: [], error: err.message });
      }
    })();

    return true;
  }

  // ─── SESSIONS: List all recent sessions ─────────────────
  if (request.action === "load-sessions") {
    const { agent_id } = request;

    (async () => {
      try {
        const data = await chatHistoryAPI({
          action: "sessions",
          agent_id,
        });
        sendResponse({ ok: true, sessions: data.sessions || [] });
      } catch (err) {
        sendResponse({ ok: false, sessions: [], error: err.message });
      }
    })();

    return true;
  }

  return false;
});
