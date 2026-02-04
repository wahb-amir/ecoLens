'use client';

import { motion } from "framer-motion";
import { motionProps } from "./SectionShared";

export default function AboutSection() {
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
