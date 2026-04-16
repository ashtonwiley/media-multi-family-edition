import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Shield, Heart, Lock } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="bg-hero relative overflow-hidden">
      <div className="container py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-up">
          <Badge className="bg-primary/15 text-primary border-primary/30 mb-6 hover:bg-primary/20">
            <Heart className="w-3 h-3 mr-1" /> Built for kids & families
          </Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
            One safe place
            <br />
            for <span className="text-primary">all their</span>
            <br />
            social apps.
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            Media Multi brings the posts kids love from Instagram, TikTok, YouTube and more
            into a single, parent-controlled feed. No ads. No strangers. No tracking.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-brand text-primary-foreground hover:opacity-90 shadow-glow rounded-full text-base font-bold px-8">
              <Link to="/signup">Set up family account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full text-base font-bold px-8 border-border hover:bg-secondary"
              onClick={() => document.getElementById("settings")?.scrollIntoView({ behavior: "smooth" })}
            >
              See safety controls
            </Button>
          </div>

          <div className="flex gap-6 mt-10 text-sm">
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-safe" /> COPPA compliant</div>
            <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-safe" /> End-to-end private</div>
          </div>
        </div>

        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-brand opacity-30 blur-3xl rounded-full" />
          <img
            src={logo}
            alt="Media Multi family edition logo"
            className="relative w-64 md:w-80 h-64 md:h-80 animate-float drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
