import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/config";

/* Keeps people signed in.
 *
 * Supabase access tokens expire ~hourly. This runs on every request, and
 * `getUser()` silently exchanges the long-lived refresh token for a fresh
 * access token when needed, writing the renewed cookies back to the browser.
 * Without it the session simply lapses and users are forced to log in again.
 * (Next 16 renamed the `middleware` convention to `proxy`; same mechanism.) */

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Refreshes the token (via setAll above) when the access token is stale.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on every path except static assets - including API routes, so
     * their cookies get refreshed too. Skips:
     * - _next/static, _next/image (build output & optimized images)
     * - favicon.ico and common image files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)",
  ],
};
