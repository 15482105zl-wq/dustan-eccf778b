import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";
import { Loader2, Mail, ArrowLeft, MailCheck } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import { translateAuthError } from "@/lib/authErrors";

type Status = "checking" | "ready" | "invalid";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Capture recovery params from URL hash OR query string BEFORE the router
 * does anything. Some webviews (WeChat/QQ) pre-fetch the URL which can
 * cause Supabase to consume the token in a hidden tab; we still want to
 * surface a clean recovery UI rather than an "expired" error.
 */
const readRecoveryParams = () => {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hash);
  const queryParams = new URLSearchParams(window.location.search);

  const get = (k: string) => hashParams.get(k) ?? queryParams.get(k);

  return {
    access_token: get("access_token"),
    refresh_token: get("refresh_token"),
    type: get("type"),
    token_hash: get("token_hash") ?? get("token"),
    code: get("code"),
    error: get("error") ?? get("error_code"),
    error_description: get("error_description"),
  };
};

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>("checking");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Resend reset flow shown on invalid screen
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const handled = useRef(false);

  useEffect(() => {
    // Snapshot the params synchronously so a later router navigation can't
    // wipe them from window.location before we use them.
    const params = readRecoveryParams();

    const markReady = () => {
      if (handled.current) return;
      handled.current = true;
      setStatus("ready");
      setErrorMsg(null);
    };

    const markInvalid = (msg?: string) => {
      if (handled.current) return;
      handled.current = true;
      setStatus("invalid");
      setErrorMsg(msg ?? "重置链接无效或已过期");
    };

    // Listen for Supabase auth events. PASSWORD_RECOVERY fires once the
    // recovery token has been consumed and a temporary session is active.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        markReady();
        return;
      }
      if (event === "SIGNED_IN" && session && params.type === "recovery") {
        markReady();
      }
    });

    (async () => {
      // 1) Explicit error in URL from Supabase
      if (params.error) {
        markInvalid(translateAuthError(params.error_description ?? params.error));
        return;
      }

      // 2) PKCE-style ?code=...
      if (params.code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(params.code);
          if (error) {
            markInvalid(translateAuthError(error.message));
            return;
          }
          markReady();
          return;
        } catch (e: any) {
          markInvalid(translateAuthError(e?.message));
          return;
        }
      }

      // 3) Hash-style #access_token=...&type=recovery (older flow)
      if (params.access_token && params.type === "recovery") {
        try {
          if (params.refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token: params.access_token,
              refresh_token: params.refresh_token,
            });
            if (error) {
              markInvalid(translateAuthError(error.message));
              return;
            }
          }
          markReady();
          return;
        } catch (e: any) {
          markInvalid(translateAuthError(e?.message));
          return;
        }
      }

      // 4) token_hash style ?token_hash=...&type=recovery
      if (params.token_hash && params.type === "recovery") {
        try {
          const { error } = await supabase.auth.verifyOtp({
            type: "recovery",
            token_hash: params.token_hash,
          });
          if (error) {
            markInvalid(translateAuthError(error.message));
            return;
          }
          markReady();
          return;
        } catch (e: any) {
          markInvalid(translateAuthError(e?.message));
          return;
        }
      }

      // 5) Fallback: maybe the SDK already consumed the hash (detectSessionInUrl)
      //    or a webview pre-fetched it. Wait a bit, then probe for a session.
      const probe = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          markReady();
          return true;
        }
        return false;
      };

      if (await probe()) return;
      await new Promise((r) => setTimeout(r, 1200));
      if (await probe()) return;
      await new Promise((r) => setTimeout(r, 1500));
      if (await probe()) return;

      markInvalid();
    })();

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
        toast({
          title: "重置失败",
          description: translateAuthError(error.message),
          variant: "destructive",
        });
        return;
      }
      toast({ title: "密码已重置 ✨" });
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (err: any) {
      toast({
        title: "重置失败",
        description: translateAuthError(err?.message),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRegex.test(resendEmail)) {
      toast({ title: "邮箱格式不正确", variant: "destructive" });
      return;
    }
    setResending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resendEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({
          title: "发送失败",
          description: translateAuthError(error.message),
          variant: "destructive",
        });
        return;
      }
      setResent(true);
      toast({ title: "重置邮件已重新发送 📨" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <SEO
        title="重置密码 · 资源导航站"
        description="通过邮件链接重置账号密码。"
        path="/reset-password"
        noindex
      />
      <ParticleBackground />
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm glass rounded-xl p-6"
        >
          <h1 className="font-heading text-xl font-bold mb-4 text-center gradient-text">
            {status === "invalid" ? "链接已失效" : "重置密码"}
          </h1>

          {status === "checking" && (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> 正在校验重置链接...
            </div>
          )}

          {status === "ready" && (
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

          {status === "invalid" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {errorMsg ?? "重置链接无效或已过期"}
                <br />
                <span className="text-xs">请输入邮箱重新获取重置链接</span>
              </p>

              {resent ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                    <MailCheck className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm text-center">
                    重置邮件已发送至
                    <br />
                    <span className="text-primary">{resendEmail}</span>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleResend} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="注册邮箱"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={resending}
                    className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
                  >
                    {resending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    重新发送重置邮件
                  </Button>
                </form>
              )}

              <Button
                variant="outline"
                onClick={() => navigate("/auth")}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> 返回登录
              </Button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ResetPassword;
