import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function backendBase(): string | null {
  const a = process.env.BACKEND_URL?.replace(/\/$/, "");
  const b = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
  return a || b || null;
}

async function proxy(req: NextRequest, path: string[]) {
  const base = backendBase();
  if (!base) {
    return NextResponse.json({ status: "error", message: "Backend URL not configured" }, { status: 500 });
  }
  const target = `${base}/fcm/${path.join("/")}`;

  const headers = new Headers(req.headers);
  headers.delete("host"); headers.delete("connection");

  let body: BodyInit | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await req.json().catch(() => null);
      body = json ? JSON.stringify(json) : undefined;
    } else {
      const buf = await req.arrayBuffer();
      body = buf ? Buffer.from(buf) : undefined;
    }
  }

  const res = await fetch(target, { method: req.method, headers, body, redirect: "manual" });
  const outHeaders = new Headers(res.headers);
  const arrayBuf = await res.arrayBuffer();
  return new NextResponse(arrayBuf, { status: res.status, headers: outHeaders });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxy(req, resolvedParams.path || []);
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxy(req, resolvedParams.path || []);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxy(req, resolvedParams.path || []);
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxy(req, resolvedParams.path || []);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  return proxy(req, resolvedParams.path || []);
}
export async function OPTIONS() { return NextResponse.json({}, { status: 200 }); }

