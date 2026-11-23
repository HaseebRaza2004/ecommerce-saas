import { NextResponse } from "next/server";
import {
  adaptCookieForLocalHttp,
  isAllowedProxyPath,
  resolveBackendBaseUrl,
} from "@/lib/proxyCookies";

const FORWARD_REQ_HEADERS = [
  "cookie",
  "content-type",
  "x-requested-with",
  "x-store-domain",
  "x-merchant-id",
  "accept-language",
  "user-agent",
];

async function handleProxy(request, context) {
  const { path } = await context.params;
  if (!isAllowedProxyPath(path)) {
    return NextResponse.json(
      {
        error: true,
        status: 403,
        message: "Blocked proxy target.",
        data: null,
      },
      { status: 403 },
    );
  }

  const targetUrl = `${resolveBackendBaseUrl()}/${path.join("/")}${request.nextUrl.search}`;
  const headers = new Headers();
  for (const key of FORWARD_REQ_HEADERS) {
    const val = request.headers.get(key);
    if (val) headers.set(key, val);
  }
  if (!headers.has("x-requested-with")) {
    headers.set("x-requested-with", "XMLHttpRequest");
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;

  try {
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: hasBody && body.byteLength > 0 ? body : undefined,
      cache: "no-store",
    });

    const resBody = await upstream.text();
    const res = new NextResponse(resBody, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") || "application/json",
        "cache-control": "no-store",
      },
    });

    const isLocalHttp = request.nextUrl.protocol === "http:";
    for (const cookie of upstream.headers.getSetCookie()) {
      res.headers.append(
        "set-cookie",
        adaptCookieForLocalHttp(cookie, isLocalHttp),
      );
    }
    return res;
  } catch {
    return NextResponse.json(
      {
        error: true,
        status: 503,
        message:
          "Backend server unreachable. Make sure the API server is running.",
        data: null,
      },
      { status: 503 },
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;