import { NextResponse } from "next/server"

const API_BASE = process.env.DIARY_API_URL || "http://127.0.0.1:8000"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const delta = searchParams.get("delta")

  const url = delta ? `${API_BASE}/diary/${delta}` : `${API_BASE}/diary`

  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) {
      return NextResponse.json(
        { error: "Upstream API error" },
        { status: res.status }
      )
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to API" },
      { status: 502 }
    )
  }
}
