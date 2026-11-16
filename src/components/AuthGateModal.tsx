import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useGooglePopupLogin } from "@/hooks/useGooglePopupLogin";
import { Loader2, MailCheck, ArrowLeft } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import EmailInput from "@/components/EmailInput";
import { translateAuthError } from "@/lib/authErrors";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type View = "auth" | "forgot" | "sent-reset" | "nickname";

const AuthGateModal = ({ open, onOpenChange }: Props) => {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [view, setView] = useState<View>("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const { toast } = useToast();
  // 登录成功后查昵称：没有昵称进强制昵称页，有就关弹窗，查不到就放行关弹窗不困住人。
  const checkNameAndClose = async (uid: string) => {
    try {
      const { data, error } = await supabase.from("profiles").select("display_name").eq("user_id", uid).maybeSingle();
      if (error) {
        onOpenChange(false);
        return;
      }
      if (!data?.display_name) {
        setView("nickname");
        return;
      }
      onOpenChange(false);
    } catch {
      onOpenChange(false);
    }
  };
  // 谷歌登录走弹窗：主标签页不离站、不刷新，Chrome 不会锁桌面版宽度；
  // 登录成功查昵称，没昵称进强制昵称页。
  const { loginWithGoogle, loading: googleLoading } = useGooglePopupLogin({
    onSuccess: async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) await checkNameAndClose(u.id);
      else onOpenChange(false);
    },
  });
  // 登录成功自动关登录框（带 prevUserRef guard，只在 user 从无到有时才跑）。
  // 以后有 APP 时，APP 里谷歌登录走深链回跳，hook 的 onSuccess 靠
  // googleLoading 触发，APP 分支没置 googleLoading 就不会关框——这条
  // effect 兜底。浏览器里无害（登录成功本来就要关框）。已登录时打开的
  // 弹窗不会被关掉（prevUserRef 已是非空）。
  const { user } = useAuth();
  const prevUserRef = useRef(user);
  useEffect(() => {
    if (open && user && !prevUserRef.current) checkNameAndClose(user.id);
    prevUserRef.current = user;
  }, [open, user, onOpenChange]);

  const fail = (msg: string) => toast({ title: msg, variant: "destructive" });

  const validEmail = () => {
    if (!emailRegex.test(email)) {
      fail("邮箱格式不正确");
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validEmail()) return;
    if (password.length < 6) return fail("密码至少 6 位");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.toLowerCase().includes("not confirmed")) setNeedsVerify(true);
        fail(translateAuthError(error.message));
        return;
      }
      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        setNeedsVerify(true);
        fail("邮箱尚未验证，请先点击验证邮件中的链接");
        return;
      }
      toast({ title: "登录成功 ✨" });
      await checkNameAndClose(data.user.id);
    } catch (err: any) {
      fail(translateAuthError(err?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nickname.trim();
    if (!trimmedName) return fail("请填写昵称");
    if (trimmedName.length > 60) return fail("昵称最多 60 个字");
    if (!validEmail()) return;
    if (password.length < 6) return fail("密码至少 6 位");
    if (password !== confirmPassword) return fail("两次输入的密码不一致");
    setLoading(true);
    try {
      try {
        const { data: taken, error: rpcError } = await supabase.rpc("nickname_taken", { p_name: trimmedName });
        if (!rpcError && taken === true) {
          fail("该昵称已被使用，请换一个");
          return;
        }
      } catch {
        // 查重失败放行继续，不挡注册
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/`, data: { display_name: trimmedName } },
      });
      if (error) {
        fail(translateAuthError(error.message));
        return;
      }
      if (!data.session) {
        // auto sign-in fallback
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          fail(translateAuthError(signInError.message));
          return;
        }
      }
      toast({ title: "注册成功 ✨ 已自动登录" });
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) await checkNameAndClose(u.id);
      else onOpenChange(false);
    } catch (err: any) {
      fail(translateAuthError(err?.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) return fail("请填写昵称");
    if (trimmed.length > 60) return fail("昵称最多 60 个字");
    if (!user) return;
    setSavingName(true);
    try {
      const { data: taken } = await supabase.from("profiles").select("user_id").eq("display_name", trimmed).neq("user_id", user.id).maybeSingle();
      if (taken) {
        fail("该昵称已被使用，请换一个");
        return;
      }
      const { error } = await supabase.from("profiles").upsert({ user_id: user.id, display_name: trimmed }, { onConflict: "user_id" });
      if (error) {
        fail("保存失败，请稍后再试");
        return;
      }
      toast({ title: "昵称设置成功" });
      onOpenChange(false);
    } catch {
      fail("保存失败，请稍后再试");
    } finally {
      setSavingName(false);
    }
  };

  const handleResend = async () => {
    if (!validEmail()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      if (error) {
        fail(translateAuthError(error.message));
        return;
      }
      toast({ title: "验证邮件已重新发送 📨" });
      setNeedsVerify(false);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validEmail()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        fail(translateAuthError(error.message));
        return;
      }
      setSentTo(email);
      setView("sent-reset");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setView("auth");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setNickname("");
    setTab("login");
    setNeedsVerify(false);
    setSentTo("");
    setLoading(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && view === "nickname") return;
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="glass border-primary/20 sm:max-w-md">
        {view === "nickname" ? (
          <>
            <DialogHeader>
              <DialogTitle className="gradient-text">设置昵称</DialogTitle>
              <DialogDescription>请设置一个昵称，最多 60 个字，昵称不能与他人重复。</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveNickname} className="space-y-3 mt-4">
              <Input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={60} placeholder="昵称（最多 60 个字）" required />
              <Button type="submit" disabled={savingName} className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
                {savingName && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}保存昵称
              </Button>
            </form>
          </>
        ) : view === "sent-reset" ? (
          <div className="flex flex-col items-center text-center py-4 gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
              <MailCheck className="w-7 h-7 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="gradient-text">
                {"重置链接已发送"}
              </DialogTitle>
              <DialogDescription>
                我们已向 <span className="text-primary">{sentTo}</span> 发送了邮件。
                <br />
                {"请点击邮件中的链接重置密码。"}
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => setView("auth")} variant="outline" className="w-full">
              返回登录
            </Button>
          </div>
        ) : view === "forgot" ? (
          <>
            <DialogHeader>
              <DialogTitle className="gradient-text">找回密码</DialogTitle>
              <DialogDescription>输入注册邮箱，我们会发送重置链接</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleForgot} className="space-y-3 mt-4">
              <EmailInput value={email} onChange={setEmail} required />
              <Button type="submit" disabled={loading} className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}发送重置链接
              </Button>
              <button type="button" onClick={() => setView("auth")} className="w-full text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-1 mt-2">
                <ArrowLeft className="w-3 h-3" /> 返回登录
              </button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="gradient-text">登录后访问</DialogTitle>
              <DialogDescription>使用邮箱注册后即可访问</DialogDescription>
            </DialogHeader>

            <Tabs value={tab} onValueChange={(v) => { setTab(v as "login" | "signup"); setNeedsVerify(false); }} className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">登录</TabsTrigger>
                <TabsTrigger value="signup">注册</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-3 mt-4">
                  <EmailInput name="email" id="email" value={email} onChange={setEmail} placeholder="邮箱 (支持 QQ/163/Gmail 等)" required />
                  <PasswordInput
                    name="login-password"
                    id="login-password"
                    autoComplete="current-password"
                    placeholder="密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" disabled={loading} className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}登录
                  </Button>
                  {needsVerify && (
                    <Button type="button" variant="outline" onClick={handleResend} disabled={loading} className="w-full">
                      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}重新发送验证邮件
                    </Button>
                  )}
                  <button type="button" onClick={() => setView("forgot")} className="w-full text-xs text-muted-foreground hover:text-primary text-center mt-1">
                    忘记密码？
                  </button>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 h-px bg-border/50" />
                    <span className="text-xs text-muted-foreground">或</span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>
                  <Button
                    type="button"
                    onClick={loginWithGoogle}
                    disabled={googleLoading}
                    variant="outline"
                    className="w-full glass border-border/50 hover:bg-secondary/50"
                  >
                    {googleLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {googleLoading ? "登录中..." : "Google 登录"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-3 mt-4">
                  <Input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={60} placeholder="昵称（最多 60 个字）" required />
                  <EmailInput value={email} onChange={setEmail} placeholder="邮箱 (支持 QQ/163/Gmail 等)" required />
                  <PasswordInput
                    autoComplete="new-password"
                    placeholder="设置密码 (至少 6 位)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <PasswordInput
                    autoComplete="new-password"
                    placeholder="确认密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  {confirmPassword.length > 0 && password !== confirmPassword && (
                    <p className="text-xs text-destructive">两次输入的密码不一致</p>
                  )}
                  <Button type="submit" disabled={loading} className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}立即注册
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">注册成功后自动登录</p>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 h-px bg-border/50" />
                    <span className="text-xs text-muted-foreground">或</span>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>
                  <Button
                    type="button"
                    onClick={loginWithGoogle}
                    disabled={googleLoading}
                    variant="outline"
                    className="w-full glass border-border/50 hover:bg-secondary/50"
                  >
                    {googleLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {googleLoading ? "登录中..." : "Google 注册"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthGateModal;
