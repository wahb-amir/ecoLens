// app/api/predict/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const dataUrl = json?.dataUrl;
    if (!dataUrl) {
      return new NextResponse(JSON.stringify({ error: "Missing dataUrl in request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Hardcoded HF Space run/predict for testing:
    const target = "https://wahb-amir-ecolens.hf.space/run/predict";

    const proxied = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [dataUrl] }),
    });

    const status = proxied.status;

    // try to parse JSON; if not JSON, forward raw text
    let payload: any;
    try {
      payload = await proxied.json();
    } catch (err) {
      const text = await proxied.text();
      const contentType = proxied.headers.get("content-type") || "text/plain";
      return new NextResponse(text, { status, headers: { "Content-Type": contentType } });
    }

    // Extract prediction data from HF Space response.
    // HF Space sample:
    // { data: [{ label: "clothes", confidences: [{label, confidence}, ...] }], duration: 1.88, ... }
    let extracted: any = null;

    if (payload?.data) {
      // if data is an array and first element contains confidences -> use confidences
      if (Array.isArray(payload.data) && payload.data.length > 0) {
        const first = payload.data[0];
        if (first && Array.isArray(first.confidences) && first.confidences.length > 0) {
          // normalize to [{ label, prob }]
          extracted = first.confidences.map((c: any) => ({
            label: String(c.label ?? c[0] ?? "unknown"),
            prob: Number(c.confidence ?? c.prob ?? 0),
          }));
        } else {
          // fallback: return payload.data as-is (array of labels or objects)
          extracted = payload.data;
        }
      } else {
        extracted = payload.data;
      }
    } else if (payload?.predictions) {
      extracted = payload.predictions;
    } else {
      // last-resort: return entire payload
      extracted = payload;
    }

    const responseBody = {
      predictions: extracted,
      inference_time: payload?.duration ?? payload?.average_duration ?? null,
    };

    return new NextResponse(JSON.stringify(responseBody), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Proxy error:", err);
    return new NextResponse(JSON.stringify({ error: err?.message ?? "Unknown server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
