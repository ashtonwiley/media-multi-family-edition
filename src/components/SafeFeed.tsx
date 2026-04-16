import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, ShieldCheck } from "lucide-react";

const posts = [
  { app: "Instagram", who: "Grandma Rose", text: "Look what bloomed in the garden today! 🌷", color: "bg-primary/20 text-primary" },
  { app: "YouTube Kids", who: "Cosmic Kids Yoga", text: "New episode: Adventures with Pip the Penguin", color: "bg-accent/20 text-accent" },
  { app: "TikTok", who: "Uncle Marco", text: "Pancake flip challenge — slow-mo edition 🥞", color: "bg-safe/20 text-safe" },
  { app: "Snapchat", who: "Cousin Lily", text: "First day of soccer practice! ⚽", color: "bg-primary/20 text-primary" },
];

const SafeFeed = () => (
  <section className="container py-20">
    <div className="text-center mb-12 animate-fade-up">
      <h2 className="text-4xl md:text-5xl font-bold mb-4">A feed you can actually trust</h2>
      <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
        Every post is from someone you've approved. Every video is screened. No infinite scroll, no addictive loops.
      </p>
    </div>

    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
      {posts.map((p) => (
        <Card key={p.who} className="bg-card-grad border-border p-5 shadow-soft hover:shadow-glow transition-smooth hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <Badge className={`${p.color} border-0`}>{p.app}</Badge>
            <ShieldCheck className="w-4 h-4 text-safe" />
          </div>
          <div className="aspect-square rounded-xl bg-secondary mb-4 flex items-center justify-center text-4xl">
            {["🌻", "🐧", "🥞", "⚽"][posts.indexOf(p)]}
          </div>
          <div className="font-bold mb-1">{p.who}</div>
          <p className="text-sm text-muted-foreground mb-3">{p.text}</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> Family</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> Reply</span>
          </div>
        </Card>
      ))}
    </div>
  </section>
);

export default SafeFeed;
