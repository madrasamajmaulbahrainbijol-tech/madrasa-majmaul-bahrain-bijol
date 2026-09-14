import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CONTROL_PATH = "/system-control";
const API_PATH = "/api/system-control";
const FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/system-control`;

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === CONTROL_PATH || path.startsWith(`${CONTROL_PATH}/`) || path === API_PATH || path.startsWith(`${API_PATH}/`)) return NextResponse.next();
  try {
    const response = await fetch(FUNCTION_URL, { cache: "no-store" });
    const state = await response.json();
    if (state.active === false) return new NextResponse("Website temporarily paused", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  } catch {}
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
