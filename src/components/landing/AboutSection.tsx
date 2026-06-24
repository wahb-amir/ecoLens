"use client";

import React, { useEffect, useState, memo } from "react";
import { motion, Variants } from "framer-motion";
import { Target, Globe, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// --- Types ---
interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  // runtime flags
  disableAnimation?: boolean;
  isTouch?: boolean;
}

// --- Animation Variants (lighter durations) ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.06 }, // lighter stagger
  },
};

const itemVariants: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }, // shorter duration
};

const FeatureCard: React.FC<FeatureCardProps> = memo(function FeatureCard({
  icon: Icon,
  title,
  description,
  badge,
  disableAnimation = false,
  isTouch = false,
}) {
  const motionProps = disableAnimation
    ? {}
    : {
        variants: itemVariants,
        whileHover: !isTouch
          ? { y: -6, transition: { duration: 0.18 } }
          : undefined,
      };

  const Container: any = disableAnimation ? "div" : motion.div;

  const shadowClass = isTouch
    ? ""
    : "hover:shadow-[0_20px_40px_rgba(16,185,129,0.08)]";
  const glowClass = isTouch ? "" : "group-hover:opacity-100";

  return (
    <Container
      {...motionProps} // ✅ only pass framer-motion props when valid
      className={`group relative overflow-hidden p-6 md:p-8 rounded-2xl border border-slate-200/60 bg-white/80 transition-all ${shadowClass} text-left`}
    >
      {/* Card Glow */}
      <div
        aria-hidden
        className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/6 blur-2xl transition-opacity ${glowClass}`}
      />

      <div
        className={`mb-4 inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 ring-1 ring-emerald-100 transition-all ${
          isTouch
            ? ""
            : "group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white"
        }`}
      >
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>

      {badge && (
        <span className="absolute top-4 right-4 font-mono text-[10px] font-bold text-emerald-600/40 uppercase tracking-widest">
          {badge}
        </span>
      )}

      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-[0.12em] mb-2">
        {title}
      </h4>
      <p className="text-[15px] text-slate-500 leading-relaxed font-normal">
        {description}
      </p>
    </Container>
  );
});
// cheap props equality: prevents re-renders when parent re-renders
function areEqualFeatureCard(prev: FeatureCardProps, next: FeatureCardProps) {
  return (
    prev.title === next.title &&
    prev.description === next.description &&
    prev.badge === next.badge &&
    prev.disableAnimation === next.disableAnimation &&
    prev.isTouch === next.isTouch &&
    prev.icon === next.icon
  );
}

// --- Main Section (optimized for mobile) ---
export default function AboutSection() {
  const [disableAnimation, setDisableAnimation] = useState(true);
  const [isTouch, setIsTouch] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // run only on client
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqTouch = window.matchMedia("(pointer: coarse), (hover: none)"); // touch first
    const mqSmall = window.matchMedia("(max-width: 768px)");

    const update = () => {
      setPrefersReducedMotion(mqMotion.matches);
      // disable animations for small screens OR coarse pointers OR reduced-motion
      setIsTouch(mqTouch.matches || mqSmall.matches);
      setDisableAnimation(
        mqMotion.matches || mqTouch.matches || mqSmall.matches,
      );
    };

    update();
    mqMotion.addEventListener?.("change", update);
    mqTouch.addEventListener?.("change", update);
    mqSmall.addEventListener?.("change", update);

    return () => {
      mqMotion.removeEventListener?.("change", update);
      mqTouch.removeEventListener?.("change", update);
      mqSmall.removeEventListener?.("change", update);
    };
  }, []);

  // Lightweight background: avoid huge blurs on small devices by using reduced styles
  const backgroundElements = (
    <div className="absolute inset-0 -z-10 pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.03]"
        // keep tiny mesh, data-uri is very small; cheap to render
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23065f46' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 40V39L0 39V40zm40-40V0L39 0V40H40V0z'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />
      {/* Render big blurs only on non-touch / larger screens */}
      {!isTouch && (
        <>
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-200/18 blur-[100px] rounded-full" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-200/18 blur-[100px] rounded-full" />
        </>
      )}
    </div>
  );

  // If animations disabled, avoid framer motion's variant wiring to reduce runtime work
  const Section: any = disableAnimation ? "section" : motion.section;

  return (
    <Section
      initial={disableAnimation ? undefined : "hidden"}
      whileInView={disableAnimation ? undefined : "visible"}
      viewport={disableAnimation ? undefined : { once: true, margin: "-100px" }}
      variants={disableAnimation ? undefined : containerVariants}
      className="relative w-full max-w-7xl py-20 md:py-44 px-6 mx-auto overflow-hidden"
      aria-labelledby="about-heading"
    >
      {backgroundElements}

      <div className="relative z-10">
        {/* Header */}
        {/* use simpler structure and reduced shadows on touch */}
        <div className="max-w-4xl mx-auto text-center mb-16 md:mb-24">
          <div
            className={`inline-flex items-center gap-3 px-3 py-1 rounded-full ${isTouch ? "bg-emerald-50/70" : "bg-emerald-50/80"} border border-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-[0.25em] mb-6`}
          >
            <span className="relative flex h-2 w-2">
              {!isTouch && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            System Intelligence Ver // 2.0.4
          </div>

          <h2
            id="about-heading"
            className="text-3xl md:text-5xl lg:text-7xl font-extrabold text-slate-800 tracking-tight mb-6 leading-tight"
          >
            The Intelligence Behind <br />
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent italic">
              Sustainability.
            </span>
          </h2>

          <p className="text-base md:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto font-light">
            EcoLens isn’t just an interface. It’s a{" "}
            <span className="text-slate-800 font-semibold px-1">
              high-fidelity telemetry engine
            </span>{" "}
            engineered to turn raw ecological data into actionable human impact.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          <FeatureCard
            icon={Target}
            title="Precision AI"
            badge="Edge-CV"
            description="Utilizing low-latency computer vision protocols to classify materials in real-time at the edge."
            disableAnimation={disableAnimation}
            isTouch={isTouch}
          />
          <FeatureCard
            icon={Globe}
            title="Global Sync"
            badge="Syncing"
            description="Contributing to a decentralized environmental ledger that tracks carbon offset in real-time."
            disableAnimation={disableAnimation}
            isTouch={isTouch}
          />
          <FeatureCard
            icon={Zap}
            title="Eco-Logic"
            badge="Active"
            description="Our proprietary gamification engine translates verfied actions into liquid social capital."
            disableAnimation={disableAnimation}
            isTouch={isTouch}
          />
        </div>

        {/* Footer */}
        <div className="mt-16 md:mt-28 flex flex-col items-center justify-center">
          <div className="flex items-center gap-6 opacity-30 grayscale saturate-0">
            <div className="h-[1px] w-12 bg-slate-400" />
            <div className="h-[1px] w-12 bg-slate-400" />
          </div>
        </div>
      </div>
    </Section>
  );
}
