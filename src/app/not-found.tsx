'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Rocket, MoveLeft } from 'lucide-react';

// Animation variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 },
  },
};

export default function NotFound() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#020817] text-white flex items-center justify-center">
      {/* --- Background Elements --- */}
      
      {/* Stars (CSS Radial Gradient pattern) */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(white 1px, transparent 1px), radial-gradient(white 1px, transparent 1px)',
          backgroundSize: '50px 50px, 100px 100px',
          backgroundPosition: '0 0, 25px 25px',
        }}
      />
      
      {/* Subtle nebula glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />


      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 container mx-auto px-4 flex flex-col-reverse lg:flex-row items-center justify-center gap-12 lg:gap-24"
      >
        {/* --- Text Content --- */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-lg">
          <motion.div variants={itemVariants}>
            <p className="text-emerald-400 font-mono uppercase tracking-[0.3em] text-sm font-bold mb-4">
              Error Code: 404
            </p>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
          >
            Lost in the Cosmos.
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-slate-400 text-lg md:text-xl leading-relaxed mb-8"
          >
            The coordinates you're looking for don't exist in our star maps. You may have taken a wrong turn at the last nebula.
          </motion.p>

          <motion.div variants={itemVariants}>
            <Link href="/">
              <Button size="lg" className="group relative overflow-hidden bg-white text-slate-900 hover:bg-emerald-500 hover:text-white transition-all duration-300 px-8 py-6 text-lg font-bold rounded-xl">
                <span className="relative z-10 flex items-center gap-2">
                  <MoveLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Return to Base
                </span>
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* --- The Rotating Globe Visual --- */}
        <motion.div 
          variants={itemVariants}
          className="relative w-72 h-72 md:w-[500px] md:h-[500px] flex-shrink-0"
        >
          {/* 1. The Atmosphere Glow (Outer Ring) */}
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />
          
          {/* 2. The Globe Container */}
          <div className="relative w-full h-full rounded-full overflow-hidden shadow-[inset_-20px_-20px_50px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.2)] border border-slate-800/50">
            
            {/* 3. The Rotating Earth Image */}
            {/* We use a very wide, seamless texture of earth and animate it horizontally */}
            <motion.div
              animate={{
                x: ["0%", "-50%"],
              }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 20, // Adjust speed here (higher = slower)
              }}
              className="absolute inset-0 h-full w-[200%]"
              style={{
               
                backgroundImage: 'url("/earth_atmos_2048.avif")',
                backgroundSize: 'cover',
                backgroundRepeat: 'repeat-x'
              }}
            />

            {/* 4. Inner Shadow for 3D effect (Night side) */}
            <div className="absolute inset-0 rounded-full shadow-[inset_50px_20px_80px_rgba(0,0,0,0.6)] pointer-events-none" />
            
            {/* 5. Subtle orbital ring accessory */}
             <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border-[1px] border-slate-700/30 rounded-full"
                style={{ transformStyle: "preserve-3d", transform: "rotateX(75deg)" }}
             />
               <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] border-[1px] border-slate-800/30 rounded-full"
                style={{ transformStyle: "preserve-3d", transform: "rotateX(65deg) rotateY(20deg)" }}
             >
                <Rocket className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-500 rotate-90" />
             </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}