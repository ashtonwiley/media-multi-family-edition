import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { KeyRound, Loader2, Send, Sparkles, ShieldCheck, LogOut, Heart } from "lucide-react";

type Post = {
  id: string;
  author: "child" | "parent";
  content: string;
  mood: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

const MOODS = ["😊", "🥳", "🌈", "⚽", "🎨", "📚", "🍕", "💖"];

const KidFeed = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const isGuest = !user;

  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [parentName, setParentName] = useState("");
  const [childName, setChildName] = useState("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(MOODS[0]);
  const [posting, setPosting] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasPin(false);
      return;
    }
    (async () => {
      const [{ data: hp }, { data: prof }] = await Promise.all([
        supabase.rpc("has_child_pin"),
        supabase.from("family_profiles").select("parent_name, child_name").eq("user_id", user.id).maybeSingle(),
      ]);
      setHasPin(!!hp);
      setParentName(prof?.parent_name ?? "");
      setChildName(prof?.child_name ?? "");
    })();
  }, [user]);

  const loadPosts = async () => {
    if (isGuest) {
      setPosts([]);
      return;
    }
    setLoadingPosts(true);
    const { data, error } = await supabase
      .from("family_posts")
      .select("*")
      .in("status", ["approved", "pending"])
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setPosts((data ?? []) as Post[]);
    setLoadingPosts(false);
  };

  const unlock = async () => {
    if (!/^\d{4}$/.test(pin)) return toast.error("Enter your 4-digit PIN");
    setVerifying(true);
    const { data, error } = await supabase.rpc("verify_child_pin", { _pin: pin });
    setVerifying(false);
    if (error) return toast.error(error.message);
    if (!data) {
      toast.error("That PIN didn't work — ask a grown-up!");
      setPin("");
      return;
    }
    setUnlocked(true);
    toast.success(`Welcome, ${childName || "friend"}! 🌈`);
    loadPosts();
  };

  // Live updates while the kid feed is unlocked (real user only)
  useEffect(() => {
    if (!unlocked || !user) return;
    const channel = supabase
      .channel("family_posts_kid")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "family_posts", filter: `user_id=eq.${user.id}` },
        () => loadPosts()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [unlocked, user]);

  const enterDemo = () => {
    setUnlocked(true);
    toast.success("Welcome to Kid Mode demo! 🌈");
  };

  const lock = () => {
    setUnlocked(false);
    setPin("");
    setPosts([]);
  };

  const submitPost = async () => {
    const text = content.trim();
    if (!text) return toast.error("Write something fun!");
    if (text.length > 500) return toast.error("Keep it under 500 characters");
    if (!user) {
      const fake: Post = {
        id: crypto.randomUUID(),
        author: "child",
        content: text,
        mood,
        status: "approved",
        created_at: new Date().toISOString(),
      };
      setPosts((p) => [fake, ...p]);
      setContent("");
      toast.success("Demo post added! Sign in to save it ✨");
      return;
    }
    setPosting(true);
    const { error } = await supabase.from("family_posts").insert({
      user_id: user.id,
      author: "child",
      content: text,
      mood,
      status: "approved",
    });
    setPosting(false);
    if (error) return toast.error(error.message);
    toast.success("Posted to your family feed ✨");
    setContent("");
    loadPosts();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <div className="container py-32 text-center text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // PIN gate
  if (!unlocked) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <main className="bg-hero">
          <section className="container py-20 max-w-md mx-auto">
            <Card className="bg-card-grad border-border p-8 shadow-soft text-center animate-fade-up">
              <div className="w-16 h-16 rounded-full bg-brand mx-auto mb-4 flex items-center justify-center shadow-glow animate-pulse-glow">
                <KeyRound className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Kid Mode</h1>
              <p className="text-muted-foreground text-sm mb-6">
                {isGuest
                  ? "Try Kid Mode as a guest — no PIN needed! For your own saved family feed, ask a grown-up to set up an account."
                  : hasPin === false
                  ? "A grown-up needs to set a 4-digit PIN in the Parent Dashboard first."
                  : "Type your secret 4-digit PIN to unlock your feed."}
              </p>

              {!isGuest && hasPin !== false && (
                <>
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="text-3xl tracking-[0.5em] text-center font-bold mb-4"
                    onKeyDown={(e) => e.key === "Enter" && unlock()}
                  />
                  <Button
                    onClick={unlock}
                    disabled={verifying || pin.length !== 4}
                    className="w-full bg-brand text-primary-foreground hover:opacity-90 shadow-glow rounded-full font-bold"
                  >
                    {verifying ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-1" />}
                    Unlock
                  </Button>
                </>
              )}

              {!isGuest && hasPin === false && (
                <Button onClick={() => navigate("/parent")} className="w-full bg-brand text-primary-foreground hover:opacity-90 shadow-glow rounded-full font-bold">
                  Open Parent Dashboard
                </Button>
              )}

              {isGuest && (
                <div className="space-y-2">
                  <Button onClick={enterDemo} className="w-full bg-brand text-primary-foreground hover:opacity-90 shadow-glow rounded-full font-bold">
                    <Sparkles className="w-4 h-4 mr-1" /> Enter Kid Mode
                  </Button>
                  <Button onClick={() => navigate("/auth")} variant="outline" className="w-full rounded-full">
                    Parents — sign in
                  </Button>
                </div>
              )}
            </Card>
          </section>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Unlocked kid feed
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main>
        <section className="bg-hero">
          <div className="container py-10 flex flex-wrap items-center justify-between gap-4">
            <div className="animate-fade-up">
              <Badge className="bg-accent/20 text-accent border-accent/40 mb-3">
                <Sparkles className="w-3 h-3 mr-1" /> Kid Mode
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold">
                Hi {childName || "friend"}! 🌈
              </h1>
              <p className="text-muted-foreground mt-2">
                Posts from {parentName || "your grown-ups"} and your family. Safe and ad-free.
              </p>
            </div>
            <Button onClick={lock} variant="outline" className="rounded-full">
              <LogOut className="w-4 h-4 mr-1" /> Lock
            </Button>
          </div>
        </section>

        <section className="container py-8 max-w-2xl mx-auto space-y-6">
          {/* Compose */}
          <Card className="bg-card-grad border-border p-6 shadow-soft">
            <h2 className="text-xl font-bold mb-3">Share something nice ✨</h2>
            <Textarea
              rows={3}
              maxLength={500}
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 500))}
              placeholder="What was the best part of your day?"
              className="resize-none mb-3"
            />
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs text-muted-foreground mr-1">Pick a mood:</span>
              {MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  aria-label={`Mood ${m}`}
                  className={`text-xl w-10 h-10 rounded-full transition-smooth ${
                    mood === m ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary/40 hover:bg-secondary"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Your post goes straight to the family feed 💛</span>
              <Button
                onClick={submitPost}
                disabled={posting || !content.trim()}
                className="bg-brand text-primary-foreground hover:opacity-90 shadow-glow rounded-full font-bold"
              >
                {posting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                Send
              </Button>
            </div>
          </Card>

          {/* Feed */}
          <div>
            <h2 className="text-xl font-bold mb-3">Your family feed</h2>
            {loadingPosts ? (
              <div className="text-center text-muted-foreground py-10">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            ) : posts.length === 0 ? (
              <Card className="bg-card-grad border-border p-8 text-center text-muted-foreground">
                No posts yet — be the first! 🌟
              </Card>
            ) : (
              <div className="space-y-3">
                {posts.map((p) => {
                  const isPending = p.status === "pending";
                  return (
                    <Card
                      key={p.id}
                      className={`bg-card-grad border-border p-5 shadow-soft transition-smooth ${
                        isPending ? "opacity-70 border-dashed" : "hover:shadow-glow"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-muted-foreground">
                          {p.author === "child" ? "👧 You" : `👨‍👩‍👧 ${parentName || "Grown-up"}`} ·{" "}
                          {new Date(p.created_at).toLocaleString()}
                        </div>
                        {isPending ? (
                          <Badge className="bg-accent/20 text-accent border-0 text-xs">Waiting for approval</Badge>
                        ) : (
                          <Heart className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex items-start gap-3">
                        {p.mood && <span className="text-3xl">{p.mood}</span>}
                        <p className="text-base">{p.content}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default KidFeed;
