"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import LandingHeader from "./Navbar";
import dynamic from "next/dynamic";
import { useAuth } from "@/app/providers/AuthProvider";

const Globe = dynamic(() => import("./Globe").then((m) => m.Globe), {
  ssr: false,
  loading: () => null,
});

export default function HeroSection() {
  const { user } = useAuth();
  console.log(user);
  return (
    <section className="w-full h-screen relative flex items-center justify-center text-center overflow-hidden bg-[#020817]">
      <LandingHeader />

      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <Canvas
          camera={{ position: [0, 0, 2.5] }}
          style={{ width: "100%", height: "100%" }}
        >
          <ambientLight intensity={0.2} />
          <directionalLight position={[2, 2, 2]} intensity={2.5} />
          <Suspense fallback={null}>
            <Globe />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute inset-0 bg-black/60 z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-20 flex flex-col items-center px-4"
      >
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-lg">
          Classify Waste. Track Impact. Save the Planet.
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-white/80">
          Upload photos of your waste, see your eco impact, and explore global
          environmental data in real time.
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link href={user ? "/dashboard" : "/login"}>
            <Button
              size="lg"
              className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-8 py-6 text-lg shadow-2xl bg-green-500 text-white"
            >
              Get Started
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
