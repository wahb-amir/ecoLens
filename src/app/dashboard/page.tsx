"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useUserStats } from "@/lib/use-user-stats";
import { useAuth } from "../providers/AuthProvider";
import { WasteDistributionChart } from "@/components/dashboard/WasteDistributionChart";
import { cn } from "@/lib/utils";
import {
  Camera,
  Leaf,
  Flame,
  BarChart3,
  X,
  Aperture,
  AlertCircle,
  Star,
  UploadCloud,
  CheckCircle2,
  ChevronRight,
  SwitchCamera,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Advanced Animation Constants ---
const SPRING = { type: "spring", stiffness: 300, damping: 30 } as const;
const FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

// Allowed Upload Types
const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
] as const;

// --- Types ---
type FacingMode = "environment" | "user";

interface Prediction {
  label: string;
  prob: number;
}

export default function UpscaledDashboard() {
  const { stats, refreshStats, isLoading: isStatsLoading } = useUserStats();
  const { fetchWithAuth, user } = useAuth();

  // -- UI & Media States --
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [facingMode, setFacingMode] = useState<FacingMode>("environment");

  // -- Data States --
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // -- Memoized Calculations --
  const progressToNextRank = useMemo(() => {
    if (!stats) return 0;
    const nextMilestone = Math.ceil((stats.totalScans + 1) / 50) * 50;
    return (stats.totalScans / nextMilestone) * 100;
  }, [stats]);

  // --- Helpers ---
  const normalizeLabel = (raw?: string | null): string =>
    (raw ?? "").toString().trim().toLowerCase();

  const isNoMatchPrediction = (preds: Prediction[] | null): boolean => {
    if (!preds || preds.length === 0) return true;
    const label = normalizeLabel(preds[0]?.label);
    if (!label) return true;
    // Accept variants like "unknown", "mixed", "unknown/mixed", "mixed/unknown"
    const noMatchVariants = [
      "unknown",
      "mixed",
      "unknown/mixed",
      "mixed/unknown",
    ];
    return noMatchVariants.includes(label);
  };

  // -- Camera Lifecycle --
  const stopCamera = useCallback(() => {
    try {
      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch {}
        try {
          // detach srcObject
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (videoRef.current as any).srcObject = null;
        } catch {}
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
        });
        streamRef.current = null;
      }
    } finally {
      setIsCameraActive(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const initCamera = async (mode: FacingMode = "environment") => {
    setError(null);

    // Ensure any previous preview won't obscure the live view
    setPreview(null);

    // Defensive: ensure API exists
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera API not available in this browser.");
      return;
    }

    // Stop any existing stream first
    stopCamera();

    const baseConstraints: MediaTrackConstraints = {
      width: { ideal: 1280 }, // slightly lower may help some devices
      height: { ideal: 720 },
      facingMode: mode as any,
    };

    let stream: MediaStream | null = null;
    // Try exact facingMode then fallback
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { ...baseConstraints, facingMode: { exact: mode } as any },
      });
    } catch {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: baseConstraints,
        });
      } catch (err) {
        setError(
          "Lens access denied or no camera found. Check system permissions or try a different device.",
        );
        return;
      }
    }

    if (!stream) {
      setError("Unable to start camera.");
      return;
    }

    streamRef.current = stream;
    setFacingMode(mode);

    // Attach stream to video and attempt to play.
    // Set muted(true) BEFORE calling play to maximize autoplay success.
    try {
      if (videoRef.current) {
        // Ensure video element visible so any poster/placeholder doesn't hide it
        videoRef.current.muted = true;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (videoRef.current as any).srcObject = stream;

        try {
          // try to play
          await videoRef.current.play();
          // Small settle delay on some devices
          await new Promise((r) => setTimeout(r, 50));
          setIsCameraActive(true);
        } catch (playErr) {
          // As a last attempt try setting muted true again and play
          try {
            videoRef.current.muted = true;
            await videoRef.current.play();
            await new Promise((r) => setTimeout(r, 50));
            setIsCameraActive(true);
          } catch {
            // Failed to play — stop and show error
            stopCamera();
            setError(
              "Unable to play camera preview. Check browser autoplay / permission settings.",
            );
            return;
          }
        }
      } else {
        // If video not mounted (shouldn't happen because it's always rendered), keep stream in ref.
        setIsCameraActive(true);
      }
    } catch (attachErr) {
      setError("Failed to attach camera preview.");
      stopCamera();
    }
  };

  const toggleCamera = () => {
    const newMode: FacingMode =
      facingMode === "environment" ? "user" : "environment";
    initCamera(newMode);
  };

  const handleUpload = async (dataUrl: string) => {
    setIsUploading(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/api/predict", {
        method: "POST",
        body: JSON.stringify({ dataUrl }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to process image.");

      // If backend says it's a no-match (Unknown/Mixed), do NOT update user state or create scan modal.
      if (data?.noMatch) {
        setPredictions(null);
        setError("No confident match — try a different angle or clearer photo.");
        return;
      }

      // Normal success path
      setPredictions(data.predictions ?? null);
      // Only refresh stats when we actually created a scan / returned valid match
      await refreshStats();
    } catch (err: any) {
      setError(err.message || "AI Inference failed. Check connectivity.");
      setPredictions(null);
    } finally {
      setIsUploading(false);
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    if (!video) {
      setError("No camera available.");
      return;
    }

    // Ensure video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Camera is still initializing. Try again in a moment.");
      return;
    }

    setIsFlashing(true);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      if (facingMode === "user") {
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    // show preview immediately (so user sees the captured image)
    setPreview(dataUrl);

    // Give the DOM a short moment to render preview before stopping stream to avoid flicker
    // (some mobile browsers will show a black frame if srcObject is detached immediately)
    setTimeout(() => {
      stopCamera();
    }, 180);

    // small flash duration
    setTimeout(() => setIsFlashing(false), 150);

    // Send to backend (fire-and-forget here, errors handled inside)
    void handleUpload(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !ALLOWED_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_MIME_TYPES)[number],
      )
    ) {
      setError(
        "Invalid file type. Please upload a PNG, JPG, JPEG or WEBP image.",
      );
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreview(dataUrl);
      void handleUpload(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const resetScanner = () => {
    setPreview(null);
    setPredictions(null);
    setError(null);
  };

  // -- Render Guards --
  if (isStatsLoading && !stats) return <LoadingScreen />;

  const topPred = predictions?.[0] ?? null;
  const topLabel = topPred ? topPred.label : "";
  const topProb = typeof topPred?.prob === "number" ? topPred.prob : 0;
  const noMatch = isNoMatchPrediction(predictions);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-emerald-100 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl shadow-sm shadow-emerald-200">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-tight">
                EcoScan
              </h1>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Neural Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold">
                {user?.email ?? "Contributor"}
              </p>
              <p className="text-xs text-emerald-600 font-medium">System Nominal</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                alt="avatar"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Scanner */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card className="relative overflow-hidden border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white rounded-[2rem]">
            <div className="aspect-[4/5] relative bg-slate-50 overflow-hidden">
              {/* Video is always mounted and visible while attempting to start.
                  We keep it in the DOM, give explicit z-index, and conditionally darken the overlay
                  only when we're showing a captured preview (so live camera won't be hidden). */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                // z-index low so overlays/controls can appear above
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-transform duration-300 z-0",
                  facingMode === "user" ? "-scale-x-100" : "",
                )}
              />

              <AnimatePresence mode="wait">
                {/* Idle */}
                {!isCameraActive && !preview && (
                  <motion.div
                    {...FADE}
                    className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10"
                  >
                    <div
                      className="mb-8 relative group cursor-pointer"
                      onClick={() => initCamera("environment")}
                    >
                      <div className="absolute inset-0 bg-emerald-100 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 group-hover:scale-105 transition-transform duration-300">
                        <Camera className="w-10 h-10 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-slate-800 mb-2">Scan an Item</h2>
                    <p className="text-slate-500 text-sm mb-8 max-w-[240px]">
                      Use your lens or upload an image to identify recyclable materials.
                    </p>

                    <div className="w-full space-y-3 px-4">
                      <Button
                        onClick={() => initCamera("environment")}
                        className="w-full rounded-xl text-white bg-slate-900 hover:bg-black py-6 shadow-md text-base"
                      >
                        Open Camera
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full rounded-xl py-6 border-slate-200 text-slate-600 hover:bg-slate-50"
                      >
                        <UploadCloud className="mr-2 h-4 w-4 text-slate-400" /> Upload Image
                      </Button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Media Active (live OR preview) */}
                {(isCameraActive || preview) && (
                  // NOTE: conditional background — only dark when showing captured preview AND camera not active.
                  <motion.div
                    {...FADE}
                    className={cn(
                      "absolute inset-0",
                      // when showing preview (camera off), darken the background to emphasize preview
                      preview && !isCameraActive ? "bg-black z-10" : "bg-transparent z-10",
                    )}
                  >
                    {/* show captured preview only when camera is NOT active */}
                    {preview && !isCameraActive && (
                      <img
                        src={preview}
                        className="absolute inset-0 w-full h-full object-cover z-20"
                        alt="preview"
                      />
                    )}

                    {/* If camera initializing/running but can't show video, show a small loader */}
                    {!isCameraActive && !preview && (
                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <Aperture className="w-10 h-10 text-emerald-400 animate-spin-slow" />
                      </div>
                    )}

                    {/* Camera controls (only when active) */}
                    {isCameraActive && (
                      <div className="absolute bottom-8 inset-x-0 flex justify-center items-center gap-6 z-30">
                        <button
                          onClick={stopCamera}
                          className="p-4 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all border border-white/10"
                        >
                          <X className="w-6 h-6" />
                        </button>

                        <button
                          onClick={captureImage}
                          className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center p-1.5 transition-transform active:scale-90 border border-white/30 z-30"
                        >
                          <div className="w-full h-full bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                        </button>

                        <button
                          onClick={toggleCamera}
                          className="p-4 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all border border-white/10"
                        >
                          <SwitchCamera className="w-6 h-6" />
                        </button>
                      </div>
                    )}

                    {/* Shutter Flash */}
                    {isFlashing && <div className="absolute inset-0 bg-white z-50" />}

                    {/* Processing Overlay */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-40">
                        <Aperture className="w-10 h-10 text-emerald-400 animate-spin-slow mb-4" />
                        <p className="text-emerald-50 font-mono text-xs tracking-widest uppercase animate-pulse">
                          Analyzing Material...
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results Drawer */}
              <AnimatePresence>
                {(predictions || error) && (
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={SPRING}
                    className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2rem] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50"
                  >
                    {error ? (
                      <div className="text-center pb-2">
                        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
                        <p className="text-rose-900 font-bold mb-1">Analysis Failed</p>
                        <p className="text-rose-600 text-sm mb-6">{error}</p>
                        <Button
                          onClick={resetScanner}
                          variant="outline"
                          className="w-full rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : noMatch ? (
                      <div className="text-center pb-2">
                        <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-900 font-bold mb-1">No Match Found</p>
                        <p className="text-slate-500 text-sm mb-6">
                          The model couldn't confidently identify this item. Try another angle or upload a clearer image.
                        </p>
                        <Button
                          onClick={resetScanner}
                          variant="outline"
                          className="w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          Scan Another Item
                        </Button>
                      </div>
                    ) : (
                      <div className="pb-2">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                              Match Found
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                            {(topProb * 100).toFixed(1)}% Conf.
                          </span>
                        </div>

                        <h3 className="text-3xl font-black capitalize text-slate-900 mb-1">{topLabel}</h3>
                        <p className="text-sm text-slate-500 mb-6">Identified via neural network.</p>

                        <Button onClick={resetScanner} className="w-full rounded-xl bg-slate-900 hover:bg-black text-white">
                          Scan Another Item <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BentoStat
              icon={Leaf}
              label="Diverted"
              value={`${((stats?.totalScans || 0) * 0.1).toFixed(1)} kg`}
              color="emerald"
            />
            <BentoStat
              icon={Star}
              label="Eco Score"
              value={stats?.ecoScore?.toLocaleString() || "0"}
              color="violet"
            />
            <BentoStat
              icon={Flame}
              label="Streak"
              value={`${stats?.streak || 0} Days`}
              color="orange"
            />
          </div>

          <Card className="border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white rounded-[2rem] p-6 md:p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Total Contributions</h3>
                <p className="text-sm text-slate-500">Lifetime scanning metrics</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <BarChart3 className="w-5 h-5 text-slate-400" />
              </div>
            </div>

            <div className="flex items-end gap-4 mb-8">
              <span className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none">
                {stats?.totalScans || 0}
              </span>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Items</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
                <span>Next Milestone Progress</span>
                <span className="text-emerald-600">{progressToNextRank.toFixed(0)}%</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNextRank}%` }}
                  transition={SPRING}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>
          </Card>

          <Card className="border border-slate-200/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white rounded-[2rem] p-6 overflow-hidden">
            <h3 className="text-sm font-bold text-slate-900 mb-6">Material Breakdown</h3>
            <WasteDistributionChart stats={stats} />
          </Card>
        </div>
      </main>
    </div>
  );
}

/* --- Subcomponents --- */

function BentoStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  const themes: Record<string, string> = {
    emerald: "text-emerald-600 bg-emerald-50 ring-emerald-100",
    violet: "text-violet-600 bg-violet-50 ring-violet-100",
    orange: "text-orange-600 bg-orange-50 ring-orange-100",
  };

  return (
    <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-200/60 flex flex-col justify-between h-32 hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-start">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center ring-1 ring-inset",
            themes[color],
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center">
        <Aperture className="w-10 h-10 text-emerald-500 animate-spin-slow mb-4" />
        <p className="font-mono text-xs font-bold tracking-widest text-slate-400 uppercase">Loading Dashboard...</p>
      </div>
    </div>
  );
}