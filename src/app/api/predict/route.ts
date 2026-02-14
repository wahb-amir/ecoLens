// app/api/predict/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const dataUrl = json?.dataUrl;
    if (!dataUrl) {
      return new NextResponse(JSON.stringify({ error: "Missing dataUrl in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Use the full, exact URL you want called (no modifications).
    
    const target = (process.env.PREDICT_URL || process.env.CNN_URL || "").trim();
    if (!target) {
      return new NextResponse(JSON.stringify({ error: "Server env PREDICT_URL (or CNN_URL) not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    const isHfRun = target.includes("/run/predict");
    const isApiPredict = target.includes("/api/predict");

    let proxied: Response;

    if (isHfRun || (!isApiPredict && !target.includes("/api/"))) {
      // POST JSON (typical for HF Space run/predict)
      proxied = await fetch(target, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: [dataUrl] }),
      });
    } else {
      // POST multipart/form-data (typical for custom backends expecting file field)
      const match = /^data:(.+);base64,(.+)$/.exec(dataUrl);
      if (!match) {
        return new NextResponse(JSON.stringify({ error: "Invalid dataUrl format" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const mime = match[1];
      const b64 = match[2];
      const buffer = Buffer.from(b64, "base64");

      const form = new FormData();
      const blob = new Blob([buffer], { type: mime });
      form.append("file", blob, "capture.png");

      proxied = await fetch(target, {
        method: "POST",
        body: form,
      });
    }

    // Relay response back to client (keep content-type)
    const text = await proxied.text();
    const contentType = proxied.headers.get("content-type") || "application/json";
    return new NextResponse(text, { status: proxied.status, headers: { "Content-Type": contentType } });
  } catch (err: any) {
    console.error("Proxy error:", err);
    return new NextResponse(JSON.stringify({ error: err?.message ?? "Unknown server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
