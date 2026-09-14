import { NextResponse } from "next/server";

const FUNCTION_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/system-control`;

export async function GET(request: Request) {
  const code = request.headers.get("x-system-code") || "";
  const response = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: { "x-system-code": code },
    cache: "no-store",
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: Request) {
  const code = request.headers.get("x-system-code") || "";
  const body = await request.json();
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, code }),
    cache: "no-store",
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
