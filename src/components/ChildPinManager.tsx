import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { KeyRound, Loader2, Check } from "lucide-react";

const ChildPinManager = () => {
  const [hasPin, setHasPin] = useState<boolean>(false);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("has_child_pin");
      if (!error) setHasPin(!!data);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    if (!/^\d{4}$/.test(pin)) {
      toast.error("PIN must be exactly 4 digits");
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc("set_child_pin", { _pin: pin });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(hasPin ? "PIN updated 🔒" : "PIN set! Child mode is unlocked 🔒");
    setHasPin(true);
    setPin("");
  };

  return (
    <Card className="bg-card-grad border-border p-6 shadow-soft md:col-span-2">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
          <KeyRound className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Child mode PIN</h3>
          <p className="text-sm text-muted-foreground">
            Set a 4-digit PIN your child uses to open their personal feed at <code>/kid</code>.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Checking PIN status…
        </div>
      ) : (
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]">
            <Input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              className="text-2xl tracking-[0.5em] text-center font-bold"
            />
          </div>
          <Button
            onClick={save}
            disabled={saving || pin.length !== 4}
            className="bg-brand text-primary-foreground hover:opacity-90 shadow-glow rounded-full font-bold"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <KeyRound className="w-4 h-4 mr-1" />}
            {hasPin ? "Update PIN" : "Set PIN"}
          </Button>
          {hasPin && (
            <span className="text-xs text-safe flex items-center gap-1">
              <Check className="w-3 h-3" /> A PIN is currently set
            </span>
          )}
        </div>
      )}
    </Card>
  );
};

export default ChildPinManager;
