import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel doesn't allow env var names containing "PUBLIC", so the browser-
  // facing values are stored as NEXT_SUPABASE_* and re-exposed here under the
  // NEXT_PUBLIC_ prefix Next.js requires to inline them into the client bundle.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
