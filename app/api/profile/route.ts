import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const profile = body.profile;

    if (!profile || typeof profile !== "string" || profile.trim().length === 0) {
      return NextResponse.json(
        { error: "Profile name is required" },
        { status: 400 }
      );
    }

    const res = NextResponse.json({ success: true });

    // Set profile cookie (same settings as auth cookie)
    res.cookies.set("scout_profile", profile.trim(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12, // 12 hours (same as auth)
    });

    return res;
  } catch (error) {
    console.error("Error setting profile:", error);
    return NextResponse.json(
      { error: "Failed to set profile" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const profile = req.cookies.get("scout_profile");
  return NextResponse.json({ profile: profile?.value || null });
}
