import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Lock } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // sign in
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");

  // sign up
  const [parentName, setParentName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [childName, setChildName] = useState("");

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siEmail || !siPassword) return toast.error("Email and password are required");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: siEmail, password: siPassword });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate("/parent");
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim()) return toast.error("Please enter your name");
    if (!suEmail || !suPassword) return toast.error("Email and password are required");
    if (suPassword.length < 8) return toast.error("Password must be at least 8 characters");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: suEmail,
      password: suPassword,
      options: {
        emailRedirectTo: `${window.location.origin}/parent`,
        data: { parent_name: parentName.trim(), child_name: childName.trim() },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created! You're signed in.");
    navigate("/parent");
  };

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="bg-hero">
        <section className="container py-16 max-w-md mx-auto">
          <div className="text-center mb-8 animate-fade-up">
            <Badge className="bg-primary/15 text-primary border-primary/30 mb-4">
              <Lock className="w-3 h-3 mr-1" /> Parents only
            </Badge>
            <h1 className="text-4xl font-bold mb-2">Family Account</h1>
            <p className="text-muted-foreground text-sm">
              Settings sync securely across all your devices.
            </p>
          </div>

          <Card className="bg-card-grad border-border p-6 shadow-soft">
            <Tabs defaultValue="signin">
              <TabsList className="grid grid-cols-2 w-full mb-6">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={signIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="si-email">Email</Label>
                    <Input id="si-email" type="email" value={siEmail}
                      onChange={(e) => setSiEmail(e.target.value.slice(0, 120))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="si-pw">Password</Label>
                    <Input id="si-pw" type="password" value={siPassword}
                      onChange={(e) => setSiPassword(e.target.value)} />
                  </div>
                  <Button type="submit" disabled={loading}
                    className="w-full bg-brand text-primary-foreground hover:opacity-90 shadow-glow rounded-full font-bold">
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={signUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pname">Your name</Label>
                    <Input id="pname" value={parentName}
                      onChange={(e) => setParentName(e.target.value.slice(0, 80))} placeholder="Alex Rivera" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cname">Child's first name (optional)</Label>
                    <Input id="cname" value={childName}
                      onChange={(e) => setChildName(e.target.value.slice(0, 40))} placeholder="Sam" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-email">Email</Label>
                    <Input id="su-email" type="email" value={suEmail}
                      onChange={(e) => setSuEmail(e.target.value.slice(0, 120))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="su-pw">Password (min 8 characters)</Label>
                    <Input id="su-pw" type="password" value={suPassword}
                      onChange={(e) => setSuPassword(e.target.value)} />
                  </div>
                  <Button type="submit" disabled={loading}
                    className="w-full bg-brand text-primary-foreground hover:opacity-90 shadow-glow rounded-full font-bold">
                    <Shield className="w-4 h-4 mr-1" />
                    {loading ? "Creating..." : "Create family account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-xs text-muted-foreground text-center mt-6 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-safe" /> End-to-end private. We never sell your data.
            </p>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/" className="hover:text-foreground">← Back to home</Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Auth;
