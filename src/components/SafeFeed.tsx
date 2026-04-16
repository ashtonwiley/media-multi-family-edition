import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Heart, MessageCircle, ShieldCheck, Send } from "lucide-react";
import sunflowerImg from "@/assets/feed-sunflower.jpg";
import penguinImg from "@/assets/feed-penguin.jpg";
import pancakeImg from "@/assets/feed-pancake.jpg";
import soccerImg from "@/assets/feed-soccer.jpg";

type Post = {
  app: string;
  who: string;
  text: string;
  color: string;
  image: string;
};

const initialPosts: Post[] = [
  { app: "Instagram", who: "Grandma Rose", text: "Look what bloomed in the garden today! 🌷", color: "bg-primary/20 text-primary", image: sunflowerImg },
  { app: "YouTube Kids", who: "Cosmic Kids Yoga", text: "New episode: Adventures with Pip the Penguin", color: "bg-accent/20 text-accent", image: penguinImg },
  { app: "TikTok", who: "Uncle Marco", text: "Pancake flip challenge — slow-mo edition 🥞", color: "bg-safe/20 text-safe", image: pancakeImg },
  { app: "Snapchat", who: "Cousin Lily", text: "First day of soccer practice! ⚽", color: "bg-primary/20 text-primary", image: soccerImg },
];

const SafeFeed = () => {
  const [familyOn, setFamilyOn] = useState<Record<string, boolean>>({});
  const [replyOpen, setReplyOpen] = useState<Post | null>(null);
  const [replyText, setReplyText] = useState("");

  const toggleFamily = (who: string) => {
    setFamilyOn((prev) => {
      const next = !prev[who];
      toast.success(next ? `Sent love to ${who} 💕` : `Removed your heart from ${who}`);
      return { ...prev, [who]: next };
    });
  };

  const sendReply = () => {
    const msg = replyText.trim();
    if (!msg) {
      toast.error("Please type a reply first");
      return;
    }
    if (msg.length > 280) {
      toast.error("Replies are limited to 280 characters");
      return;
    }
    toast.success(`Reply sent to ${replyOpen?.who} — they'll see it after a parent approves it.`);
    setReplyText("");
    setReplyOpen(null);
  };

  return (
    <section className="container py-20">
      <div className="text-center mb-12 animate-fade-up">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">A feed you can actually trust</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Every post is from someone you've approved. Every video is screened. No infinite scroll, no addictive loops.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
        {initialPosts.map((p) => {
          const liked = !!familyOn[p.who];
          return (
            <Card
              key={p.who}
              className="bg-card-grad border-border p-5 shadow-soft hover:shadow-glow transition-smooth hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <Badge className={`${p.color} border-0`}>{p.app}</Badge>
                <ShieldCheck className="w-4 h-4 text-safe" />
              </div>
              <div className="aspect-square rounded-xl overflow-hidden bg-secondary mb-4">
                <img
                  src={p.image}
                  alt={`${p.app} post by ${p.who}: ${p.text}`}
                  loading="lazy"
                  width={768}
                  height={768}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="font-bold mb-1">{p.who}</div>
              <p className="text-sm text-muted-foreground mb-3">{p.text}</p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFamily(p.who)}
                  aria-pressed={liked}
                  aria-label={`Send family love to ${p.who}`}
                  className={`flex-1 h-8 px-2 text-xs rounded-full transition-smooth ${
                    liked ? "bg-primary/15 text-primary hover:bg-primary/25" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Heart className={`w-3 h-3 mr-1 ${liked ? "fill-current" : ""}`} /> Family
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyOpen(p)}
                  aria-label={`Reply to ${p.who}`}
                  className="flex-1 h-8 px-2 text-xs rounded-full text-muted-foreground hover:text-foreground"
                >
                  <MessageCircle className="w-3 h-3 mr-1" /> Reply
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!replyOpen} onOpenChange={(o) => !o && setReplyOpen(null)}>
        <DialogContent className="bg-card-grad border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl">Reply to {replyOpen?.who}</DialogTitle>
            <DialogDescription>
              Replies are reviewed by a parent before they're sent. Keep it kind! 💛
            </DialogDescription>
          </DialogHeader>

          {replyOpen && (
            <div className="rounded-xl bg-secondary/40 p-3 text-sm">
              <span className="text-2xl mr-2">{replyOpen.emoji}</span>
              <span className="text-muted-foreground">{replyOpen.text}</span>
            </div>
          )}

          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value.slice(0, 280))}
            placeholder="Write something nice..."
            rows={3}
            className="resize-none"
          />
          <div className="text-xs text-muted-foreground text-right">{replyText.length} / 280</div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyOpen(null)} className="rounded-full">
              Cancel
            </Button>
            <Button
              onClick={sendReply}
              className="bg-brand text-primary-foreground hover:opacity-90 shadow-glow rounded-full font-bold"
            >
              <Send className="w-4 h-4 mr-1" /> Send for review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default SafeFeed;
