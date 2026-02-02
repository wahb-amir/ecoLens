'use client'
import { useEffect, useRef } from "react"
import { animate } from "framer-motion"

type AnimatedCounterProps = {
  to: number;
  from?: number;
  className?: string;
}

export function AnimatedCounter({ to, from = 0, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(from, to, {
      duration: 2.5,
      ease: "easeOut",
      onUpdate(value) {
        node.textContent = Math.round(value).toLocaleString();
      }
    });

    return () => controls.stop();
  }, [from, to]);

  return <span ref={ref} className={className} />;
}
