
import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import AchievementsSection from "@/components/landing/AchievementsSection";
import LiveStatsSection from "@/components/landing/LiveStatsSection";
import CtaSection from "@/components/landing/CtaSection";
import MobileConsole from "@/components/MobileConsole";
export default function LandingPage() {
  return (
    
    <main className="flex flex-col items-center ">
       <HeroSection />
       <MobileConsole/>
       <AboutSection />
       <HowItWorksSection />
       <AchievementsSection />
       <LiveStatsSection />
       <CtaSection />  
    </main>
  );
}