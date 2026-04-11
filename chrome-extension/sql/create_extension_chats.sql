-- ═══════════════════════════════════════════════════════
-- SIT Connect AI Extension — Chat History Table
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS extension_chats (
  id          bigserial    PRIMARY KEY,
  agent_id    uuid         NOT NULL,
  session_id  text         NOT NULL,
  role        text         NOT NULL CHECK (role IN ('user', 'ai')),
  content     text         NOT NULL,
  created_at  timestamptz  NOT NULL DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_ext_chats_agent     ON extension_chats(agent_id);
CREATE INDEX IF NOT EXISTS idx_ext_chats_session   ON extension_chats(session_id);
CREATE INDEX IF NOT EXISTS idx_ext_chats_created   ON extension_chats(created_at DESC);

-- RLS: agents can only see their own chats
ALTER TABLE extension_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents see own chats"
  ON extension_chats FOR SELECT
  USING (agent_id = auth.uid());

CREATE POLICY "Agents insert own chats"
  ON extension_chats FOR INSERT
  WITH CHECK (agent_id = auth.uid());

-- Auto-cleanup: delete chats older than 24 hours (run via pg_cron or scheduled task)
-- SELECT cron.schedule('cleanup-old-chats', '0 * * * *', $$DELETE FROM extension_chats WHERE created_at < now() - interval '24 hours'$$);
