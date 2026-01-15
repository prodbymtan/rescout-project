import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths that DON'T require auth
  const publicPaths = ["/login", "/api/login", "/api/logout", "/profile", "/api/profile"];

  const isPublic = publicPaths.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Static files and Next internals are handled in config.matcher below

  if (isPublic) {
    return NextResponse.next();
  }

  const authCookie = req.cookies.get("scout_auth");

  if (!authCookie) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if profile is set (required after login)
  const profileCookie = req.cookies.get("scout_profile");
  if (!profileCookie && pathname !== "/profile") {
    const profileUrl = new URL("/profile", req.url);
    profileUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(profileUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all paths except:
    // - _next (static files)
    // - api routes other than /api/login (customize if needed)
    // - static files like favicon
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
