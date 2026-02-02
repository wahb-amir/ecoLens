'use client';

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Globe } from "./Globe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UploadCloud,
  Award,
  BarChart,
  Leaf,
  Wind,
  Cloud,
  Trash2,
  Cpu,
  Recycle,
} from "lucide-react";
import { achievements } from "@/lib/achievements";
import { AnimatedCounter } from "./AnimatedCounter";
import Link from "next/link";

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const motionProps = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, amount: 0.2 },
  variants: sectionVariants,
};

function LandingHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Recycle className="h-8 w-8 text-white" />
          <h1 className="text-2xl font-bold text-white">EcoLens</h1>
        </Link>
        <Link href="/dashboard">
          <Button
            variant="outline"
            className="bg-transparent text-white border-white hover:bg-white hover:text-primary transition-colors duration-300"
          >
            Get Started
          </Button>
        </Link>
      </div>
    </header>
  );
}

export function HeroSection() {
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
          <Link href="/dashboard">
            <Button
              size="lg"
              className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-8 py-6 text-lg shadow-2xl"
            >
              Get Started
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

export function AboutSection() {
  return (
    <motion.section
      {...motionProps}
      className="overflow-y-hidden w-full max-w-6xl py-20 px-4 md:py-28 text-center overflow-x-hidden mx-auto"
    >
      <h2 className="text-3xl md:text-4xl font-bold">What is EcoLens?</h2>
      <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
        EcoLens is an intelligent platform designed to make environmental
        consciousness effortless. By simply uploading a photo of any waste item,
        our AI instantly classifies it and provides you with proper disposal
        instructions. As you classify, you earn eco-points, unlock achievements,
        and contribute to a real-time global impact map, transforming a simple
        action into a powerful contribution to a cleaner planet.
      </p>
    </motion.section>
  );
}

const howItWorksSteps = [
  {
    icon: UploadCloud,
    title: "Upload Waste Photo",
    description:
      "Snap a picture of a waste item. Our platform accepts a wide variety of images.",
  },
  {
    icon: Cpu,
    title: "Automatic Classification",
    description:
      "Our AI engine analyzes the image and identifies the waste type in seconds.",
  },
  {
    icon: Award,
    title: "Track Eco Points",
    description:
      "Earn points and badges for every item you classify, gamifying your eco-journey.",
  },
  {
    icon: BarChart,
    title: "See Global Impact",
    description:
      "Your contributions are reflected on a global map, showing our collective effort.",
  },
];

export function HowItWorksSection() {
  return (
    <motion.section
      {...motionProps}
      className="w-full bg-white py-20 px-4 md:py-28 overflow-x-hidden"
    >
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          A simple, gamified process to make recycling more engaging and
          impactful.
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorksSteps.map((step, index) => (
            <motion.div
              key={step.title}
              custom={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: {
                  delay: index * 0.15,
                  duration: 0.6,
                  ease: "easeOut",
                },
              }}
              viewport={{ once: true, amount: 0.5 }}
              whileHover={{
                y: -10,
                scale: 1.03,
                transition: { duration: 0.3 },
              }}
              className="overflow-hidden" /* constrain hover transform */
            >
              <Card className="h-full text-left shadow-lg border-2 border-transparent hover:border-primary transition-colors duration-300 overflow-hidden">
                <CardHeader>
                  <div className="bg-primary/10 text-primary p-4 rounded-lg w-fit mb-4">
                    <step.icon className="h-8 w-8" />
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export function AchievementsSection() {
  return (
    <motion.section
      {...motionProps}
      className="w-full max-w-6xl py-20 px-4 md:py-28 text-center mx-auto overflow-x-hidden"
    >
      <h2 className="text-3xl md:text-4xl font-bold">
        Your Impact & Achievements
      </h2>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
        Every action matters. See our collective effort and unlock badges for
        your milestones.
      </p>
      <div className="mt-16 grid gap-8 sm:grid-cols-3">
        <Card className="flex flex-col items-center justify-center p-8 shadow-md overflow-hidden">
          <Leaf className="w-12 h-12 text-primary mb-4" />
          <AnimatedCounter to={12845} className="text-5xl font-bold" />
          <p className="text-muted-foreground mt-2 font-semibold">
            Total Items Recycled
          </p>
        </Card>
        <Card className="flex flex-col items-center justify-center p-8 shadow-md overflow-hidden">
          <Award className="w-12 h-12 text-accent mb-4" />
          <AnimatedCounter to={432} className="text-5xl font-bold" />
          <p className="text-muted-foreground mt-2 font-semibold">
            Active Eco-Warriors
          </p>
        </Card>
        <Card className="flex flex-col items-center justify-center p-8 shadow-md overflow-hidden">
          <BarChart className="w-12 h-12 text-primary mb-4" />
          <div className="flex items-baseline">
            <AnimatedCounter to={89} className="text-5xl font-bold" />
            <span className="text-5xl font-bold">%</span>
          </div>
          <p className="text-muted-foreground mt-2 font-semibold">
            Classification Accuracy
          </p>
        </Card>
      </div>

      <div className="mt-20">
        <h3 className="text-2xl font-bold mb-8">Unlock Badges</h3>
        <div className="flex flex-wrap justify-center gap-8">
          {achievements.slice(0, 5).map((ach) => {
            const Icon = ach.icon;
            return (
              <motion.div
                key={ach.id}
                className="flex flex-col items-center text-center w-28 overflow-hidden"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <div className="p-5 bg-muted rounded-full text-primary/80 shadow-inner">
                  <Icon className="w-10 h-10" />
                </div>
                <p className="mt-3 font-bold text-md">{ach.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {ach.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

export function LiveStatsSection() {
  const stats = [
    {
      icon: Wind,
      title: "Avg. Air Quality (AQI)",
      value: "42",
      description: "Good",
    },
    { icon: Cloud, title: "Atmospheric CO₂", value: "421", description: "ppm" },
    {
      icon: Trash2,
      title: "Ocean Plastic Waste",
      value: "11M",
      description: "tons/year",
    },
  ];

  return (
    <motion.section
      {...motionProps}
      className="w-full bg-white py-20 px-4 md:py-28 overflow-x-hidden"
    >
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold">
          Live Environmental Stats
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          A real-time snapshot of our planet's health. Data is for illustrative
          purposes.
        </p>
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              custom={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: {
                  delay: index * 0.15,
                  duration: 0.6,
                  ease: "easeOut",
                },
              }}
              viewport={{ once: true, amount: 0.5 }}
              className="overflow-hidden"
            >
              <Card className="p-6 text-center shadow-md overflow-hidden">
                <div className="flex justify-center mb-4">
                  <div className="bg-accent/10 text-accent p-4 rounded-full">
                    <stat.icon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground">
                  {stat.title}
                </h3>
                <div className="flex items-baseline justify-center gap-2">
                  <p className="text-5xl font-bold text-[hsl(var(--foreground))] mt-2">
                    {stat.value}
                  </p>
                  <span className="text-md font-semibold text-muted-foreground">
                    {stat.description}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export function CtaSection() {
  return (
    <motion.section {...motionProps} className="w-full bg-primary/5 overflow-x-hidden">
      <div className="max-w-4xl mx-auto py-20 px-4 md:py-28 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">
          Ready to Make a Difference?
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Join thousands of others on a mission to create a cleaner, greener
          planet. Start your eco-journey today.
        </p>
        <motion.div
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/dashboard">
            <Button
              size="lg"
              className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-8 py-6 text-lg shadow-xl"
            >
              Start Classifying Now
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
