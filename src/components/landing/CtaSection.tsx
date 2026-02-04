'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motionProps } from "./SectionShared";

export default function CtaSection() {
  return (
    <motion.section {...motionProps} className="w-full bg-primary/5 overflow-x-hidden">
      <div className="max-w-4xl mx-auto py-20 px-4 md:py-28 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Ready to Make a Difference?</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Join thousands of others on a mission to create a cleaner, greener planet. Start your eco-journey today.
        </p>
        <motion.div whileHover={{ scale: 1.05, transition: { duration: 0.2 } }} whileTap={{ scale: 0.95 }}>
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
