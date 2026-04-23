import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UserPlus, Loader2, Trash2, KeyRound, User } from "lucide-react";

type ChildAccount = {
  id: string;
  username: string;
  child_name: string;
  created_at: string;
};

const ChildAccountManager = () => {
  const [accounts, setAccounts] = useState<ChildAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // create form
  const [childName, setChildName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  // edit state per row
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("child_accounts")
      .select("id, username, child_name, created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setAccounts((data ?? []) as ChildAccount[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!childName.trim()) return toast.error("Add the child's name");
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username))
      return toast.error("Username must be 3-24 letters, numbers, or underscores");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");

    setCreating(true);
    const { error } = await supabase.rpc("create_child_account", {
      _username: username,
      _password: password,
      _child_name: childName.trim(),
    });
    setCreating(false);
    if (error) return toast.error(error.message);
    toast.success(`Account created for ${childName.trim()} 🎉`);
    setChildName("");
    setUsername("");
    setPassword("");
    load();
  };

  const updatePassword = async (id: string) => {
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    setSavingId(id);
    const { error } = await supabase.rpc("update_child_account", {
      _id: id,
      _password: newPassword,
    });
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Password updated 🔒");
    setEditingId(null);
    setNewPassword("");
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete the account for ${name}? They won't be able to log in anymore.`)) return;
    const { error } = await supabase.from("child_accounts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Account removed");
    load();
  };

  return (
    <Card className="bg-card-grad border-border p-6 shadow-soft md:col-span-2">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
          <KeyRound className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Kid logins</h3>
          <p className="text-sm text-muted-foreground">
            Create a username and password for each child. They sign in at <code>/kid</code> without
            needing your account.
          </p>
        </div>
      </div>

      {/* Create form */}
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        <div className="space-y-1">
          <Label htmlFor="child-name">Child's name</Label>
          <Input
            id="child-name"
            value={childName}
            onChange={(e) => setChildName(e.target.value.slice(0, 40))}
            placeholder="Emma"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="child-username">Username</Label>
          <Input
            id="child-username"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 24))}
            placeholder="emma_2025"
            autoComplete="off"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="child-password">Password</Label>
          <Input
            id="child-password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value.slice(0, 72))}
            placeholder="At least 6 characters"
            autoComplete="off"
          />
        </div>
      </div>
      <div className="flex justify-end mb-6">
        <Button
          onClick={create}
          disabled={creating || !childName.trim() || username.length < 3 || password.length < 6}
          className="bg-brand text-primary-foreground hover:opacity-90 shadow-glow rounded-full font-bold"
        >
          {creating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <UserPlus className="w-4 h-4 mr-1" />}
          Create kid login
        </Button>
      </div>

      {/* Existing accounts */}
      <div>
        <h4 className="text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wide">
          Existing accounts
        </h4>
        {loading ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No kid accounts yet.</p>
        ) : (
          <div className="space-y-2">
            {accounts.map((a) => {
              const isEditing = editingId === a.id;
              return (
                <div
                  key={a.id}
                  className="p-4 rounded-xl border border-border bg-secondary/40 flex flex-wrap items-center gap-3 justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{a.child_name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        Username: <code>{a.username}</code>
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Input
                        type="text"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value.slice(0, 72))}
                        className="w-44"
                        autoComplete="off"
                      />
                      <Button
                        size="sm"
                        onClick={() => updatePassword(a.id)}
                        disabled={savingId === a.id || newPassword.length < 6}
                        className="bg-brand text-primary-foreground hover:opacity-90 rounded-full"
                      >
                        {savingId === a.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "Save"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(null);
                          setNewPassword("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(a.id);
                          setNewPassword("");
                        }}
                        className="rounded-full"
                      >
                        <KeyRound className="w-3 h-3 mr-1" /> Reset password
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(a.id, a.child_name)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ChildAccountManager;
