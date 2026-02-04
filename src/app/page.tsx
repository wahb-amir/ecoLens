// import { HeroSection, AboutSection, HowItWorksSection, AchievementsSection, LiveStatsSection, CtaSection } from '@/components/landing/LandingSections';
import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import AchievementsSection from "@/components/landing/AchievementsSection";
import LiveStatsSection from "@/components/landing/LiveStatsSection";
import CtaSection from "@/components/landing/CtaSection";
export default function LandingPage() {
  return (
    
    <main className="flex flex-col items-center ">
       <HeroSection />
       <AboutSection />
       <HowItWorksSection />
       <AchievementsSection />
       <LiveStatsSection />
       <CtaSection />  
    </main>
  );
}