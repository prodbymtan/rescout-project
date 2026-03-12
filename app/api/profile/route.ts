import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const profile = req.cookies.get("scout_profile")?.value;
    return NextResponse.json({ profile: profile || null });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { profile } = body;

        if (!profile) {
            return NextResponse.json(
                { error: "Profile name is required" },
                { status: 400 }
            );
        }

        const res = NextResponse.json({ success: true, profile });

        // Set the cookie so middleware knows we have a profile
        res.cookies.set("scout_profile", profile, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/", // accessible everywhere
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return res;
    } catch (error) {
        console.error("Error setting profile:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
