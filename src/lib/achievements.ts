import { Leaf, Award, BarChart, UploadCloud, Cpu } from "lucide-react";

export const achievements = [
  {
    id: 1,
    name: "Eco Hero",
    description: "Recycle 100 items",
    icon: Leaf, // Use component, not string
  },
  {
    id: 2,
    name: "Planet Saver",
    description: "Recycle 500 items",
    icon: Award,
  },
  {
    id: 3,
    name: "Green Champion",
    description: "Recycle 1000 items",
    icon: BarChart,
  },
  {
    id: 4,
    name: "Quick Recycler",
    description: "Upload 50 items in a day",
    icon: UploadCloud,
  },
  {
    id: 5,
    name: "Tech Eco",
    description: "Classify using AI tools",
    icon: Cpu,
  },
] as const;
