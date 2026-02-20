import { createBrowserClient } from "@supabase/ssr";

// Singleton instance to avoid "Multiple GoTrueClient instances" warning
let _supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function supabaseServerClient() {
  if (!_supabaseClient) {
    _supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabaseClient;
}
