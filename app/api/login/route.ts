import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const password = formData.get("password");
  const from = (formData.get("from") as string) || "/";

  const correctPassword = process.env.SCOUT_PASSWORD;

  if (!correctPassword) {
    console.error("SCOUT_PASSWORD is not set in env");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  if (password !== correctPassword) {
    // Redirect back to login with an error param
    const url = new URL("/login", req.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("from", from);
    return NextResponse.redirect(url);
  }

  // Password good → set cookie + redirect to profile selection
  // Profile selection will then redirect to the original destination
  const profileUrl = new URL("/profile", req.url);
  profileUrl.searchParams.set("from", from);
  const res = NextResponse.redirect(profileUrl);

  // Super simple "logged in" flag cookie
  res.cookies.set("scout_auth", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });

  return res;
}
