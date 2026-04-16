import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Clock, MessageCircleOff, Sparkles, Lock } from "lucide-react";

const SafetyControls = () => {
  const [age, setAge] = useState("under13");
  const [screenTime, setScreenTime] = useState([60]);

  return (
    <section id="settings" className="container py-20">
      <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-up">
        <Badge className="bg-safe/15 text-safe border-safe/30 mb-4 hover:bg-safe/20">
          <Lock className="w-3 h-3 mr-1" /> Privacy First
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Parents are in control</h2>
        <p className="text-muted-foreground text-lg">
          Set safety once, and Media Multi enforces it everywhere — across every connected app.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Age group */}
        <Card className="bg-card-grad border-border p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Child's age group</h3>
          </div>
          <RadioGroup value={age} onValueChange={setAge} className="space-y-2">
            {[
              { v: "under13", label: "Under 13", note: "Strictest filters, kid-safe content only" },
              { v: "13-15", label: "13 – 15", note: "Teen-safe with messaging limits" },
              { v: "16-17", label: "16 – 17", note: "More flexibility, ads still filtered" },
            ].map((o) => (
              <Label
                key={o.v}
                htmlFor={o.v}
                className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-primary/50 cursor-pointer transition-smooth"
              >
                <RadioGroupItem value={o.v} id={o.v} className="mt-1" />
                <div>
                  <div className="font-semibold">{o.label}</div>
                  <div className="text-sm text-muted-foreground">{o.note}</div>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </Card>

        {/* Daily screen time */}
        <Card className="bg-card-grad border-border p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-xl font-bold">Daily screen time</h3>
          </div>
          <div className="text-5xl font-bold display text-primary mb-2">
            {screenTime[0]}
            <span className="text-lg text-muted-foreground font-normal ml-2">min / day</span>
          </div>
          <Slider value={screenTime} onValueChange={setScreenTime} min={15} max={180} step={15} className="my-6" />
          <p className="text-sm text-muted-foreground">
            App locks automatically when the limit is reached. A bedtime curfew is on by default (9pm–7am).
          </p>
        </Card>

        {/* Toggles */}
        <Card className="bg-card-grad border-border p-6 shadow-soft md:col-span-2">
          <h3 className="text-xl font-bold mb-4">Safety toggles</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Eye, title: "Hide algorithmic feeds", desc: "Show posts only from approved friends & family", on: true },
              { icon: MessageCircleOff, title: "Block strangers", desc: "Only verified contacts can message your child", on: true },
              { icon: Sparkles, title: "No ads, ever", desc: "Zero advertising and no targeted tracking", on: true },
              { icon: Shield, title: "Auto-moderate content", desc: "AI screens posts before your child sees them", on: true },
            ].map((t) => (
              <div
                key={t.title}
                className="flex items-start justify-between gap-4 p-4 rounded-xl bg-secondary/40 border border-border"
              >
                <div className="flex gap-3">
                  <t.icon className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <div>
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-sm text-muted-foreground">{t.desc}</div>
                  </div>
                </div>
                <Switch defaultChecked={t.on} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default SafetyControls;
