import SiteNav from "@/components/SiteNav";
import HeroSection from "@/components/HeroSection";
import SafeFeed from "@/components/SafeFeed";
import SafetyControls from "@/components/SafetyControls";
import SiteFooter from "@/components/SiteFooter";

const Index = () => (
  <div className="min-h-screen">
    <SiteNav />
    <main>
      <HeroSection />
      <SafeFeed />
      <SafetyControls />
    </main>
    <SiteFooter />
  </div>
);

export default Index;
