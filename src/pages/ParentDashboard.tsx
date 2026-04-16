import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Shield, Eye, Clock, MessageCircleOff, Sparkles, Lock, LogOut, Save, Moon, MessageSquareWarning, Loader2,
} from "lucide-react";

type Profile = {
  parent_name: string | null;
  child_name: string | null;
  child_age_group: string;
  daily_screen_time_minutes: number;
  hide_algorithmic_feeds: boolean;
  block_strangers: boolean;
  no_ads: boolean;
  auto_moderate_content: boolean;
  bedtime_curfew: boolean;
  require_reply_approval: boolean;
  connected_apps: string[];
};

const APPS = [
  { id: "instagram", label: "Instagram", emoji: "📸" },
  { id: "tiktok", label: "TikTok", emoji: "🎵" },
  { id: "youtube", label: "YouTube", emoji: "▶️" },
  { id: "snapchat", label: "Snapchat", emoji: "👻" },
  { id: "facebook", label: "Facebook", emoji: "👍" },
  { id: "pinterest", label: "Pinterest", emoji: "📌" },
];

const ParentDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("family_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) toast.error(error.message);
      if (data) setProfile(data as Profile);
      setLoading(false);
    })();
  }, [user]);

  const update = <K extends keyof Profile>(k: K, v: Profile[K]) =>
    setProfile((p) => (p ? { ...p, [k]: v } : p));

  const toggleApp = (id: string) => {
    if (!profile) return;
    const has = profile.connected_apps.includes(id);
    update("connected_apps", has ? profile.connected_apps.filter((a) => a !== id) : [...profile.connected_apps, id]);
  };

  const save = async () => {
    if (!profile || !user) return;
    setSaving(true);
    const { error } = await supabase
      .from("family_profiles")
      .update({
        parent_name: profile.parent_name,
        child_name: profile.child_name,
        child_age_group: profile.child_age_group,
        daily_screen_time_minutes: profile.daily_screen_time_minutes,
        hide_algorithmic_feeds: profile.hide_algorithmic_feeds,
        block_strangers: profile.block_strangers,
        no_ads: profile.no_ads,
        auto_moderate_content: profile.auto_moderate_content,
        bedtime_curfew: profile.bedtime_curfew,
        require_reply_approval: profile.require_reply_approval,
        connected_apps: profile.connected_apps,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Settings saved 🛡️");
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <div className="container py-32 text-center text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
          Loading your family settings...
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const toggles: Array<{ key: keyof Profile; icon: typeof Eye; title: string; desc: string }> = [
    { key: "hide_algorithmic_feeds", icon: Eye, title: "Hide algorithmic feeds", desc: "Show posts only from approved family & friends" },
    { key: "block_strangers", icon: MessageCircleOff, title: "Block strangers", desc: "Only verified contacts can message your child" },
    { key: "no_ads", icon: Sparkles, title: "No ads, ever", desc: "Zero advertising and no targeted tracking" },
    { key: "auto_moderate_content", icon: Shield, title: "Auto-moderate content", desc: "AI screens posts before your child sees them" },
    { key: "bedtime_curfew", icon: Moon, title: "Bedtime curfew (9pm – 7am)", desc: "App locks overnight automatically" },
    { key: "require_reply_approval", icon: MessageSquareWarning, title: "Approve replies", desc: "Review every reply your child sends before it's posted" },
  ];

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main>
        <section className="bg-hero">
          <div className="container py-12 flex flex-wrap items-center justify-between gap-4">
            <div className="animate-fade-up">
              <Badge className="bg-safe/15 text-safe border-safe/30 mb-3">
                <Lock className="w-3 h-3 mr-1" /> Parent dashboard
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold">
                Hi {profile.parent_name || "there"} 👋
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage {profile.child_name || "your child"}'s safe social experience.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={save} disabled={saving}
                className="bg-brand text-primary-foreground hover:opacity-90 shadow-glow rounded-full font-bold">
                {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                Save changes
              </Button>
              <Button onClick={handleSignOut} variant="outline" className="rounded-full">
                <LogOut className="w-4 h-4 mr-1" /> Sign out
              </Button>
            </div>
          </div>
        </section>

        <section className="container py-10 grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Family info */}
          <Card className="bg-card-grad border-border p-6 shadow-soft md:col-span-2">
            <h2 className="text-xl font-bold mb-4">Family information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pn">Your name</Label>
                <Input id="pn" value={profile.parent_name ?? ""}
                  onChange={(e) => update("parent_name", e.target.value.slice(0, 80))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cn">Child's first name</Label>
                <Input id="cn" value={profile.child_name ?? ""}
                  onChange={(e) => update("child_name", e.target.value.slice(0, 40))} />
              </div>
            </div>
          </Card>

          {/* Age group */}
          <Card className="bg-card-grad border-border p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Child's age group</h3>
            </div>
            <RadioGroup value={profile.child_age_group} onValueChange={(v) => update("child_age_group", v)} className="space-y-2">
              {[
                { v: "under13", label: "Under 13", note: "Strictest filters, kid-safe content only" },
                { v: "13-15", label: "13 – 15", note: "Teen-safe with messaging limits" },
                { v: "16-17", label: "16 – 17", note: "More flexibility, ads still filtered" },
              ].map((o) => (
                <Label key={o.v} htmlFor={`p-${o.v}`}
                  className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-primary/50 cursor-pointer transition-smooth">
                  <RadioGroupItem value={o.v} id={`p-${o.v}`} className="mt-1" />
                  <div>
                    <div className="font-semibold">{o.label}</div>
                    <div className="text-sm text-muted-foreground">{o.note}</div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </Card>

          {/* Screen time */}
          <Card className="bg-card-grad border-border p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-xl font-bold">Daily screen time</h3>
            </div>
            <div className="text-5xl font-bold display text-primary mb-2">
              {profile.daily_screen_time_minutes}
              <span className="text-lg text-muted-foreground font-normal ml-2">min / day</span>
            </div>
            <Slider value={[profile.daily_screen_time_minutes]}
              onValueChange={(v) => update("daily_screen_time_minutes", v[0])}
              min={15} max={180} step={15} className="my-6" />
            <p className="text-sm text-muted-foreground">
              The app locks once the limit is hit. Bedtime curfew is configured below.
            </p>
          </Card>

          {/* Toggles */}
          <Card className="bg-card-grad border-border p-6 shadow-soft md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Safety toggles</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {toggles.map((t) => (
                <div key={t.key as string}
                  className="flex items-start justify-between gap-4 p-4 rounded-xl bg-secondary/40 border border-border">
                  <div className="flex gap-3">
                    <t.icon className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold">{t.title}</div>
                      <div className="text-sm text-muted-foreground">{t.desc}</div>
                    </div>
                  </div>
                  <Switch
                    checked={profile[t.key] as boolean}
                    onCheckedChange={(v) => update(t.key, v as never)}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Connected apps */}
          <Card className="bg-card-grad border-border p-6 shadow-soft md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Connected apps</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose which platforms feed into your child's unified, moderated stream.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {APPS.map((a) => {
                const on = profile.connected_apps.includes(a.id);
                return (
                  <button type="button" key={a.id} onClick={() => toggleApp(a.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-smooth text-left ${
                      on ? "bg-primary/10 border-primary shadow-glow" : "bg-secondary/40 border-border hover:border-primary/40"
                    }`}>
                    <span className="text-2xl">{a.emoji}</span>
                    <span className="font-semibold flex-1">{a.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </section>

        <div className="container max-w-5xl mx-auto pb-16 flex justify-end">
          <Button onClick={save} disabled={saving} size="lg"
            className="bg-brand text-primary-foreground hover:opacity-90 shadow-glow rounded-full font-bold px-8">
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Save all changes
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default ParentDashboard;
