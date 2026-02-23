import { NextResponse } from "next/server"

const API_BASE = process.env.DIARY_API_URL || "http://127.0.0.1:8000"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;

  const url = new URL(request.url);
  const filenameFromQuery = url.searchParams.get("filename") ?? null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const res = await fetch(`${API_BASE}/file/${id}`, {
      headers: {
        Cookie: request.headers.get("cookie") ?? "",
        Authorization: request.headers.get("authorization") ?? "",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorBody = "";
      try {
        errorBody = await res.text();
      } catch {}
      return NextResponse.json(
        { 
          error: "Upstream error",
          status: res.status,
          details: errorBody.trim() || res.statusText 
        },
        { status: res.status }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": res.headers.get("content-type") || "application/octet-stream",
    };

    // Query-параметр имеет приоритет
    if (filenameFromQuery) {
      const encoded = encodeURIComponent(filenameFromQuery);
      headers["Content-Disposition"] = `attachment; filename*=UTF-8''${encoded}`;
    } else {
      const disposition = res.headers.get("content-disposition");
      headers["Content-Disposition"] =
        disposition || `attachment; filename="file-${id}"`;
    }

    return new NextResponse(res.body, {
      status: 200,
      headers,
    });

  } catch (err: any) {
    console.error(`Proxy error for file ${id}:`, err);

    if (err.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }

    return NextResponse.json({ error: "Connection failed" }, { status: 502 });
  }
}
