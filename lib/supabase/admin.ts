import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, serverEnv } from "@/lib/config";

/** Service-role Supabase client. Bypasses RLS - SERVER ONLY, never import
 * from client components. Used by the Stripe webhook to upsert subscriptions
 * and by the entitlement route to read a user's row. */
export function createSupabaseAdminClient() {
  return createClient(SUPABASE_URL, serverEnv.supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
