import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ParticleBackground from "@/components/ParticleBackground";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import { translateAuthError } from "@/lib/authErrors";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Supabase parses the recovery token from the URL hash automatically
    // (detectSessionInUrl = true by default). We listen for PASSWORD_RECOVERY
    // or an existing session to know we can update the password.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      } else {
        // Give Supabase a moment to parse the hash, then re-check
        setTimeout(async () => {
          const { data: { session: s2 } } = await supabase.auth.getSession();
          if (s2) setReady(true);
          else if (!window.location.hash.includes("access_token") && !window.location.hash.includes("type=recovery")) {
            setInvalid(true);
          }
        }, 800);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "密码至少 6 位", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "两次输入的密码不一致", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ title: "重置失败", description: translateAuthError(error.message), variant: "destructive" });
        return;
      }
      toast({ title: "密码已重置 ✨" });
      // Sign out so the user logs in with the new password
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (err: any) {
      toast({ title: "重置失败", description: translateAuthError(err?.message), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (invalid) {
    return (
      <div className="min-h-screen relative">
        <ParticleBackground />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
          <p className="text-muted-foreground">重置链接无效或已过期</p>
          <Button variant="outline" onClick={() => navigate("/auth")}>返回登录</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm glass rounded-xl p-6"
        >
          <h1 className="font-heading text-xl font-bold mb-4 text-center gradient-text">重置密码</h1>

          {!ready ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> 正在校验重置链接...
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-3">
              <PasswordInput
                placeholder="新密码 (至少 6 位)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
              <PasswordInput
                placeholder="确认新密码"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
              {confirm.length > 0 && password !== confirm && (
                <p className="text-xs text-destructive">两次输入的密码不一致</p>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? "处理中..." : "确认重置"}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
