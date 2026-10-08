"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";

/**
 * Every other auth entry point in this app (Google OAuth, email
 * confirmation) uses the PKCE flow - the browser-side client that starts
 * it carries a code_challenge, so GoTrue's /auth/v1/verify redirects back
 * with a server-visible `?code=...` that app/auth/callback/route.ts
 * exchanges for a session.
 *
 * admin.auth.admin.inviteUserByEmail() (app/admin/students/actions.ts's
 * inviteGuardian) has no such client-side origin - it's called from the
 * service-role client - so GoTrue falls back to the implicit flow and
 * redirects with `#access_token=...` in the URL *fragment*, which never
 * reaches the server at all. This is the only place that needs to pick
 * that up: mounted once in the root layout so it works no matter which
 * page the redirect happens to land on, it hands the tokens to the
 * browser client (which persists them as cookies via @supabase/ssr) and
 * sends the now-signed-in guardian to /set-password.
 */
export function HashSessionListener() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("access_token")) return;

    const params = new URLSearchParams(hash.slice(1));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (!access_token || !refresh_token) return;

    // Calling setSession() directly rather than relying on the client's
    // own automatic hash detection (detectSessionInUrl) - that path races
    // against React's dev-mode double-effect-invocation (StrictMode mounts,
    // unmounts, and remounts this component, and the first instance's
    // in-flight detection loses its only subscriber to the unmount before
    // it resolves). Explicitly handing off the tokens is deterministic.
    //
    // An invited guardian has no password yet (inviteUserByEmail never
    // collects one) - this session only proves they own the invite email,
    // so /set-password is where they choose one before landing in /parent.
    createClient()
      .auth.setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (!error) window.location.replace("/set-password");
      });
  }, []);

  return null;
}
