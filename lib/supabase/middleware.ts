import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PORTAL_HOME: Record<string, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
};

/**
 * Refreshes the auth session on every request (required for SSR cookie-based
 * auth to stay in sync) and guards the three portals by the signed-in user's
 * role, which lives in `profiles` rather than the JWT.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_SUPABASE_URL!,
    process.env.NEXT_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname === "/login" || pathname.startsWith("/login/");
  const portalMatch = pathname.match(/^\/(admin|teacher|student)(\/|$)/);

  if (!user) {
    if (portalMatch) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return response;
  }

  // Signed in: look up role/status so we can keep them out of the wrong
  // portal and out of pending staff accounts.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  // No profile row (a lookup error, or a rare race right after signup before
  // the trigger lands) must fail closed, not fall through to unrestricted
  // access - treat it the same as "pending" rather than skip every gate
  // below just because `home` ends up undefined.
  if (!profile) {
    if (portalMatch && pathname !== "/login/pending") {
      const url = request.nextUrl.clone();
      url.pathname = "/login/pending";
      return NextResponse.redirect(url);
    }
    return response;
  }

  const role = profile.role;
  const home = role ? PORTAL_HOME[role] : undefined;

  if (profile.status === "pending") {
    if (pathname !== "/login/pending") {
      const url = request.nextUrl.clone();
      url.pathname = "/login/pending";
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (profile.status === "suspended") {
    if (pathname !== "/login/suspended") {
      const url = request.nextUrl.clone();
      url.pathname = "/login/suspended";
      return NextResponse.redirect(url);
    }
    return response;
  }

  if (isAuthRoute && home) {
    const url = request.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }

  if (portalMatch && home && !pathname.startsWith(home)) {
    const url = request.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }

  return response;
}
