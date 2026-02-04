import { Variants } from "framer-motion";
import { LucideIcon } from "lucide-react";

export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const motionProps = {
  initial: "hidden" as const,
  whileInView: "visible" as const,
  viewport: { once: true, amount: 0.2 },
  variants: sectionVariants,
};

export interface HowItWorksStep {
  iconName: string;
  title: string;
  description: string;
  Icon?: LucideIcon;
}

export const howItWorksSteps: HowItWorksStep[] = [
  {
    iconName: "UploadCloud",
    title: "Upload Waste Photo",
    description:
      "Snap a picture of a waste item. Our platform accepts a wide variety of images.",
  },
  {
    iconName: "Cpu",
    title: "Automatic Classification",
    description:
      "Our AI engine analyzes the image and identifies the waste type in seconds.",
  },
  {
    iconName: "Award",
    title: "Track Eco Points",
    description:
      "Earn points and badges for every item you classify, gamifying your eco-journey.",
  },
  {
    iconName: "BarChart",
    title: "See Global Impact",
    description:
      "Your contributions are reflected on a global map, showing our collective effort.",
  },
];
