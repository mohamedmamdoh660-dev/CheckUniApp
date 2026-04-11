// ══════════════════════════════════════════════════
//  DAXOW AI ASSISTANT - Chrome Extension
//  Connects to same Supabase DB as Daxow Portal
// ══════════════════════════════════════════════════

// ─── CONFIG ──────────────────────────────────────
// Replace these with your actual keys (same as your .env.local)
const SUPABASE_URL     = "https://knqtjanxjwfjfrwoater.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtucXRqYW54andmamZyd29hdGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTczMjQsImV4cCI6MjA2OTg3MzMyNH0.r0l1zFcBQdx4tBxpp6413r5MXAmy-1Ew2TnQ8QNVB2g";
const N8N_WEBHOOK_URL  = "https://darwish1.daxow.com/webhook/daxow-extensions";

// ─── DOM REFS ─────────────────────────────────────
const loginScreen   = document.getElementById("login-screen");
const chatScreen    = document.getElementById("chat-screen");
const loginForm     = document.getElementById("login-form");
const emailInput    = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn      = document.getElementById("login-btn");
const loginBtnText  = document.getElementById("login-btn-text");
const loginSpinner  = document.getElementById("login-spinner");
const loginError    = document.getElementById("login-error");
const logoutBtn     = document.getElementById("logout-btn");
const userEmailBadge = document.getElementById("user-email-badge");
const messagesEl    = document.getElementById("messages");
const chatInput     = document.getElementById("chat-input");
const sendBtn       = document.getElementById("send-btn");

// ─── SUPABASE CLIENT (no npm, pure fetch) ─────────
const supabase = {
  auth: {
    signIn: async (email, password) => {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error_description || data.msg || "Login failed");
      return data;
    },
  }
};

// ─── SESSION STORAGE ──────────────────────────────
// Supports both Chrome Extension (chrome.storage) and regular browser (localStorage)
const SESSION_KEY = "daxow_ext_session";
const isChromeExt = typeof chrome !== "undefined" && chrome.storage?.local;

async function saveSession(session) {
  if (isChromeExt) {
    return new Promise(resolve => chrome.storage.local.set({ [SESSION_KEY]: session }, resolve));
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

async function getSession() {
  if (isChromeExt) {
    return new Promise(resolve => {
      chrome.storage.local.get(SESSION_KEY, result => resolve(result[SESSION_KEY] || null));
    });
  } else {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}

async function clearSession() {
  if (isChromeExt) {
    return new Promise(resolve => chrome.storage.local.remove(SESSION_KEY, resolve));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

// ─── SESSION / CHAT TABS MANAGEMENT ──────────────
const SESSION_ID_KEY = "daxow_current_session";

let currentSessionId = null;

// Generate a short unique session ID
function generateSessionId() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 8);
}

async function getCurrentSessionId() {
  if (currentSessionId) return currentSessionId;
  if (isChromeExt) {
    const result = await new Promise(r =>
      chrome.storage.local.get(SESSION_ID_KEY, res => r(res[SESSION_ID_KEY] || null))
    );
    return result;
  }
  return localStorage.getItem(SESSION_ID_KEY);
}

async function setCurrentSessionId(id) {
  currentSessionId = id;
  if (isChromeExt) {
    return new Promise(r => chrome.storage.local.set({ [SESSION_ID_KEY]: id }, r));
  }
  localStorage.setItem(SESSION_ID_KEY, id);
}

// ─── CHAT TABS DOM REFS ──────────────────────────
const sessionTabsEl = document.getElementById("session-tabs");
const newChatBtn    = document.getElementById("new-chat-btn");
const welcomeMsg    = document.getElementById("welcome-msg");

// ─── INIT ──────────────────────────────────────────
function init() {
  showLogin();
  getSession().then(session => {
    if (session?.user?.id) {
      showChat(session);
    }
  });
}

// ─── SCREENS ──────────────────────────────────────
function showLogin() {
  loginScreen.classList.remove("hidden");
  chatScreen.classList.add("hidden");
  loginError.classList.add("hidden");
  emailInput.value = "";
  passwordInput.value = "";
}

async function showChat(session) {
  loginScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");
  userEmailBadge.textContent = session.user.email || "Agent";

  // Load or create session
  let sessionId = await getCurrentSessionId();
  if (!sessionId) {
    sessionId = generateSessionId();
    await setCurrentSessionId(sessionId);
  }

  // Load tabs + messages
  await loadSessionTabs(session.user.id);
  await loadSessionMessages(session.user.id, sessionId);
}

// ─── TAB MANAGEMENT ──────────────────────────────
async function loadSessionTabs(agentId) {
  try {
    const result = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "load-sessions", agent_id: agentId },
        res => {
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          else resolve(res);
        }
      );
    });

    renderTabs(result.ok ? result.sessions : []);
  } catch (e) {
    renderTabs([]);
  }
}

function renderTabs(sessions) {
  sessionTabsEl.innerHTML = "";
  if (sessions.length === 0) return;

  sessions.forEach(s => {
    const tab = document.createElement("button");
    tab.className = "session-tab" + (s.session_id === currentSessionId ? " active" : "");
    tab.dataset.sessionId = s.session_id;
    tab.textContent = s.first_message || "New Chat";
    tab.title = s.first_message || "New conversation";
    tab.addEventListener("click", () => switchSession(s.session_id));
    sessionTabsEl.appendChild(tab);
  });
}

async function switchSession(sessionId) {
  await setCurrentSessionId(sessionId);
  const session = await getSession();
  if (!session) return;

  // Clear messages and reload
  messagesEl.innerHTML = "";
  await loadSessionMessages(session.user.id, sessionId);

  // Update active tab
  document.querySelectorAll(".session-tab").forEach(t =>
    t.classList.toggle("active", t.dataset.sessionId === sessionId)
  );
}

async function startNewChat() {
  const newId = generateSessionId();
  await setCurrentSessionId(newId);

  // Clear messages, show welcome
  messagesEl.innerHTML = "";
  const welcomeDiv = document.createElement("div");
  welcomeDiv.className = "message ai-message";
  welcomeDiv.id = "welcome-msg";
  welcomeDiv.innerHTML = `
    <div class="msg-bubble">
      Hi there! 👋 I'm <strong>Sayeed</strong>, your AI assistant from <strong>SIT Connect</strong>.<br/><br/>
      How can I help you today?
    </div>
    <span class="msg-time">just now</span>
  `;
  messagesEl.appendChild(welcomeDiv);

  // Reload tabs
  const session = await getSession();
  if (session) await loadSessionTabs(session.user.id);
}

// ─── LOAD MESSAGES FROM API ──────────────────────
async function loadSessionMessages(agentId, sessionId) {
  try {
    const result = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "load-history", agent_id: agentId, session_id: sessionId },
        res => {
          if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
          else resolve(res);
        }
      );
    });

    if (result.ok && result.messages.length > 0) {
      // Hide welcome message
      const welcome = messagesEl.querySelector("#welcome-msg");
      if (welcome) welcome.remove();

      result.messages.forEach(msg =>
        appendMessageDOM(msg.role, msg.content, msg.time)
      );
    }
  } catch (e) {
    // Silently fail — show welcome message
  }
}

newChatBtn.addEventListener("click", startNewChat);

// ─── LOGIN ─────────────────────────────────────────
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email    = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) return;

  // Loading state
  loginBtnText.textContent = "Signing in...";
  loginSpinner.classList.remove("hidden");
  loginBtn.disabled = true;
  loginError.classList.add("hidden");

  try {
    const data = await supabase.auth.signIn(email, password);

    // Build session object
    const session = {
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      user: {
        id:    data.user.id,
        email: data.user.email,
      }
    };

    await saveSession(session);
    showChat(session);

  } catch (err) {
    loginError.textContent = err.message || "Invalid email or password. Please try again.";
    loginError.classList.remove("hidden");
  } finally {
    loginBtnText.textContent = "Sign In";
    loginSpinner.classList.add("hidden");
    loginBtn.disabled = false;
  }
});

// ─── LOGOUT ────────────────────────────────────────
logoutBtn.addEventListener("click", async () => {
  await clearSession();
  currentSessionId = null;
  if (isChromeExt) {
    await new Promise(r => chrome.storage.local.remove(SESSION_ID_KEY, r));
  } else {
    localStorage.removeItem(SESSION_ID_KEY);
  }
  sessionTabsEl.innerHTML = "";
  messagesEl.innerHTML = `
    <div class="message ai-message" id="welcome-msg">
      <div class="msg-bubble">
        Hi there! 👋 I'm <strong>Sayeed</strong>, your AI assistant from <strong>SIT Connect</strong>.<br/><br/>
        How can I help you today?
      </div>
      <span class="msg-time">just now</span>
    </div>`;
  showLogin();
});

// ─── CHAT ──────────────────────────────────────────
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Render-only — append a message bubble to the DOM
function appendMessageDOM(role, text, time) {
  // Remove welcome message if present
  const welcome = messagesEl.querySelector("#welcome-msg");
  if (welcome) welcome.remove();

  const div      = document.createElement("div");
  const bubble   = document.createElement("div");
  const timeSpan = document.createElement("span");

  div.classList.add("message");
  bubble.classList.add("msg-bubble");
  timeSpan.classList.add("msg-time");
  timeSpan.textContent = time || formatTime(new Date());

  if (role === "user") {
    div.classList.add("user-message");
    bubble.textContent = text;
  } else {
    div.classList.add("ai-message");
    bubble.innerHTML = text.replace(/\n/g, "<br/>");
  }

  div.appendChild(bubble);
  div.appendChild(timeSpan);
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

function showTyping() {
  const div    = document.createElement("div");
  const bubble = document.createElement("div");
  div.classList.add("message", "ai-message");
  bubble.classList.add("typing-bubble");
  bubble.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  div.appendChild(bubble);
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  chatInput.value = "";
  chatInput.style.height = "auto";
  sendBtn.disabled = true;

  // Render user message immediately
  appendMessageDOM("user", text);

  const typingEl = showTyping();

  try {
    const session = await getSession();
    if (!session) { showLogin(); return; }

    const sessionId = await getCurrentSessionId();

    // Send to background (saves user msg + fetches AI + saves AI msg)
    const result = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action:     "chat",
          agent_id:   session.user.id,
          email:      session.user.email,
          message:    text,
          session_id: sessionId,
        },
        (res) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(res);
          }
        }
      );
    });

    typingEl.remove();

    if (result.ok) {
      appendMessageDOM("ai", result.text);
      // Refresh tabs (new session might show up)
      await loadSessionTabs(session.user.id);
    } else {
      throw new Error(result.error || "Unknown error");
    }

  } catch (err) {
    typingEl.remove();
    appendMessageDOM("ai", `⚠️ Sorry, I encountered an error: ${err.message}\nPlease try again.`);
  } finally {
    sendBtn.disabled = false;
    chatInput.focus();
  }
}

// ─── SEND TRIGGERS ─────────────────────────────────
sendBtn.addEventListener("click", sendMessage);

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Auto-resize textarea
chatInput.addEventListener("input", () => {
  chatInput.style.height = "auto";
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
});

// ─── START ─────────────────────────────────────────

// ══════════════════════════════════════════════
//  SETTINGS PANEL
// ══════════════════════════════════════════════
const settingsBtn    = document.getElementById("settings-btn");
const settingsPanel  = document.getElementById("settings-panel");
const settingsClose  = document.getElementById("settings-close");
const settingsLogout = document.getElementById("settings-logout");
const settingsEmail  = document.getElementById("settings-email");
const themeBtns      = document.querySelectorAll(".theme-btn");

const THEME_KEY = "daxow_theme";

async function applyTheme(theme) {
  if (isChromeExt) {
    await new Promise(r => chrome.storage.local.set({ [THEME_KEY]: theme }, r));
  } else {
    localStorage.setItem(THEME_KEY, theme);
  }
  renderTheme(theme);
}

function renderTheme(theme) {
  const root = document.documentElement;
  root.removeAttribute("data-theme");
  if (theme === "light") root.setAttribute("data-theme", "light");
  if (theme === "dark")  root.setAttribute("data-theme", "dark");
  themeBtns.forEach(btn => btn.classList.toggle("active", btn.dataset.theme === theme));
}

async function loadTheme() {
  let theme = "auto";
  if (isChromeExt) {
    theme = await new Promise(r =>
      chrome.storage.local.get(THEME_KEY, res => r(res[THEME_KEY] || "auto"))
    );
  } else {
    theme = localStorage.getItem(THEME_KEY) || "auto";
  }
  renderTheme(theme);
}

settingsBtn.addEventListener("click", async () => {
  const session = await getSession();
  settingsEmail.textContent = session?.user?.email || "";
  settingsPanel.classList.remove("hidden");
});

settingsClose.addEventListener("click", () => settingsPanel.classList.add("hidden"));

settingsPanel.addEventListener("click", (e) => {
  if (e.target === settingsPanel) settingsPanel.classList.add("hidden");
});

themeBtns.forEach(btn => btn.addEventListener("click", () => applyTheme(btn.dataset.theme)));

settingsLogout.addEventListener("click", async () => {
  await clearSession();
  settingsPanel.classList.add("hidden");
  showLogin();
});

// ══════════════════════════════════════════════
//  SLASH COMMANDS
// ══════════════════════════════════════════════
const slashMenu   = document.getElementById("slash-menu");
const slashMain   = document.getElementById("slash-main");
const slashSearch = document.getElementById("slash-search");
const slashList   = document.getElementById("slash-list");

// Prompt templates for search actions
const searchPrompts = {
  "search-name":        "Search student by name: ",
  "search-email":       "Search student by email: ",
  "search-phone":       "Search student by phone: ",
  "search-passport":    "Search student by passport: ",
  "search-application": "Search application by ID: ",
  "search-program":     "Search program: ",
  "search-other":       "Search student: ",
};

function showSlashMenu() {
  slashMain.classList.remove("hidden");
  slashSearch.classList.add("hidden");
  slashList.classList.add("hidden");
  slashMenu.classList.remove("hidden");
}

function hideSlashMenu() {
  slashMenu.classList.add("hidden");
}

function showSlashLevel(level) {
  slashMain.classList.add("hidden");
  slashSearch.classList.add("hidden");
  slashList.classList.add("hidden");
  document.getElementById("slash-" + level)?.classList.remove("hidden");
}

// Detect / key in input
chatInput.addEventListener("input", () => {
  const val = chatInput.value;
  if (val === "/") {
    showSlashMenu();
  } else if (!val.startsWith("/")) {
    hideSlashMenu();
  }

  // Auto-resize
  chatInput.style.height = "auto";
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + "px";
});

// Main command clicks
slashMain.querySelectorAll(".slash-item").forEach(btn => {
  btn.addEventListener("click", () => {
    const cmd = btn.dataset.cmd;
    if (cmd === "search") {
      showSlashLevel("search");
    } else if (cmd === "list") {
      showSlashLevel("list");
    } else if (cmd === "other") {
      // Just clear the / and let them type freely
      chatInput.value = "";
      chatInput.placeholder = "Ask me anything...";
      hideSlashMenu();
      chatInput.focus();
    }
  });
});

// Search sub-command clicks
slashSearch.querySelectorAll(".slash-item").forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;
    const prompt = searchPrompts[action] || "Search: ";
    chatInput.value = prompt;
    hideSlashMenu();
    chatInput.focus();
    chatInput.setSelectionRange(prompt.length, prompt.length);
  });
});

// List sub-command click (Coming Soon)
slashList.querySelectorAll(".slash-item").forEach(btn => {
  btn.addEventListener("click", () => {
    chatInput.value = "";
    hideSlashMenu();
    // Show auto-message
    appendMessageDOM("ai", "📋 List features are coming soon! We're working hard to bring you powerful student list views and reports. Stay tuned!");
    chatInput.focus();
  });
});

// Back buttons
document.querySelectorAll(".slash-back").forEach(btn => {
  btn.addEventListener("click", () => {
    showSlashLevel(btn.dataset.back);
  });
});

// Close menu on Escape
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    hideSlashMenu();
    chatInput.value = "";
  }
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (!slashMenu.contains(e.target) && e.target !== chatInput) {
    hideSlashMenu();
  }
});

loadTheme();
init();
