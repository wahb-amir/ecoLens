// app/api/predict/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const dataUrl = json?.dataUrl;
    if (!dataUrl) {
      return new NextResponse(
        JSON.stringify({ error: "Missing dataUrl in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hardcoded target for quick testing:
    const target = "https://wahb-amir-ecolens.hf.space/run/predict";

    // HF Space run/predict expects JSON: { data: [dataUrl] }
    const proxied = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: [dataUrl] }),
    });

    const text = await proxied.text();
    const contentType = proxied.headers.get("content-type") || "application/json";
    return new NextResponse(text, {
      status: proxied.status,
      headers: { "Content-Type": contentType },
    });
  } catch (err: any) {
    console.error("Proxy error:", err);
    return new NextResponse(
      JSON.stringify({ error: err?.message ?? "Unknown server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
