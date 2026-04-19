import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Send, Loader2, Sparkles, Inbox } from "lucide-react";

type Post = {
  id: string;
  author: "child" | "parent";
  content: string;
  mood: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

const MOODS = ["😊", "🥳", "🌈", "⚽", "🎨", "📚", "🍕", "💖"];

const FamilyFeedManager = ({ userId }: { userId: string }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(MOODS[0]);
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("family_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setPosts((data ?? []) as Post[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("family_posts_parent")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "family_posts", filter: `user_id=eq.${userId}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const post = async () => {
    const text = content.trim();
    if (!text) return toast.error("Write something first");
    if (text.length > 500) return toast.error("Posts must be under 500 characters");
    setPosting(true);
    const { error } = await supabase.from("family_posts").insert({
      user_id: userId,
      author: "parent",
      content: text,
      mood,
      status: "approved",
    });
    setPosting(false);
    if (error) return toast.error(error.message);
    toast.success("Posted to the family feed 💛");
    setContent("");
    load();
  };

  const setStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("family_posts").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "approved" ? "Approved & posted ✅" : "Rejected");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("family_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  };

  const pending = posts.filter((p) => p.status === "pending");
  const approved = posts.filter((p) => p.status === "approved");

  return (
    <>
      {/* Compose */}
      <Card className="bg-card-grad border-border p-6 shadow-soft md:col-span-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Post to the family feed</h3>
            <p className="text-sm text-muted-foreground">
              Share something nice — your child sees it the moment they unlock child mode.
            </p>
          </div>
        </div>
        <Textarea
          rows={3}
          maxLength={500}
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 500))}
          placeholder="What's something good today?"
          className="resize-none mb-3"
        />
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-muted-foreground mr-1">Mood:</span>
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m)}
              aria-label={`Mood ${m}`}
              className={`text-xl w-9 h-9 rounded-full transition-smooth ${
                mood === m ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary/40 hover:bg-secondary"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{content.length} / 500</span>
          <Button
            onClick={post}
            disabled={posting || !content.trim()}
            className="bg-brand text-primary-foreground hover:opacity-90 shadow-glow rounded-full font-bold"
          >
            {posting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
            Post
          </Button>
        </div>
      </Card>

      {/* Pending child posts */}
      <Card className="bg-card-grad border-border p-6 shadow-soft md:col-span-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Inbox className="w-5 h-5 text-accent" />
          </div>
          <h3 className="text-xl font-bold">
            Pending review {pending.length > 0 && (
              <Badge className="bg-accent text-accent-foreground ml-2">{pending.length}</Badge>
            )}
          </h3>
        </div>
        {loading ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">All caught up — no posts waiting for approval.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-border bg-secondary/40 flex flex-wrap gap-3 items-start justify-between">
                <div className="flex-1 min-w-[200px]">
                  <div className="text-xs text-muted-foreground mb-1">From your child · {new Date(p.created_at).toLocaleString()}</div>
                  <div className="flex items-start gap-2">
                    {p.mood && <span className="text-2xl">{p.mood}</span>}
                    <p className="text-sm">{p.content}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setStatus(p.id, "rejected")} className="rounded-full">
                    <X className="w-3 h-3 mr-1" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => setStatus(p.id, "approved")}
                    className="bg-safe text-safe-foreground hover:opacity-90 rounded-full font-bold">
                    <Check className="w-3 h-3 mr-1" /> Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent approved */}
      <Card className="bg-card-grad border-border p-6 shadow-soft md:col-span-2">
        <h3 className="text-xl font-bold mb-4">Recent posts on the family feed</h3>
        {approved.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts yet.</p>
        ) : (
          <div className="space-y-3">
            {approved.slice(0, 6).map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-border bg-secondary/40 flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground mb-1">
                    {p.author === "child" ? "👧 From your child" : "👨‍👩‍👧 From you"} · {new Date(p.created_at).toLocaleString()}
                  </div>
                  <div className="flex items-start gap-2">
                    {p.mood && <span className="text-2xl">{p.mood}</span>}
                    <p className="text-sm">{p.content}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => remove(p.id)}
                  className="text-muted-foreground hover:text-destructive">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  );
};

export default FamilyFeedManager;
