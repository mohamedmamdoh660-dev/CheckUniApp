# Daxow AI Assistant - Chrome Extension

> 🤖 AI-powered assistant for Daxow Portal agents. Chat with an AI to instantly query your student data.

---

## 📁 Folder Structure

```
chrome-extension/
├── manifest.json       ← Extension config
├── popup.html          ← UI (Login + Chat screens)
├── popup.css           ← Premium dark-mode styles
├── popup.js            ← Full logic (auth + chat)
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## ⚙️ Setup Before Installing

Open `popup.js` and fill in **3 values**:

```js
const SUPABASE_URL     = "https://knqtjanxjwfjfrwoater.supabase.co";   // ✅ Already filled
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE";               // ← Paste your ANON KEY
const N8N_WEBHOOK_URL  = "YOUR_N8N_WEBHOOK_URL_HERE";                  // ← Paste your n8n webhook
```

**Where to get these:**
- `SUPABASE_ANON_KEY` → Supabase Dashboard → Project Settings → API → `anon public`
- `N8N_WEBHOOK_URL` → Your n8n workflow → Webhook Node → Production URL

---

## 📦 How to Add Icons

Create an `icons/` folder inside `chrome-extension/` and add 3 PNG images:
- `icon16.png`  (16×16 px)
- `icon48.png`  (48×48 px)
- `icon128.png` (128×128 px)

> 💡 You can use any logo/icon generator, or just copy your existing logo.

---

## 🚀 How to Install in Chrome

1. Open Chrome and go to: `chrome://extensions/`
2. Enable **Developer Mode** (top-right toggle)
3. Click **"Load unpacked"**
4. Select the `chrome-extension/` folder
5. The extension icon will appear in your Chrome toolbar! 🎉

---

## 🔗 How n8n Should Work

When an agent sends a message, the extension POSTs this to your n8n webhook:

```json
{
  "agent_id": "fdfb247c-196a-41eb-abd0-fab3aa25cfff",
  "email": "agent@daxow.com",
  "message": "How many students are in pending review?"
}
```

Your n8n workflow should:
1. Receive this payload via **Webhook Node**
2. Pass `message` to an **AI Agent Node**
3. Give the AI a **Postgres/GraphQL Tool** to query Supabase
4. In the AI System Prompt, enforce: `"Only return data where agency_id = {{ $json.agent_id }}"`
5. Return the AI response as JSON: `{ "output": "You have 12 students in pending review." }`

---

## ✅ Features

- 🔐 Secure login using **same Supabase credentials** as the portal
- 🔒 Session saved in `chrome.storage.local` (auto-login on reopen)
- 🤖 AI chat powered by your n8n workflow
- 🛡️ Agent sees **only their own students** (filtered by `agency_id`)
- 🌙 Premium dark-mode UI
- ⌨️ Press `Enter` to send, `Shift+Enter` for new line
