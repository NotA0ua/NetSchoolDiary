import { NextResponse } from "next/server"

const API_BASE = process.env.DIARY_API_URL || "http://127.0.0.1:8000"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const res = await fetch(`${API_BASE}/file/${params.id}`, {
      headers: {
        Cookie: request.headers.get("cookie") ?? "",
        Authorization: request.headers.get("authorization") ?? "",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: "Upstream error" },
        { status: res.status }
      )
    }

    return new NextResponse(res.body, {
      status: 200,
      headers: {
        "Content-Type":
          res.headers.get("content-type") || "application/octet-stream",
        "Content-Disposition":
          res.headers.get("content-disposition") ||
          `attachment; filename="file-${params.id}"`,
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Connection failed" },
      { status: 502 }
    )
  }
}
