import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import ParticleBackground from "@/components/ParticleBackground";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import { translateAuthError } from "@/lib/authErrors";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "请填写邮箱和密码", variant: "destructive" });
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      toast({ title: "两次输入的密码不一致", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast({ title: "登录失败", description: translateAuthError(error.message), variant: "destructive" });
        } else {
          toast({ title: "登录成功 ✨" });
          navigate("/");
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) {
          toast({ title: "注册失败", description: translateAuthError(error.message), variant: "destructive" });
        } else {
          toast({ title: "注册成功", description: "请检查邮箱验证链接" });
        }
      }
    } catch (err: any) {
      toast({ title: "操作失败", description: translateAuthError(err?.message), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({ title: "Google 登录失败", variant: "destructive" });
        return;
      }
      if (result.redirected) return;
      navigate("/");
    } catch (e: any) {
      toast({ title: "Google 登录失败", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <div className="relative z-10 flex flex-col items-center px-4 py-12">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="self-start mb-8 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-heading text-3xl font-bold mb-2">
            <span className="gradient-text glow-text">{isLogin ? "登录" : "注册"}</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            {isLogin ? "欢迎回来" : "创建你的账号"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-sm"
        >
          <form onSubmit={handleEmailAuth} className="glass rounded-xl p-6 space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/50"
                autoComplete="email"
                required
              />
            </div>
            <PasswordInput
              placeholder={isLogin ? "密码" : "设置密码 (至少 6 位)"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={6}
              required
              className="bg-secondary/50 border-border/50"
            />
            {!isLogin && (
              <>
                <PasswordInput
                  placeholder="确认密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                  className="bg-secondary/50 border-border/50"
                />
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p className="text-xs text-destructive">两次输入的密码不一致</p>
                )}
              </>
            )}
            <Button type="submit" disabled={loading} className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "处理中..." : isLogin ? "登录" : "注册"}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground">或</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full glass border-border/50 hover:bg-secondary/50"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google 登录
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {isLogin ? "还没有账号？" : "已有账号？"}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setConfirmPassword(""); }}
              className="text-primary hover:underline ml-1"
            >
              {isLogin ? "注册" : "登录"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
