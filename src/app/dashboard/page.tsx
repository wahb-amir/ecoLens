"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useUserStats } from "@/lib/use-user-stats";
import { useAuth } from "../providers/AuthProvider";
import { WasteDistributionChart } from "@/components/dashboard/WasteDistributionChart";
import { cn } from "@/lib/utils";
import {
  Camera, Leaf, Flame, BarChart3, X, Aperture, AlertCircle,
  Star, UploadCloud, CheckCircle2, ChevronRight, SwitchCamera,
  CloudRain, Droplets, Globe2, Zap, Info, TrendingUp, Award,
  RefreshCcw, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Logic Constants ---
const MATERIAL_TIPS: Record<string, { tip: string; impact: string }> = {
  plastic: { tip: "Rinse before recycling to avoid contamination.", impact: "Saved 2.5kg of petroleum." },
  paper: { tip: "Do not recycle if soaked in oil/grease (like pizza boxes).", impact: "Preserved 0.5 trees this month." },
  metal: { tip: "Aluminum can be recycled infinitely without losing quality.", impact: "Reduced mining waste by 40%." },
  glass: { tip: "Remove caps; they are often made of different materials.", impact: "Lowered furnace CO₂ emissions." },
};

export default function UpscaledDashboard() {
  const { stats, refreshStats, isLoading: isStatsLoading } = useUserStats();
  const { fetchWithAuth, user } = useAuth();

  // -- Interaction States --
  const [activeMaterial, setActiveMaterial] = useState<string>("plastic");
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [predictions, setPredictions] = useState<any[] | null>(null);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);

  // -- Refs --
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // -- Camera & Hardware Logic --
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsStartingCamera(false);
  }, []);

  const startCamera = async () => {
    setError(null);
    setPreview(null);
    setPredictions(null);
    setIsStartingCamera(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser API not supported");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          setIsStartingCamera(false);
        };
      }
    } catch (err: any) {
      setIsStartingCamera(false);
      let title = "Camera Access Failed";
      let message = "Unable to access your device camera.";
      
      if (err.name === "NotAllowedError") {
        message = "Camera permission was denied. Please allow access or upload a photo instead.";
      } else if (err.name === "NotFoundError") {
        message = "No camera hardware detected on this device.";
      } else if (err.message === "Browser API not supported") {
        message = "Your browser does not support camera access. Please use file upload.";
      }

      setError({ title, message });
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
    stopCamera();
    setTimeout(startCamera, 300); // Brief delay to ensure tracks unmount cleanly
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setPreview(imageData);
        stopCamera();
        processImage(imageData);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g., max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError({ title: "File Too Large", message: "Please select an image under 10MB." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreview(result);
      setError(null);
      processImage(result);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64Image: string) => {
    setIsUploading(true);
    setPredictions(null);
    setError(null);

    try {
      // MOCK API CALL - Replace with actual fetchWithAuth AI logic
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      
      // Simulating a successful AI classification
      setPredictions([
        { label: "PET Plastic Bottle", confidence: 94.2, category: "plastic" }
      ]);
      
      // Trigger a stat refresh here if processing updates backend scores
      // await refreshStats();
    } catch (err) {
      setError({ title: "Analysis Failed", message: "Our neural net encountered a glitch. Please try again." });
    } finally {
      setIsUploading(false);
    }
  };

  const resetScanner = () => {
    setPreview(null);
    setPredictions(null);
    setError(null);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);


  // -- Data Calculations --
  const impactData = useMemo(() => {
    const total = stats?.totalScans || 0;
    return {
      co2: (total * 0.15).toFixed(1),
      water: (total * 2.5).toFixed(0),
      energy: (total * 3).toFixed(0),
      monthlyTrend: "+12%" 
    };
  }, [stats]);

  if (isStatsLoading && !stats) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20 overflow-x-hidden">
      {/* Dynamic Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-200/50">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">EcoScan <span className="text-emerald-500">Pro</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <Award className="w-3 h-3 text-amber-500" /> Top 5% Contributor
              </div>
              <p className="text-sm font-bold text-slate-900">Level {Math.floor((stats?.totalScans || 0) / 50) + 1} Guardian</p>
            </div>
            <div className="h-10 w-10 rounded-full border-2 border-emerald-500 p-0.5">
              <img className="rounded-full bg-slate-100" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="avatar" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: THE SCANNER & QUICK STATS */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="relative overflow-hidden border-none shadow-2xl bg-black rounded-[2.5rem] aspect-[3/4] lg:sticky lg:top-28 flex flex-col justify-end">
            
            {/* Hidden canvas for image capture */}
            <canvas ref={canvasRef} className="hidden" />
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload} 
            />

            {/* Video Feed */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-500", 
                isCameraActive ? "opacity-100" : "opacity-0")} 
            />

            {/* Preview Layer */}
            {preview && (
              <motion.img 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                src={preview} 
                alt="Captured material" 
                className="absolute inset-0 w-full h-full object-cover z-20"
              />
            )}
            
            {/* UI Overlay */}
            <div className="absolute inset-0 z-30 flex flex-col justify-between p-6">
              
              {/* Top Controls */}
              <div className="flex justify-end">
                {isCameraActive && !preview && (
                  <Button variant="ghost" size="icon" onClick={toggleCamera} className="bg-black/40 text-white hover:bg-black/60 backdrop-blur-md rounded-full">
                    <SwitchCamera className="w-5 h-5" />
                  </Button>
                )}
                {preview && !isUploading && (
                  <Button variant="ghost" size="icon" onClick={resetScanner} className="bg-black/40 text-white hover:bg-black/60 backdrop-blur-md rounded-full">
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>

              {/* Center Status / Errors */}
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <AnimatePresence mode="wait">
                  {error ? (
                    <motion.div 
                      key="error"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-red-500/90 backdrop-blur-md p-6 rounded-3xl w-full max-w-[85%] shadow-2xl border border-red-400"
                    >
                      <AlertCircle className="w-10 h-10 text-white mx-auto mb-3" />
                      <h3 className="text-white font-bold mb-1">{error.title}</h3>
                      <p className="text-red-100 text-sm mb-4">{error.message}</p>
                      <Button onClick={() => fileInputRef.current?.click()} className="bg-white text-red-600 w-full rounded-xl hover:bg-red-50">
                        <ImageIcon className="w-4 h-4 mr-2" /> Upload Photo
                      </Button>
                    </motion.div>
                  ) : isUploading ? (
                    <motion.div 
                      key="uploading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-black/60 backdrop-blur-md p-6 rounded-3xl shadow-2xl"
                    >
                      <Aperture className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
                      <p className="text-white font-bold tracking-wider">Analyzing Material...</p>
                    </motion.div>
                  ) : predictions ? (
                    <motion.div 
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/95 backdrop-blur-md p-6 rounded-3xl w-full shadow-2xl border-b-4 border-emerald-500 text-slate-900"
                    >
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Identified</p>
                      <h3 className="text-xl font-black mb-1">{predictions[0].label}</h3>
                      <p className="text-emerald-600 font-bold text-sm mb-4">{predictions[0].confidence}% Match</p>
                      <Button onClick={resetScanner} className="w-full bg-slate-900 text-white rounded-xl hover:bg-slate-800">
                        Scan Another
                      </Button>
                    </motion.div>
                  ) : !isCameraActive && !isStartingCamera && !preview && (
                    <motion.div 
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="bg-white/10 p-6 rounded-full inline-block backdrop-blur-md border border-white/20">
                        <Camera className="w-12 h-12 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Neural Lens Ready</h2>
                      <p className="text-slate-300 text-sm max-w-[200px] mx-auto">Point your camera at any waste material to classify it instantly.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Action Area */}
              {!preview && !error && (
                <div className="pt-6">
                  {isCameraActive ? (
                    <div className="flex items-center justify-center gap-4">
                      <button onClick={stopCamera} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                      <button onClick={captureImage} className="w-20 h-20 rounded-full border-4 border-white/50 flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                        <div className="w-16 h-16 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
                      </button>
                      <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors">
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
                        {isStartingCamera ? <Aperture className="w-6 h-6 animate-spin" /> : "Activate Camera"}
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

          {/* Milestone Card */}
          <Card className="p-6 rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl">
             {/* ... [Milestone Card Content - unchanged] ... */}
             <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Current Milestone</p>
                <h3 className="text-xl font-bold">Earth Guardian II</h3>
              </div>
              <TrendingUp className="text-emerald-400 w-5 h-5" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span>{stats?.totalScans || 0} / 250 Scans</span>
                <span>{impactData.monthlyTrend} this month</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE INSIGHTS */}
        <div className="lg:col-span-7 space-y-8">
           {/* ... [Right Column Content - unchanged] ... */}
           <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Lifetime Impact</h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold">LIVE DATA</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ImpactCard icon={CloudRain} value={`${impactData.co2}kg`} label="CO₂ Offset" theme="blue" />
              <ImpactCard icon={Droplets} value={`${impactData.water}L`} label="Water Saved" theme="cyan" />
              <ImpactCard icon={Zap} value={`${impactData.energy}h`} label="Energy Saved" theme="amber" />
            </div>
          </section>

          <section className="space-y-4">
             <Card className="p-8 rounded-[2.5rem] bg-white border-slate-200/60 shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">Material Breakdown</h3>
                    <p className="text-sm text-slate-500 mb-6">Select a material to see recycling tips.</p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {Object.keys(MATERIAL_TIPS).map((mat) => (
                        <button
                          key={mat}
                          onClick={() => setActiveMaterial(mat)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border",
                            activeMaterial === mat 
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-105" 
                              : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
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
                            <p className="text-xs font-bold text-emerald-900 uppercase mb-1">Pro Tip</p>
                            <p className="text-sm text-emerald-800 leading-relaxed">{MATERIAL_TIPS[activeMaterial].tip}</p>
                            <div className="mt-3 pt-3 border-t border-emerald-200/50 flex items-center gap-2">
                              <Star className="w-3 h-3 text-emerald-600" />
                              <p className="text-[11px] font-bold text-emerald-700">Impact: {MATERIAL_TIPS[activeMaterial].impact}</p>
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
            <BentoStat icon={Star} label="Total Score" value={stats?.ecoScore?.toLocaleString() || "0"} color="violet" />
            <BentoStat icon={Flame} label="Daily Streak" value={`${stats?.streak || 0} Days`} color="orange" />
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Subcomponents ---

function BentoStat({ icon: Icon, label, value, color }: any) {
  const themes: any = {
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };
  return (
    <Card className="p-6 border-slate-100 shadow-sm rounded-[2rem] flex items-center gap-4 bg-white">
      <div className={cn("p-3 rounded-2xl border", themes[color])}><Icon className="w-5 h-5" /></div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
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
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 border transition-transform group-hover:scale-110", themes[theme])}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
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