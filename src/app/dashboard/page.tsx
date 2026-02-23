"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStats } from "@/lib/use-user-stats";
import { toast } from "sonner";
import { useEcoTracker } from "@/hooks/use-eco-tracker";
import { WasteDistributionChart } from "@/components/dashboard/WasteDistributionChart";
import {
  Camera,
  Leaf,
  Trophy,
  Flame,
  RefreshCw,
  BarChart3,
  CheckCircle2,
  X,
  Aperture,
  AlertCircle,
  RotateCcw,
  ImagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../providers/AuthProvider";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type Prediction = { label: string; prob: number };

export default function DashboardPage() {
  // -- Hooks & external state --
  const { stats, refreshStats, isLoading: isStatsLoading } = useUserStats();
  const { refreshTokens, fetchWithAuth, user } = useAuth();

  // -- UI States --
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  // -- Data States --
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [meta, setMeta] = useState<{ inference_time?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ---------------------------------------------------------
  // LIFECYCLE & CLEANUP
  // ---------------------------------------------------------
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopCameraStream();
  }, [stopCameraStream]);

  const clearAll = useCallback(() => {
    stopCameraStream();
    setPreview(null);
    setPredictions(null);
    setMeta(null);
    setError(null);
    setIsCameraActive(false);
    setIsUploading(false);
  }, [stopCameraStream]);

  // ---------------------------------------------------------
  // CAMERA LOGIC
  // ---------------------------------------------------------
  const initCamera = async (mode: "user" | "environment") => {
    setError(null);
    stopCameraStream();

    if (!navigator?.mediaDevices?.getUserMedia) {
      setError("Camera access is not supported by your browser or requires HTTPS.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });

      streamRef.current = stream;
      setFacingMode(mode);
      setIsCameraActive(true);

      if (videoRef.current) {
        // assign stream safely
        try {
          videoRef.current.srcObject = stream;
        } catch (err) {
          // some browsers may refuse direct assignment in odd contexts
          console.warn("Failed to assign srcObject for camera video", err);
        }
      }
    } catch (err) {
      setError("Camera access denied. Please check your browser permissions.");
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;

    // visual shutter
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150);

    // Defensive dimensions: videoWidth/Height can be zero if not ready
    const vid = videoRef.current;
    const vw = vid.videoWidth || 1280;
    const vh = vid.videoHeight || 720;

    if (vw === 0 || vh === 0) {
      // fallback message rather than crash
      setError("Camera not ready — try opening the camera again.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Could not capture image (canvas context unavailable).");
      return;
    }

    // Mirror for front camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    setPreview(dataUrl);
    stopCameraStream();
    setIsCameraActive(false);
    uploadForPrediction(dataUrl);
  };

  // ---------------------------------------------------------
  // UPLOAD / API LOGIC
  // ---------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid file type. Please use PNG, JPG, or WebP.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum size is 10MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      uploadForPrediction(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const uploadForPrediction = async (dataUrl: string) => {
    setIsUploading(true);
    setError(null);

    try {
      if (!user) throw new Error("Please sign in to analyze items.");
      await refreshTokens();

      const res = await fetchWithAuth("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });

      if (!res.ok) {
        // attempt to read message from server
        let msg = "Our AI couldn't process this image. Please try again.";
        try {
          const errJson = await res.json();
          if (errJson?.message) msg = errJson.message;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }

      const payload = await res.json();

      // Re-fetch user stats (SWR or your hook's method)
      await refreshStats();

      setPredictions(Array.isArray(payload.predictions) ? payload.predictions : []);
      setMeta({ inference_time: payload.inference_time });

      if (payload.newAchievements?.length > 0) {
        toast.success("New Achievement Unlocked!", {
          description: `You've earned ${payload.newAchievements.length} new badge(s).`,
        });
      }
    } catch (err: any) {
      setError(err?.message ?? "An unexpected error occurred.");
    } finally {
      setIsUploading(false);
    }
  };
  const quickStats = useMemo(() => {
    // Guard: if stats not loaded yet, return sensible placeholders
    if (!stats) {
      return [
        { icon: Leaf, label: "Waste Diverted", val: `0.0 kg`, bg: "bg-emerald-600" },
        { icon: Trophy, label: "Global Rank", val: "—", bg: "bg-indigo-600" },
        { icon: Flame, label: "Active Streak", val: "—", bg: "bg-orange-500" },
      ];
    }

    return [
      {
        icon: Leaf,
        label: "Waste Diverted",
        val: `${(stats.totalScans * 0.5).toFixed(1)} kg`,
        bg: "bg-emerald-600",
      },
      {
        icon: Trophy,
        label: "Global Rank",
        val: "Top 15%",
        bg: "bg-indigo-600",
      },
      {
        icon: Flame,
        label: "Active Streak",
        val: "4 Days",
        bg: "bg-orange-500",
      },
    ];
  }, [stats]);

  // ---------------------------------------------------------
  // SAFETY: don't attempt to render main UI if stats are missing
  // ---------------------------------------------------------
  if (!stats && isStatsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono">
        INITIALIZING_SYSTEM...
      </div>
    );
  }

  if (!stats) {
    // If we're not loading but still have no stats, show a safe fallback
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center p-8">
          <CardTitle>No statistics available</CardTitle>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">
              We couldn't load your stats. Try refreshing or signing in again.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => refreshStats()}>Refresh</Button>
              <Button variant="outline" onClick={() => clearAll()}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------
  // Quick stat tiles data (keeps JSX tidy)
  // ---------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Premium Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">EcoScan</h1>
          </div>
          {(preview || error || isCameraActive) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-slate-500 hover:text-slate-900"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 mt-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Camera & Processing */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden flex-shrink-0">
            <CardContent className="p-0 relative">
              {/* Media Viewport */}
              <div className="relative aspect-[4/5] md:aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                {/* 1. Camera Active */}
                {isCameraActive && (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className={cn(
                        "absolute inset-0 bg-white transition-opacity duration-150 pointer-events-none z-10",
                        isFlashing ? "opacity-100" : "opacity-0",
                      )}
                    />

                    <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-8 px-6 z-20">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full w-12 h-12 bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/20"
                        onClick={() => initCamera(facingMode === "user" ? "environment" : "user")}
                        aria-label="Switch camera"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </Button>

                      <button
                        onClick={captureImage}
                        className="group relative flex items-center justify-center focus:outline-none"
                        aria-label="Capture image"
                      >
                        <div className="absolute w-20 h-20 rounded-full border-4 border-white/60 group-active:scale-90 transition-transform duration-200" />
                        <div className="w-16 h-16 rounded-full bg-white shadow-xl group-active:scale-95 transition-transform duration-200" />
                      </button>

                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full w-12 h-12 bg-black/50 hover:bg-black/70 text-white backdrop-blur-md border border-white/20"
                        onClick={() => setIsCameraActive(false)}
                        aria-label="Close camera"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </>
                )}

                {/* Idle / Start State */}
                {!isCameraActive && !preview && !isUploading && (
                  <div className="flex flex-col items-center text-center p-8 space-y-6 w-full max-w-sm">
                    <div className="w-24 h-24 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center">
                      <Camera className="w-10 h-10 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-1">Scan an Item</h3>
                      <p className="text-slate-500 text-sm">Take a photo or upload an image to see how to recycle it.</p>
                    </div>
                    <div className="flex flex-col w-full gap-3">
                      <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" onClick={() => initCamera("environment")}>
                        <Camera className="w-4 h-4 mr-2" /> Open Camera
                      </Button>
                      <Button size="lg" variant="outline" className="w-full border-slate-200 hover:bg-slate-50" onClick={() => fileInputRef.current?.click()}>
                        <ImagePlus className="w-4 h-4 mr-2" /> Upload Photo
                      </Button>
                      <input ref={fileInputRef} type="file" accept={ALLOWED_TYPES.join(",")} className="hidden" onChange={handleFileChange} />
                    </div>
                  </div>
                )}

                {/* Preview Image */}
                {preview && !isCameraActive && <img src={preview} alt="Captured preview" className="absolute inset-0 w-full h-full object-cover" />}

                {/* Processing Overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center text-white z-30">
                    <div className="relative flex items-center justify-center">
                      <Aperture className="w-14 h-14 animate-spin-slow text-emerald-400" />
                      <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-20 rounded-full animate-pulse" />
                    </div>
                    <p className="mt-6 font-medium text-emerald-50 animate-pulse">Analyzing image...</p>
                  </div>
                )}
              </div>

              {/* Status / Results Drawer */}
              {(error || predictions) && (
                <div className="bg-white border-t border-slate-100 p-5 md:p-6 animate-in slide-in-from-bottom-4 duration-300">
                  {error ? (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                      <p className="text-red-700 font-medium text-sm mb-5">{error}</p>
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 bg-white border-red-200 hover:bg-red-50 text-red-700" onClick={clearAll}>Cancel</Button>
                        <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => preview && uploadForPrediction(preview)}>Retry</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase">Analysis Result</h4>
                        {meta?.inference_time !== undefined && (
                          <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
                            {meta.inference_time.toFixed(2)}s
                          </span>
                        )}
                      </div>

                      {predictions?.slice(0, 1).map((p) => (
                        <div key={p.label} className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="bg-emerald-100 rounded-full p-2">
                              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            </div>
                            <span className="text-xl font-semibold text-slate-900 capitalize">{p.label}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-emerald-600 block leading-none">{Math.round(p.prob * 100)}%</span>
                            <span className="text-[10px] font-medium text-emerald-600/70 uppercase tracking-wider">Confidence</span>
                          </div>
                        </div>
                      ))}

                      <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50" onClick={clearAll}>Scan Another Item</Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Statistics & Analytics */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            {quickStats.map((s, i) => (
              <Card key={i} className="border-none shadow-sm text-white overflow-hidden relative">
                <div className={cn("absolute inset-0 opacity-90", s.bg)} />
                <CardContent className="p-4 md:p-5 relative z-10 flex flex-col h-full justify-between gap-4">
                  <s.icon className="w-5 h-5 opacity-80" />
                  <div>
                    <p className="text-xs font-medium opacity-80 mb-1">{s.label}</p>
                    <p className="text-lg md:text-2xl font-bold tracking-tight">{s.val}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Engagement Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-slate-900">Engagement Overview</CardTitle>
                <div className="p-2 bg-slate-50 rounded-md">
                  <BarChart3 className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-4xl font-bold text-slate-900 tracking-tight">{stats.totalScans}</p>
                  <p className="text-sm font-medium text-slate-500 mt-1">Lifetime Scans</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">82%</p>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">AI Accuracy</p>
                </div>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" style={{ width: "82%" }} />
              </div>
            </CardContent>
          </Card>

          {/* Expanded Chart */}
          <div className="hidden sm:block">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <WasteDistributionChart stats={stats} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}