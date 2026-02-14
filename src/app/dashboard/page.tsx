"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useEcoTracker } from "@/hooks/use-eco-tracker";
import { WasteDistributionChart } from "@/components/dashboard/WasteDistributionChart";
import {
  Camera,
  Upload,
  Leaf,
  Trophy,
  Flame,
  RefreshCw,
  Image as ImageIcon,
  Smile,
  BarChart3,
  CheckCircle2,
  X,
  Aperture,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { stats } = useEcoTracker();

  // -- State --
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Prediction Results
  const [predictions, setPredictions] = useState<
    { label: string; prob: number }[] | null
  >(null);
  const [meta, setMeta] = useState<any>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // -- Refs --
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- Logic for 3 New Metrics (Simulated) ---
  const carbonSaved = (stats.totalScans ?? 0) * 0.5;
  const communityRank = "Top 15%";
  const currentStreak = 4;

  const getRecyclingRate = () => {
    if (!stats || stats.totalScans === 0) return 0;
    const recyclableItems =
      (stats.scansByType?.["plastic"] || 0) +
      (stats.scansByType?.["paper"] || 0) +
      (stats.scansByType?.["metal"] || 0) +
      (stats.scansByType?.["glass"] || 0);
    return Math.round((recyclableItems / stats.totalScans) * 100);
  };

  // ---------------------------------------------------------
  // CAMERA LOGIC
  // ---------------------------------------------------------

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const initCamera = async (requestedMode: "user" | "environment") => {
    setCameraError(null);
    stopCameraStream(); // Ensure previous stream is killed

    try {
      const constraints = {
        video: {
          facingMode: requestedMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .catch((e) => console.error("Play error:", e));
        };
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Could not access camera. Please check permissions.");
      setIsCameraActive(false);
    }
  };

  const handleStartCamera = () => {
    // Default to environment (rear) camera for scanning waste
    setFacingMode("environment");
    initCamera("environment");
  };

  const handleFlipCamera = () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    initCamera(newMode);
  };

  const handleCloseCamera = () => {
    stopCameraStream();
    setIsCameraActive(false);
    setCameraError(null);
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");

    // Handle edge cases where video dimensions aren't ready
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror the image ONLY if using the front camera so it looks natural
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to URL
    const dataUrl = canvas.toDataURL("image/png");

    setPreview(dataUrl);
    handleCloseCamera(); // Stop camera after capture
    uploadForPrediction(dataUrl); // Trigger upload
  };

  // ---------------------------------------------------------
  // FILE UPLOAD LOGIC
  // ---------------------------------------------------------

  const triggerFileInput = () => {
    // specific click handler for reliability
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so selecting the same file twice triggers change
    e.target.value = "";

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      uploadForPrediction(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // ---------------------------------------------------------
  // Helpers for parsing predictions
  // ---------------------------------------------------------
  const normalizePredsFromObj = (obj: any): { label: string; prob: number }[] => {
    // obj could be:
    // - object mapping label->prob
    // - string label
    // - array of [label, prob] or array of label strings
    if (!obj) return [];

    if (typeof obj === "string") {
      return [{ label: obj, prob: 1 }];
    }

    if (Array.isArray(obj)) {
      // array of strings or array of [label, prob] or array of objects
      // try to interpret
      const arr = obj
        .map((it: any) => {
          if (typeof it === "string") return { label: it, prob: 1 };
          if (Array.isArray(it) && it.length >= 2 && typeof it[0] === "string")
            return { label: it[0], prob: Number(it[1]) || 0 };
          if (typeof it === "object" && it !== null) {
            // maybe {label:..., prob:...} or {"label":prob}
            if (it.label && it.prob !== undefined) return { label: it.label, prob: Number(it.prob) || 0 };
            const keys = Object.keys(it);
            if (keys.length === 2 && keys.includes("label") && keys.includes("prob"))
              return { label: String(it.label), prob: Number(it.prob) || 0 };
            // fallback: first key as label, value as prob
            return { label: keys[0], prob: Number(it[keys[0]]) || 0 };
          }
          return null;
        })
        .filter(Boolean) as { label: string; prob: number }[];
      return arr;
    }

    if (typeof obj === "object") {
      // mapping of label->prob
      const entries = Object.entries(obj).map(([k, v]) => ({
        label: k,
        prob: Number(v) || 0,
      }));
      return entries;
    }

    return [];
  };

  // ---------------------------------------------------------
  // API / PREDICTION LOGIC (auto-detect HF Space vs custom backend)
  // ---------------------------------------------------------

  const uploadForPrediction = async (dataUrl: string) => {
    setIsUploading(true);
    setGeneralError(null);
    setPredictions(null);
    setMeta(null);

    // small helper: timeout fetch
    const timeoutMs = 30000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_CNN_URL?.replace(/\/+$/, "") || "";
      const isHfSpace = baseUrl.includes("huggingface.co/spaces");

      if (isHfSpace) {
        // Gradio-style Space: POST JSON { data: [dataUrl] } to /api/predict/
        const apiUrl = `${baseUrl}/api/predict/`;
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: [dataUrl] }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const payload = await res.json();

        // Gradio outputs vary:
        // - payload.data: usually an array with prediction(s)
        // - payload.duration (optional)
        // - some Spaces return {data: ["label"]} or {data: [ {"label":prob,...} ] }
        // We'll try several fallbacks.
        let predsRaw: any = null;
        if (payload.predictions) predsRaw = payload.predictions;
        else if (payload.data && payload.data.length > 0) predsRaw = payload.data[0];
        else if (payload.data) predsRaw = payload.data;
        else if (Array.isArray(payload) && payload.length > 0) predsRaw = payload[0];
        else predsRaw = payload; // last resort

        const parsed = normalizePredsFromObj(predsRaw);

        // If parsed is mapping style, sort and slice top 5
        const final =
          parsed.length > 0
            ? parsed.sort((a, b) => b.prob - a.prob).slice(0, 5)
            : [{ label: String(predsRaw ?? "Unknown"), prob: 0 }];

        setPredictions(final);
        setMeta({
          inference_time: payload.duration ?? null,
        });
      } else {
        // Custom FastAPI backend: send multipart/form-data to /api/predict
        const resBlob = await fetch(dataUrl);
        const blob = await resBlob.blob();

        const formData = new FormData();
        formData.append("file", blob, "capture.png");

        const apiUrl = `${baseUrl}/api/predict`;
        const res = await fetch(apiUrl, {
          method: "POST",
          body: formData,
          // include credentials for cookie-based auth (verifyAuth)
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) {
          // try to parse JSON message if available
          let errText = `Server error: ${res.status}`;
          try {
            const errJson = await res.json();
            if (errJson?.detail) errText += ` - ${errJson.detail}`;
          } catch {}
          throw new Error(errText);
        }

        const payload = await res.json();

        const predsObj = payload.predictions ?? payload;
        const parsed = normalizePredsFromObj(predsObj);
        let final: { label: string; prob: number }[] = [];

        if (
          parsed.length === 1 &&
          parsed[0].label &&
          (parsed[0].prob === 0 || parsed[0].prob === 1)
        ) {
          // maybe it's Unknown/Mixed or a single label with implied prob
          final = parsed;
        } else if (parsed.length > 0) {
          final = parsed.sort((a, b) => b.prob - a.prob).slice(0, 5);
        } else if (payload.predictions && typeof payload.predictions === "object") {
          final = normalizePredsFromObj(payload.predictions);
        } else {
          final = [{ label: "Unknown/Mixed", prob: payload?.inference_time_s ?? 0 }];
        }

        setPredictions(final);
        setMeta({
          inference_time: payload.inference_time_s ?? null,
          width: payload.width ?? null,
          height: payload.height ?? null,
        });
      }
    } catch (err: any) {
      console.error("Upload failed", err);
      if (err.name === "AbortError") {
        setGeneralError("Request timed out. Try a smaller image or check the backend.");
      } else {
        setGeneralError(
          err?.message || "Failed to identify image. Is the backend running?"
        );
      }
    } finally {
      clearTimeout(timer);
      setIsUploading(false);
    }
  };

  const clearAll = () => {
    setPreview(null);
    setPredictions(null);
    setMeta(null);
    setGeneralError(null);
    // Ensure camera is stopped if they clear while camera is somehow active
    stopCameraStream();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCameraStream();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Welcome back! 🌱
        </h1>
        <p className="text-slate-500 text-lg">
          Your actions today are building a greener tomorrow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Classification Tool */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-2 border-emerald-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-emerald-50/50">
              <CardTitle>Classify Waste</CardTitle>
              <CardDescription>
                Snap a photo to see where it belongs.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* MAIN MEDIA AREA */}
              <div className="relative aspect-square rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                {/* 1. Camera View */}
                {isCameraActive && !preview && (
                  <div className="absolute inset-0 bg-black flex flex-col">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="flex-1 w-full h-full object-cover"
                    />

                    {/* Camera Controls Overlay */}
                    <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full h-12 w-12 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white border-none"
                        onClick={handleFlipCamera}
                        title="Flip Camera"
                      >
                        <RefreshCw className="h-5 w-5" />
                      </Button>

                      <Button
                        onClick={captureImage}
                        className="rounded-full h-16 w-16 bg-white hover:bg-slate-100 p-1 border-4 border-emerald-500/50"
                      >
                        <div className="h-12 w-12 rounded-full bg-emerald-500" />
                      </Button>

                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full h-12 w-12 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white border-none"
                        onClick={handleCloseCamera}
                        title="Close Camera"
                      >
                        <X className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* 2. Error State */}
                {cameraError && !preview && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-30 bg-white">
                    <div className="bg-red-100 text-red-600 p-4 rounded-full mb-4">
                      <Aperture className="w-8 h-8" />
                    </div>
                    <p className="text-red-600 font-medium mb-4">
                      {cameraError}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setCameraError(null)}
                    >
                      Try Again
                    </Button>
                  </div>
                )}

                {/* 3. Loading State */}
                {isUploading && (
                  <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center animate-pulse">
                    <Smile className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
                    <p className="font-bold text-emerald-700 text-lg">
                      Analyzing...
                    </p>
                  </div>
                )}

                {/* 4. Preview Image */}
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* 5. Default Empty State (Start Screen) */}
                {!isCameraActive &&
                  !preview &&
                  !isUploading &&
                  !cameraError && (
                    <div className="text-center p-8 space-y-6 w-full">
                      <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full w-fit mx-auto">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Upload an image
                        </h3>
                        <p className="text-slate-500 text-sm">
                          Or take a photo to analyze
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 w-full max-w-xs mx-auto">
                        <Button
                          onClick={handleStartCamera}
                          className="w-full gap-2"
                          variant="default"
                        >
                          <Camera className="w-4 h-4" /> Camera
                        </Button>

                        <Button
                          onClick={triggerFileInput}
                          className="w-full gap-2"
                          variant="outline"
                        >
                          <Upload className="w-4 h-4" /> Upload
                        </Button>

                        {/* Hidden File Input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  )}
              </div>

              {/* RESULTS AREA */}
              <div className="mt-6">
                {generalError && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md flex items-center gap-2 mb-4">
                    <X className="w-4 h-4" /> {generalError}
                  </div>
                )}

                {predictions && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900">
                        Analysis Results
                      </h4>
                      <span className="text-xs text-slate-400 font-mono">
                        {meta?.inference_time
                          ? `${Number(meta?.inference_time).toFixed(3)}s`
                          : ""}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {predictions.map((p, idx) => (
                        <div
                          key={p.label}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            idx === 0
                              ? "bg-emerald-50 border-emerald-200 shadow-sm"
                              : "bg-white border-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {idx === 0 ? (
                              <CheckCircle2 className="text-emerald-600 w-5 h-5" />
                            ) : (
                              <div className="w-5" />
                            )}
                            <div>
                              <div className="font-semibold text-slate-800 capitalize">
                                {p.label}
                              </div>
                              {idx === 0 && (
                                <div className="text-xs text-emerald-600 font-medium">
                                  Best Match
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-sm font-bold text-slate-600">
                            {Math.round(p.prob * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={clearAll}
                        variant="outline"
                        className="flex-1"
                      >
                        Start Over
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Stats (Unchanged but layout preserved) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-emerald-600 text-white border-none shadow-emerald-100">
              <CardContent className="p-6">
                <Leaf className="w-5 h-5 mb-2 opacity-80" />
                <p className="text-sm font-medium opacity-90">Carbon Saved</p>
                <h3 className="text-3xl font-bold">
                  {carbonSaved.toFixed(1)}kg
                </h3>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 text-white border-none">
              <CardContent className="p-6">
                <Trophy className="w-5 h-5 mb-2 text-amber-400" />
                <p className="text-sm font-medium opacity-90">Community Rank</p>
                <h3 className="text-3xl font-bold">{communityRank}</h3>
              </CardContent>
            </Card>
            <Card className="bg-orange-500 text-white border-none">
              <CardContent className="p-6">
                <Flame className="w-5 h-5 mb-2 opacity-80" />
                <p className="text-sm font-medium opacity-90">Scan Streak</p>
                <h3 className="text-3xl font-bold">{currentStreak} Days</h3>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-slate-100 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Stats at a Glance</CardTitle>
                  <BarChart3 className="w-5 h-5 text-slate-400" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500">Total Scans</span>
                  <span className="text-xl font-bold">{stats.totalScans}</span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-500">
                      Recycling Progress
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      {getRecyclingRate()}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: `${getRecyclingRate()}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-100 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <WasteDistributionChart stats={stats} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
