import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Send, Sparkles, ShieldCheck, LogOut, Heart, User, KeyRound } from "lucide-react";

type Post = {
  id: string;
  author: "child" | "parent";
  content: string;
  mood: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

type KidSession = {
  username: string;
  password: string;
  child_name: string;
  parent_user_id: string;
};

const MOODS = ["😊", "🥳", "🌈", "⚽", "🎨", "📚", "🍕", "💖"];
const STORAGE_KEY = "kid_session_v1";

const KidFeed = () => {
  const navigate = useNavigate();

  // login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);

  const [session, setSession] = useState<KidSession | null>(null);

  // feed state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(MOODS[0]);
  const [posting, setPosting] = useState(false);

  // restore session on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const loadPosts = async (s: KidSession) => {
    setLoadingPosts(true);
    const { data, error } = await supabase.rpc("kid_list_posts", {
      _username: s.username,
      _password: s.password,
    });
    if (error) {
      toast.error(error.message);
      // session likely invalid → log out
      localStorage.removeItem(STORAGE_KEY);
      setSession(null);
      setLoadingPosts(false);
      return;
    }
    setPosts((data ?? []) as Post[]);
    setLoadingPosts(false);
  };

  // load posts whenever we have a session
  useEffect(() => {
    if (!session) return;
    loadPosts(session);
  }, [session]);

  // realtime — listen to the linked parent's family feed
  useEffect(() => {
    if (!session) return;
    const channel = supabase
      .channel("family_posts_kid")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "family_posts",
          filter: `user_id=eq.${session.parent_user_id}`,
        },
        () => loadPosts(session)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const login = async () => {
    if (!username.trim() || !password) return toast.error("Enter your username and password");
    setVerifying(true);
    const { data, error } = await supabase.rpc("verify_child_login", {
      _username: username.trim(),
      _password: password,
    });
    setVerifying(false);
    if (error) return toast.error(error.message);
    const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
    if (!row) {
      toast.error("That username or password didn't work — ask a grown-up!");
      setPassword("");
      return;
    }
    const s: KidSession = {
      username: row.username,
      password,
      child_name: row.child_name,
      parent_user_id: row.parent_user_id,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    setSession(s);
    setUsername("");
    setPassword("");
    toast.success(`Welcome, ${row.child_name}! 🌈`);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setPosts([]);
  };

  const submitPost = async () => {
    if (!session) return;
    const text = content.trim();
    if (!text) return toast.error("Write something fun!");
    if (text.length > 500) return toast.error("Keep it under 500 characters");
    setPosting(true);
    const { error } = await supabase.rpc("kid_create_post", {
      _username: session.username,
      _password: session.password,
      _content: text,
      _mood: mood,
    });
    setPosting(false);
    if (error) return toast.error(error.message);
    toast.success("Posted to your family feed ✨");
    setContent("");
    loadPosts(session);
  };

  // Login screen
  if (!session) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <main className="bg-hero">
          <section className="container py-20 max-w-md mx-auto">
            <Card className="bg-card-grad border-border p-8 shadow-soft text-center animate-fade-up">
              <div className="w-16 h-16 rounded-full bg-brand mx-auto mb-4 flex items-center justify-center shadow-glow animate-pulse-glow">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Kid Mode</h1>
              <p className="text-muted-foreground text-sm mb-6">
                Sign in with the username and password your grown-up gave you.
              </p>

              <div className="space-y-3 text-left">
                <div className="space-y-1">
                  <Label htmlFor="kid-username">Username</Label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="kid-username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.slice(0, 24))}
                      placeholder="your_username"
                      className="pl-9"
                      autoComplete="username"
                      onKeyDown={(e) => e.key === "Enter" && login()}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="kid-password">Password</Label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="kid-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value.slice(0, 72))}
                      placeholder="••••••"
                      className="pl-9"
                      autoComplete="current-password"
                      onKeyDown={(e) => e.key === "Enter" && login()}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={login}
                disabled={verifying || !username.trim() || !password}
                className="w-full bg-brand text-primary-foreground hover:opacity-90 shadow-glow rounded-full font-bold mt-5"
              >
                {verifying ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 mr-1" />
                )}
                Sign in
              </Button>

              <div className="text-xs text-muted-foreground mt-5">
                Grown-ups can create kid accounts in the{" "}
                <button onClick={() => navigate("/auth")} className="underline hover:text-foreground">
                  Parent area
                </button>
                .
              </div>
            </Card>
          </section>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // Signed in
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
              <h1 className="text-4xl md:text-5xl font-bold">Hi {session.child_name}! 🌈</h1>
              <p className="text-muted-foreground mt-2">
                Posts from your family. Safe and ad-free.
              </p>
            </div>
            <Button onClick={logout} variant="outline" className="rounded-full">
              <LogOut className="w-4 h-4 mr-1" /> Sign out
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
              <span className="text-xs text-muted-foreground">
                Your post goes straight to the family feed 💛
              </span>
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
                          {p.author === "child" ? "👧 You or a sibling" : "👨‍👩‍👧 Grown-up"} ·{" "}
                          {new Date(p.created_at).toLocaleString()}
                        </div>
                        {isPending ? (
                          <Badge className="bg-accent/20 text-accent border-0 text-xs">
                            Waiting for approval
                          </Badge>
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
