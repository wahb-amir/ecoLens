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
  X,
  Aperture,
  AlertCircle,
  Star,
  UploadCloud,
  CheckCircle2,
  SwitchCamera,
  CloudRain,
  Droplets,
  Globe2,
  Zap,
  Info,
  TrendingUp,
  Award,
  RefreshCcw,
  Coffee,
  Image as ImageIcon,
  Heart,
  Rocket,
  Trophy,
  Recycle,
  ShieldCheck,
  Target,
  Crown,
  Medal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────
// Achievement Registry
// ─────────────────────────────────────────────
const ACHIEVEMENT_REGISTRY: Record<
  string,
  {
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    rarity: "common" | "rare" | "epic" | "legendary";
  }
> = {
  first_scan: {
    title: "First Steps",
    description: "Completed your very first waste scan.",
    icon: Camera,
    color: "bg-sky-500",
    rarity: "common",
  },
  waste_warrior: {
    title: "Waste Warrior",
    description: "Scanned 10 items and fought back against waste.",
    icon: ShieldCheck,
    color: "bg-emerald-500",
    rarity: "rare",
  },
  plastic_hunter: {
    title: "Plastic Hunter",
    description: "Identified 5 plastic items for recycling.",
    icon: Target,
    color: "bg-blue-500",
    rarity: "rare",
  },
  streak_starter: {
    title: "Streak Starter",
    description: "Scanned waste 3 days in a row.",
    icon: Flame,
    color: "bg-orange-500",
    rarity: "common",
  },
  on_fire: {
    title: "On Fire 🔥",
    description: "Maintained a 7-day scanning streak.",
    icon: Flame,
    color: "bg-red-500",
    rarity: "epic",
  },
  eco_champion: {
    title: "Eco Champion",
    description: "Reached 500 EcoPoints.",
    icon: Trophy,
    color: "bg-amber-500",
    rarity: "epic",
  },
  green_legend: {
    title: "Green Legend",
    description: "Reached 1000 EcoPoints. You're a legend.",
    icon: Crown,
    color: "bg-yellow-500",
    rarity: "legendary",
  },
  recycler: {
    title: "Born Recycler",
    description: "Scanned 25 recyclable items.",
    icon: Recycle,
    color: "bg-teal-500",
    rarity: "rare",
  },
  century: {
    title: "Century",
    description: "100 total scans. Remarkable dedication.",
    icon: Medal,
    color: "bg-violet-500",
    rarity: "legendary",
  },
  speed_scanner: {
    title: "Speed Scanner",
    description: "Scanned 5 items in a single day.",
    icon: Zap,
    color: "bg-cyan-500",
    rarity: "common",
  },
};

const RARITY_CONFIG = {
  common: {
    label: "Common",
    pill: "bg-slate-700 text-slate-300",
    bar: "from-slate-400 to-slate-500",
  },
  rare: {
    label: "Rare",
    pill: "bg-blue-900/60 text-blue-300",
    bar: "from-blue-400 to-blue-600",
  },
  epic: {
    label: "Epic",
    pill: "bg-violet-900/60 text-violet-300",
    bar: "from-violet-400 to-violet-600",
  },
  legendary: {
    label: "Legendary",
    pill: "bg-amber-900/60 text-amber-300",
    bar: "from-amber-400 to-yellow-400",
  },
};

// ─────────────────────────────────────────────
// AchievementToast
// ─────────────────────────────────────────────
function AchievementToast({
  achievementKeys,
  onDone,
}: {
  achievementKeys: string[];
  onDone: () => void;
}) {
  const [queue, setQueue] = useState<string[]>(achievementKeys);
  const [visible, setVisible] = useState(true);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  const current = queue[0];
  const data = current ? ACHIEVEMENT_REGISTRY[current] : null;

  useEffect(() => {
    if (!current) {
      onDone();
      return;
    }
    setVisible(true);
    dismissTimerRef.current = setTimeout(() => advance(), 5000);
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  const advance = useCallback(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setVisible(false);
    setTimeout(() => setQueue((prev) => prev.slice(1)), 380);
  }, []);

  if (!data) return null;

  const IconComponent = data.icon as React.ElementType;
  const rarity = RARITY_CONFIG[data.rarity];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 72, scale: 0.86 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 48, scale: 0.93 }}
          transition={{ type: "spring", stiffness: 360, damping: 28 }}
          className="fixed bottom-6 left-0 right-0 mx-auto w-[calc(100%-2rem)] max-w-sm z-[300]"
        >
          <div className="relative bg-slate-950 rounded-[1.75rem] overflow-hidden border border-white/[0.08] shadow-[0_30px_80px_-10px_rgba(0,0,0,0.7)]">
            {/* Shimmer sweep on entry */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "220%" }}
              transition={{ duration: 1.0, delay: 0.25, ease: "easeOut" }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none z-10"
            />

            {/* Particle burst */}
            {[...Array(8)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0.9, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 1,
                  x: Math.cos((i / 8) * Math.PI * 2) * 52,
                  y: Math.sin((i / 8) * Math.PI * 2) * 52,
                }}
                transition={{
                  duration: 0.65,
                  delay: 0.08 + i * 0.04,
                  ease: "easeOut",
                }}
                className={cn(
                  "absolute top-1/2 left-[3.75rem] w-1.5 h-1.5 rounded-full pointer-events-none",
                  i % 3 === 0
                    ? "bg-emerald-400"
                    : i % 3 === 1
                      ? "bg-amber-400"
                      : "bg-white/50",
                )}
              />
            ))}

            {/* Main content */}
            <div className="relative z-20 flex items-center gap-4 p-4 pr-3">
              {/* Icon with scale-in + pulse ring */}
              <div className="relative shrink-0">
                <motion.div
                  initial={{ scale: 0.4, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 17,
                    delay: 0.08,
                  }}
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                    data.color,
                  )}
                >
                  <IconComponent className="w-7 h-7 text-white drop-shadow" />
                </motion.div>
                {/* Expanding ring */}
                <motion.span
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.75, delay: 0.12, ease: "easeOut" }}
                  className={cn(
                    "absolute inset-0 rounded-2xl pointer-events-none",
                    data.color,
                  )}
                />
              </div>

              {/* Text block */}
              <div className="flex-1 min-w-0">
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-400 mb-0.5"
                >
                  Achievement Unlocked
                </motion.p>
                <motion.h3
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24 }}
                  className="text-white font-black text-[15px] leading-tight truncate"
                >
                  {data.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-400 text-[11px] mt-0.5 leading-snug line-clamp-2"
                >
                  {data.description}
                </motion.p>
                <motion.span
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className={cn(
                    "inline-block mt-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                    rarity.pill,
                  )}
                >
                  {rarity.label}
                </motion.span>
              </div>

              {/* Dismiss with countdown ring */}
              <button
                onClick={advance}
                className="relative shrink-0 w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
              >
                <svg
                  className="absolute inset-0 w-8 h-8 -rotate-90"
                  viewBox="0 0 32 32"
                >
                  <circle
                    cx="16"
                    cy="16"
                    r="13"
                    fill="none"
                    stroke="white"
                    strokeOpacity="0.08"
                    strokeWidth="2"
                  />
                  <motion.circle
                    cx="16"
                    cy="16"
                    r="13"
                    fill="none"
                    stroke="white"
                    strokeOpacity="0.35"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 13}`}
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 13 }}
                    transition={{ duration: 5, ease: "linear" }}
                  />
                </svg>
                <X className="w-3.5 h-3.5 relative z-10" />
              </button>
            </div>

            {/* Bottom progress bar */}
            <div className="h-[3px] bg-white/5">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className={cn("h-full bg-gradient-to-r", rarity.bar)}
              />
            </div>
          </div>

          {/* Queue dots */}
          {queue.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center gap-1.5 mt-2.5"
            >
              {queue.map((k, i) => (
                <div
                  key={k}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === 0
                      ? "w-5 h-1.5 bg-emerald-400"
                      : "w-1.5 h-1.5 bg-slate-600",
                  )}
                />
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// Logic Constants
// ─────────────────────────────────────────────
const MATERIAL_TIPS: Record<string, { tip: string; impact: string }> = {
  plastic: {
    tip: "Rinse before recycling to avoid contamination.",
    impact: "Saved 2.5kg of petroleum.",
  },
  paper: {
    tip: "Do not recycle if soaked in oil/grease (like pizza boxes).",
    impact: "Preserved 0.5 trees this month.",
  },
  metal: {
    tip: "Aluminum can be recycled infinitely without losing quality.",
    impact: "Reduced mining waste by 40%.",
  },
  glass: {
    tip: "Remove caps; they are often made of different materials.",
    impact: "Lowered furnace CO₂ emissions.",
  },
};

// ─────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────
export default function UpscaledDashboard() {
  const { stats, refreshStats, isLoading: isStatsLoading } = useUserStats();
  const { fetchWithAuth, user } = useAuth();

  const [isColdStarting, setIsColdStarting] = useState(false);
  const [showColdStartThankYou, setShowColdStartThankYou] = useState(false);
  const coldStartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const coldStartThankYouTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const didExperienceColdStartRef = useRef(false);

  // Achievements
  const [pendingAchievements, setPendingAchievements] = useState<string[]>([]);

  const [activeMaterial, setActiveMaterial] = useState<string>("plastic");
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );
  const [predictions, setPredictions] = useState<any[] | null>(null);
  const [error, setError] = useState<{ title: string; message: string } | null>(
    null,
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stopCamera = useCallback(() => {
    try {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
    } catch (e) {
      console.warn("stopCamera:", e);
    }
    setIsCameraActive(false);
    setIsStartingCamera(false);
  }, []);

  const startCamera = async () => {
    setError(null);
    setPreview(null);
    setPredictions(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx)
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasRef.current.width = 0;
      canvasRef.current.height = 0;
    }
    if (!navigator?.mediaDevices?.getUserMedia) {
      setError({
        title: "Camera Unsupported",
        message: "Your browser doesn't support camera access.",
      });
      return;
    }
    setIsStartingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.warn);
          setIsCameraActive(true);
          setIsStartingCamera(false);
        };
      } else {
        setIsCameraActive(true);
        setIsStartingCamera(false);
      }
    } catch (err: any) {
      let message = "Unable to access camera.";
      if (
        err?.name === "NotAllowedError" ||
        err?.name === "PermissionDeniedError"
      )
        message =
          "Camera access denied. Allow permissions in your browser settings.";
      else if (
        err?.name === "NotFoundError" ||
        err?.name === "DevicesNotFoundError"
      )
        message = "No camera found. Connect a camera and try again.";
      else if (err?.name === "NotReadableError")
        message = "Camera is already in use by another app.";
      else if (err?.message) message = err.message;
      setError({ title: "Camera Error", message });
      setIsStartingCamera(false);
    }
  };

  const toggleCamera = () => {
    setFacingMode((p) => (p === "environment" ? "user" : "environment"));
    stopCamera();
    setTimeout(() => startCamera(), 300);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const va = video.videoWidth / video.videoHeight || 16 / 9;
    let sx = 0,
      sy = 0,
      sw = 0,
      sh = 0;
    if (va > 3 / 4) {
      sh = video.videoHeight;
      sw = sh * (3 / 4);
      sx = (video.videoWidth - sw) / 2;
    } else {
      sw = video.videoWidth;
      sh = sw / (3 / 4);
      sy = (video.videoHeight - sh) / 2;
    }
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 600, 800);
    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    setPreview(imageData);
    stopCamera();
    processImage(imageData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(
        file.type,
      )
    ) {
      setError({
        title: "Invalid Format",
        message: "Please upload PNG, JPG, or WebP.",
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError({
        title: "File Too Large",
        message: "Please select an image under 10MB.",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPredictions(null);
      setError(null);
      setPreview(result);
      processImage(result);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64Image: string) => {
    setIsUploading(true);
    setPredictions(null);
    setError(null);
    setIsColdStarting(false);
    didExperienceColdStartRef.current = false;

    coldStartTimeoutRef.current = setTimeout(() => {
      setIsColdStarting(true);
      didExperienceColdStartRef.current = true;
    }, 8000);

    try {
      const res = await fetchWithAuth("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: base64Image }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to process image.");

      if (didExperienceColdStartRef.current) {
        setShowColdStartThankYou(true);
        coldStartThankYouTimeoutRef.current = setTimeout(
          () => setShowColdStartThankYou(false),
          6000,
        );
      }

      if (data?.noMatch) {
        setError({
          title: "Nothing to Recycle",
          message:
            data.message ||
            "We couldn't detect any recyclable waste. Try another angle!",
        });
        return;
      }

      // Queue new achievements (only keys we know about)
      if (data?.newAchievements?.length) {
        const known = (data.newAchievements as string[]).filter(
          (k) => k in ACHIEVEMENT_REGISTRY,
        );
        if (known.length) setPendingAchievements(known);
      }

      setPredictions(data.predictions ?? null);
      await refreshStats();
    } catch (err: any) {
      setError({
        title: "Analysis Failed",
        message: err?.message || "Our neural net encountered a glitch.",
      });
    } finally {
      setIsUploading(false);
      setIsColdStarting(false);
      didExperienceColdStartRef.current = false;
      if (coldStartTimeoutRef.current)
        clearTimeout(coldStartTimeoutRef.current);
    }
  };

  const resetScanner = () => {
    setPreview(null);
    setPredictions(null);
    setError(null);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx)
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasRef.current.width = 0;
      canvasRef.current.height = 0;
    }
    setIsColdStarting(false);
    if (coldStartTimeoutRef.current) clearTimeout(coldStartTimeoutRef.current);
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (coldStartTimeoutRef.current)
        clearTimeout(coldStartTimeoutRef.current);
      if (coldStartThankYouTimeoutRef.current)
        clearTimeout(coldStartThankYouTimeoutRef.current);
    };
  }, [stopCamera]);

  const impactData = useMemo(() => {
    const total = stats?.totalScans || 0;
    // Each milestone tier is 50 scans; cap display at 250
    const MILESTONE_SIZE = 50;
    const MILESTONE_CAP = 250;
    const scansTowardCap = Math.min(total, MILESTONE_CAP);
    const progressPct = Math.min((scansTowardCap / MILESTONE_CAP) * 100, 100);
    // Within the current tier (0–49 scans), how far along are we?
    const scansInCurrentTier = total % MILESTONE_SIZE;
    const tierProgressPct = Math.min(
      (scansInCurrentTier / MILESTONE_SIZE) * 100,
      100,
    );

    return {
      co2: (total * 0.15).toFixed(1),
      water: (total * 2.5).toFixed(0),
      energy: (total * 3).toFixed(0),
      monthlyTrend: "+12%",
      progressPct,
      tierProgressPct,
      scansInCurrentTier,
      scansToNextTier: MILESTONE_SIZE - scansInCurrentTier,
    };
  }, [stats]);

  if (isStatsLoading && !stats) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 overflow-x-hidden">
      {/* Achievement Toast */}
      {pendingAchievements.length > 0 && (
        <AchievementToast
          achievementKeys={pendingAchievements}
          onDone={() => setPendingAchievements([])}
        />
      )}

      {/* Cold Start Thank-You Toast */}
      <AnimatePresence>
        {showColdStartThankYou && (
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-6 left-0 right-0 mx-auto w-[calc(100%-2rem)] max-w-sm z-[200]"
          >
            <div className="relative bg-white rounded-[1.75rem] shadow-[0_20px_60px_rgba(0,0,0,0.18)] border border-slate-100 p-5 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-t-[1.75rem]" />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-emerald-100 p-3 rounded-2xl">
                  <Heart className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 leading-snug">
                    Thanks for your patience! 🙏
                  </p>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    That was a{" "}
                    <span className="font-semibold text-emerald-600">
                      cold start
                    </span>{" "}
                    — the AI server was waking up. Future scans will be{" "}
                    <span className="font-semibold text-slate-700">
                      much faster
                    </span>
                    .
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Server is now warm &amp; ready</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowColdStartThankYou(false)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors mt-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-200/50">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              EcoScan <span className="text-emerald-500">Pro</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <Award className="w-3 h-3 text-amber-500" /> Top 5% Contributor
              </div>
              <p className="text-sm font-bold text-slate-900">
                Level {Math.floor((stats?.totalScans || 0) / 50) + 1} Guardian
              </p>
            </div>
            <div className="h-10 w-10 rounded-full border-2 border-emerald-500 p-0.5">
              <img
                className="rounded-full bg-slate-100"
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                alt="avatar"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Scanner */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="relative overflow-hidden border-none shadow-2xl bg-black rounded-[2.5rem] aspect-[3/4] lg:sticky lg:top-28 flex flex-col justify-end">
            <AnimatePresence>
              {isColdStarting && isUploading && (
                <motion.div
                  initial={{ opacity: 0, y: -40, scale: 0.9, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                  exit={{ opacity: 0, y: -40, scale: 0.9, x: "-50%" }}
                  className="absolute top-10 left-1/2 z-[60] bg-white border border-emerald-200 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4 w-[85%]"
                >
                  <div className="bg-emerald-100 p-3 rounded-2xl shrink-0">
                    <Coffee className="w-7 h-7 text-emerald-600 animate-bounce" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900 leading-tight">
                      Waking up the AI...
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Free servers take a moment to spin up.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <canvas ref={canvasRef} className="hidden" />
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "absolute inset-0 w-full h-full object-contain transition-opacity duration-500",
                preview
                  ? "opacity-0 pointer-events-none"
                  : isCameraActive
                    ? "opacity-100"
                    : "opacity-0",
              )}
            />

            {preview && (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={preview}
                alt="Captured material"
                className="absolute inset-0 w-full h-full object-contain z-20"
                key={preview.slice(0, 32)}
              />
            )}

            <div className="absolute inset-0 z-30 flex flex-col justify-between p-6">
              <div className="flex justify-end">
                {isCameraActive && !preview && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleCamera}
                    className="bg-black/40 text-white hover:bg-black/60 backdrop-blur-md rounded-full"
                  >
                    <SwitchCamera className="w-5 h-5" />
                  </Button>
                )}
                {preview && !isUploading && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetScanner}
                    className="bg-black/40 text-white hover:bg-black/60 backdrop-blur-md rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <AnimatePresence mode="wait">
                  {error && error.title !== "Nothing to Recycle" ? (
                    <motion.div
                      key="error"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-red-500/95 backdrop-blur-md p-6 rounded-3xl w-full max-w-[85%] shadow-2xl border border-red-400"
                    >
                      <AlertCircle className="w-10 h-10 text-white mx-auto mb-3" />
                      <h3 className="text-white font-bold mb-1">
                        {error.title}
                      </h3>
                      <p className="text-red-100 text-sm mb-4">
                        {error.message}
                      </p>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={startCamera}
                          className="bg-white text-red-600 w-full rounded-xl hover:bg-red-50"
                        >
                          <RefreshCcw className="w-4 h-4 mr-2" /> Try Camera
                          Again
                        </Button>
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="ghost"
                          className="text-white hover:bg-white/10"
                        >
                          <ImageIcon className="w-4 h-4 mr-2" /> Upload Instead
                        </Button>
                      </div>
                    </motion.div>
                  ) : error && error.title === "Nothing to Recycle" ? (
                    <motion.div
                      key="no-waste"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl w-full max-w-[85%] shadow-2xl border border-slate-700 text-center"
                    >
                      <div className="relative mx-auto mb-4 w-16 h-16">
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" />
                        <div className="relative bg-indigo-500 p-4 rounded-full">
                          <Globe2 className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-1">
                        {error.title}
                      </h3>
                      <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                        {error.message}
                      </p>
                      <Button
                        onClick={resetScanner}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl border-b-4 border-indigo-800 active:border-b-0 transition-all"
                      >
                        Scan Again
                      </Button>
                    </motion.div>
                  ) : isUploading ? (
                    <motion.div
                      key="uploading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-black/60 backdrop-blur-md p-8 rounded-full shadow-2xl border border-white/10"
                    >
                      <div className="relative">
                        <Aperture className="w-16 h-16 text-emerald-400 animate-spin" />
                        <div className="absolute inset-0 blur-xl bg-emerald-500/30 animate-pulse" />
                      </div>
                    </motion.div>
                  ) : predictions ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="bg-white/95 backdrop-blur-md p-6 rounded-[2.5rem] w-full shadow-2xl border-b-[6px] border-emerald-500 text-slate-900"
                    >
                      <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                      </div>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">
                        Material Classified
                      </p>
                      <h3 className="text-2xl font-black mb-1 capitalize">
                        {predictions[0].label.replace("_", " ")}
                      </h3>
                      <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${predictions[0].prob * 100}%` }}
                            className="h-full bg-emerald-500"
                          />
                        </div>
                        <p className="text-slate-500 font-bold text-xs">
                          {(predictions[0].prob * 100).toFixed(0)}% Certainty
                        </p>
                      </div>
                      <Button
                        onClick={resetScanner}
                        className="w-full h-12 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 font-bold"
                      >
                        Confirm & Continue
                      </Button>
                    </motion.div>
                  ) : (
                    !isCameraActive &&
                    !isStartingCamera &&
                    !preview && (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                      >
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full" />
                          <div className="relative bg-white/10 p-8 rounded-full backdrop-blur-md border border-white/20">
                            <Camera className="w-14 h-14 text-white" />
                          </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                          Neural Lens Ready
                        </h2>
                        <p className="text-slate-300 text-sm max-w-[220px] mx-auto leading-relaxed">
                          Classify your waste and earn EcoPoints instantly.
                        </p>
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>

              {!preview && !error && (
                <div className="pt-6">
                  {isCameraActive ? (
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={stopCamera}
                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button
                        onClick={captureImage}
                        className="w-20 h-20 rounded-full border-4 border-white/50 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                      >
                        <div className="w-16 h-16 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      <Button
                        onClick={startCamera}
                        disabled={isStartingCamera}
                        className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-lg font-bold shadow-xl shadow-emerald-900/40 text-white"
                      >
                        {isStartingCamera ? (
                          <Aperture className="w-6 h-6 animate-spin" />
                        ) : (
                          "Activate Camera"
                        )}
                      </Button>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="w-full h-12 border-white/20 bg-white/5 text-white hover:bg-white/10 rounded-xl"
                      >
                        <UploadCloud className="w-4 h-4 mr-2" /> Upload Image
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
                  Current Milestone
                </p>
                <h3 className="text-xl font-bold">
                  Earth Guardian{" "}
                  {
                    ["I", "II", "III", "IV", "V"][
                      Math.min(Math.floor((stats?.totalScans || 0) / 50), 4)
                    ]
                  }
                </h3>
              </div>
              <TrendingUp className="text-emerald-400 w-5 h-5" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span>{impactData.scansInCurrentTier} / 50 this tier</span>
                <span className="text-emerald-400">
                  {impactData.scansToNextTier} to next rank
                </span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${impactData.tierProgressPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                />
              </div>
              <p className="text-right text-[10px] text-white/30 font-mono">
                {stats?.totalScans || 0} total scans · {impactData.monthlyTrend}{" "}
                this month
              </p>
            </div>
          </Card>
        </div>

        {/* Right: Insights */}
        <div className="lg:col-span-7 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                Lifetime Impact
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold">
                LIVE DATA
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ImpactCard
                icon={CloudRain}
                value={`${impactData.co2}kg`}
                label="CO₂ Offset"
                theme="blue"
              />
              <ImpactCard
                icon={Droplets}
                value={`${impactData.water}L`}
                label="Water Saved"
                theme="cyan"
              />
              <ImpactCard
                icon={Zap}
                value={`${impactData.energy}h`}
                label="Energy Saved"
                theme="amber"
              />
            </div>
          </section>

          <section className="space-y-4">
            <Card className="p-8 rounded-[2.5rem] bg-white border-slate-200/60 shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">Material Breakdown</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Select a material to see recycling tips.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {Object.keys(MATERIAL_TIPS).map((mat) => (
                      <button
                        key={mat}
                        onClick={() => setActiveMaterial(mat)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border",
                          activeMaterial === mat
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-105"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100",
                        )}
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeMaterial}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100"
                    >
                      <div className="flex items-start gap-3">
                        <Info className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-emerald-900 uppercase mb-1">
                            Pro Tip
                          </p>
                          <p className="text-sm text-emerald-800 leading-relaxed">
                            {MATERIAL_TIPS[activeMaterial].tip}
                          </p>
                          <div className="mt-3 pt-3 border-t border-emerald-200/50 flex items-center gap-2">
                            <Star className="w-3 h-3 text-emerald-600" />
                            <p className="text-[11px] font-bold text-emerald-700">
                              Impact: {MATERIAL_TIPS[activeMaterial].impact}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="flex-1 min-h-[250px] relative">
                  <WasteDistributionChart stats={stats} />
                </div>
              </div>
            </Card>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <BentoStat
              icon={Star}
              label="Total Score"
              value={stats?.ecoScore?.toLocaleString() || "0"}
              color="violet"
            />
            <BentoStat
              icon={Flame}
              label="Daily Streak"
              value={`${stats?.streak || 0} Days`}
              color="orange"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────
function BentoStat({ icon: Icon, label, value, color }: any) {
  const themes: any = {
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };
  return (
    <Card className="p-6 border-slate-100 shadow-sm rounded-[2rem] flex items-center gap-4 bg-white">
      <div className={cn("p-3 rounded-2xl border", themes[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-xl font-black">{value}</p>
      </div>
    </Card>
  );
}

function ImpactCard({ icon: Icon, value, label, theme }: any) {
  const themes: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center mb-4 border transition-transform group-hover:scale-110",
          themes[theme],
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Aperture className="w-12 h-12 text-emerald-500 animate-spin" />
    </div>
  );
}
