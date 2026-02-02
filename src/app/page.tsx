import { HeroSection, AboutSection, HowItWorksSection, AchievementsSection, LiveStatsSection, CtaSection } from '@/components/landing/LandingSections';

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