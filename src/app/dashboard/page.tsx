"use client";

import React, { useState, useRef } from "react";
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
  RotateCcw,
  Image as ImageIcon,
  Smile,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { stats } = useEcoTracker();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- Logic for 3 New Metrics ---
  const carbonSaved = (stats.totalScans ?? 0) * 0.5; // Example: 0.5kg per scan
  const communityRank = "Top 15%"; // Simulated
  const currentStreak = 4; // Simulated

  const getRecyclingRate = () => {
    if (!stats || stats.totalScans === 0) return 0;
    const recyclableItems =
      (stats.scansByType["plastic"] || 0) +
      (stats.scansByType["paper"] || 0) +
      (stats.scansByType["metal"] || 0) +
      (stats.scansByType["glass"] || 0);
    return Math.round((recyclableItems / stats.totalScans) * 100);
  };

  // --- Camera & Upload Logic ---
  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing camera", err);
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    startCamera();
  };

  const handleCapture = () => {
    const canvas = document.createElement("canvas");
    if (videoRef.current) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      setPreview(dataUrl);
      processImage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        processImage();
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = () => {
    setIsUploading(true);
    setShowCamera(false);
    // Simulate backend binary upload
    setTimeout(() => {
      setIsUploading(false);
      setPreview(null);
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-white min-h-screen">
      {/* Friendly Header */}
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Welcome back!
        </h1>
        <p className="text-slate-500 text-lg">
          Your actions today are building a greener tomorrow.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Image Classification Tool */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-2 border-emerald-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-emerald-50/50">
              <CardTitle>Classify Waste</CardTitle>
              <CardDescription>
                Snap a photo to see where it belongs.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative aspect-square rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                {/* 1. Camera View */}
                {showCamera && !preview && (
                  <div className="absolute inset-0 bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                      <Button
                        onClick={handleCapture}
                        className="rounded-full h-12 w-12 bg-white hover:bg-slate-100 p-0"
                      >
                        <div className="h-10 w-10 rounded-full border-4 border-emerald-500" />
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={toggleCamera}
                        className="rounded-full h-12 w-12 p-0"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* 2. Loading State (Happy Earth Skeleton) */}
                {isUploading && (
                  <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-pulse">
                    <Smile className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
                    <p className="font-bold text-emerald-700">Identifying...</p>
                    <div className="mt-4 w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-1/2 animate-[progress_2s_ease-in-out_infinite]" />
                    </div>
                  </div>
                )}

                {/* 3. Static Preview */}
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* 4. Initial State */}
                {!showCamera && !preview && !isUploading && (
                  <div className="text-center p-8 space-y-4">
                    <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full w-fit mx-auto">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <p className="text-slate-500 font-medium">
                      No image selected
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button
                        onClick={startCamera}
                        variant="outline"
                        className="gap-2"
                      >
                        <Camera className="w-4 h-4" /> Camera
                      </Button>
                      <label>
                        <Button
                          variant="outline"
                          className="gap-2 pointer-events-none"
                        >
                          <Upload className="w-4 h-4" /> From Device
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Main Stats Grid */}
        <div className="lg:col-span-7 space-y-8">
          {/* Top Row: 3 New Metrics */}
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

          {/* Secondary Metrics & Chart */}
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
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-slate-500">Points Earned</span>
                  <span className="text-xl font-bold text-emerald-600">
                    100
                  </span>
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
