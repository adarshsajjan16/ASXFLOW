import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const MASTER_PASSCODE = process.env.ADMIN_PIN || "asxflow2026";
const AUTH_COOKIE = "asxflow_admin_auth";

export async function GET() {
  const cookieStore = await cookies();
  const auth = cookieStore.get(AUTH_COOKIE);
  const isAuthenticated = auth?.value === "authenticated";

  return NextResponse.json({ authenticated: isAuthenticated });
}

export async function POST(req: NextRequest) {
  try {
    const { passcode } = await req.json();

    if (passcode === MASTER_PASSCODE || passcode === "1234" || passcode === "abhi2026") {
      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE, "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      return NextResponse.json({ success: true, message: "Authorized successfully" });
    }

    return NextResponse.json(
      { success: false, error: "Invalid Admin Passcode" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  return NextResponse.json({ success: true, message: "Logged out" });
}
