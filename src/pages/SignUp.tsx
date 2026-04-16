import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Shield, ArrowRight, ArrowLeft, Check, Heart, Lock } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form state
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("under13");
  const [apps, setApps] = useState<string[]>(["instagram", "youtube"]);
  const [agreed, setAgreed] = useState(false);

  const toggleApp = (id: string) =>
    setApps((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const next = () => {
    // validate per step
    if (step === 1) {
      if (!parentName.trim() || !parentEmail.trim()) {
        toast.error("Please fill in your name and email");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }
    if (step === 2 && !childName.trim()) {
      toast.error("Please enter your child's first name");
      return;
    }
    if (step === 4) {
      if (!agreed) {
        toast.error("Please agree to the family safety terms");
        return;
      }
      toast.success(`Welcome, ${parentName}! ${childName}'s safe feed is ready.`);
      setTimeout(() => navigate("/"), 1500);
      return;
    }
    setStep((s) => Math.min(totalSteps, s + 1));
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  const appOptions = [
    { id: "instagram", label: "Instagram", emoji: "📸" },
    { id: "tiktok", label: "TikTok", emoji: "🎵" },
    { id: "youtube", label: "YouTube", emoji: "▶️" },
    { id: "snapchat", label: "Snapchat", emoji: "👻" },
    { id: "facebook", label: "Facebook", emoji: "👍" },
    { id: "pinterest", label: "Pinterest", emoji: "📌" },
  ];

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="bg-hero">
        <section className="container py-16 max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-up">
            <Badge className="bg-primary/15 text-primary border-primary/30 mb-4">
              <Heart className="w-3 h-3 mr-1" /> Set up your family
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              Step {step} of {totalSteps}
            </h1>
            <Progress value={(step / totalSteps) * 100} className="max-w-xs mx-auto" />
          </div>

          <Card className="bg-card-grad border-border p-8 shadow-soft">
            {step === 1 && (
              <div className="space-y-5 animate-fade-up">
                <h2 className="text-2xl font-bold">About you (the parent)</h2>
                <p className="text-muted-foreground text-sm">
                  We need a verified adult to manage every family account. Your email is never shared or sold.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="pname">Your name</Label>
                  <Input
                    id="pname"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value.slice(0, 80))}
                    placeholder="Alex Rivera"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pemail">Your email</Label>
                  <Input
                    id="pemail"
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value.slice(0, 120))}
                    placeholder="alex@example.com"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-fade-up">
                <h2 className="text-2xl font-bold">About your child</h2>
                <p className="text-muted-foreground text-sm">
                  We use the age group to set safe defaults — you can adjust everything later.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="cname">Child's first name</Label>
                  <Input
                    id="cname"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value.slice(0, 40))}
                    placeholder="Sam"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Age group</Label>
                  <RadioGroup value={childAge} onValueChange={setChildAge} className="space-y-2">
                    {[
                      { v: "under13", label: "Under 13", note: "Strictest filters, kid-safe only" },
                      { v: "13-15", label: "13 – 15", note: "Teen-safe with messaging limits" },
                      { v: "16-17", label: "16 – 17", note: "More flexibility, ads still filtered" },
                    ].map((o) => (
                      <Label
                        key={o.v}
                        htmlFor={`age-${o.v}`}
                        className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-primary/50 cursor-pointer transition-smooth"
                      >
                        <RadioGroupItem value={o.v} id={`age-${o.v}`} className="mt-1" />
                        <div>
                          <div className="font-semibold">{o.label}</div>
                          <div className="text-sm text-muted-foreground">{o.note}</div>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-fade-up">
                <h2 className="text-2xl font-bold">Connect their apps</h2>
                <p className="text-muted-foreground text-sm">
                  Pick which platforms feed into {childName || "your child"}'s unified, moderated stream.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {appOptions.map((a) => {
                    const on = apps.includes(a.id);
                    return (
                      <button
                        type="button"
                        key={a.id}
                        onClick={() => toggleApp(a.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-smooth text-left ${
                          on
                            ? "bg-primary/10 border-primary shadow-glow"
                            : "bg-secondary/40 border-border hover:border-primary/40"
                        }`}
                      >
                        <span className="text-2xl">{a.emoji}</span>
                        <span className="font-semibold flex-1">{a.label}</span>
                        {on && <Check className="w-4 h-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5 animate-fade-up">
                <h2 className="text-2xl font-bold">Review & confirm</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between p-3 rounded-lg bg-secondary/40">
                    <span className="text-muted-foreground">Parent</span>
                    <span className="font-semibold">{parentName} · {parentEmail}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-secondary/40">
                    <span className="text-muted-foreground">Child</span>
                    <span className="font-semibold">{childName} · {childAge}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-secondary/40">
                    <span className="text-muted-foreground">Connected apps</span>
                    <span className="font-semibold">{apps.length} selected</span>
                  </div>
                </div>

                <Label
                  htmlFor="agree"
                  className="flex items-start gap-3 p-4 rounded-xl border border-border cursor-pointer hover:border-primary/50 transition-smooth"
                >
                  <Checkbox
                    id="agree"
                    checked={agreed}
                    onCheckedChange={(c) => setAgreed(c === true)}
                    className="mt-1"
                  />
                  <span className="text-sm">
                    I confirm I am {childName || "this child"}'s parent or legal guardian and agree to
                    the Media Multi family safety terms (no ads, no tracking, COPPA-compliant).
                  </span>
                </Label>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="w-3 h-3 text-safe" /> Your data stays private. End-to-end encrypted.
                </div>
              </div>
            )}

            <div className="flex justify-between gap-3 mt-8">
              <Button
                variant="outline"
                onClick={back}
                disabled={step === 1}
                className="rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                onClick={next}
                className="bg-brand text-primary-foreground hover:opacity-90 shadow-glow rounded-full font-bold px-6"
              >
                {step === totalSteps ? (
                  <>
                    <Shield className="w-4 h-4 mr-1" /> Create family account
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default SignUp;
