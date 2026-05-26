import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Loader2, MailCheck } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthGateModal = ({ open, onOpenChange }: Props) => {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const { toast } = useToast();

  const validate = () => {
    if (!emailRegex.test(email)) {
      toast({ title: "邮箱格式不正确", variant: "destructive" });
      return false;
    }
    if (password.length < 6) {
      toast({ title: "密码至少 6 位", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("email not confirmed") || msg.includes("not confirmed")) {
        toast({ title: "请先验证邮箱", description: "请前往邮箱点击验证链接后再登录", variant: "destructive" });
      } else {
        toast({ title: "登录失败", description: error.message, variant: "destructive" });
      }
      return;
    }
    if (data.user && !data.user.email_confirmed_at) {
      await supabase.auth.signOut();
      toast({ title: "请先验证邮箱", description: "请前往邮箱点击验证链接后再登录", variant: "destructive" });
      return;
    }
    toast({ title: "登录成功 ✨" });
    onOpenChange(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setLoading(false);
    if (error) {
      toast({ title: "注册失败", description: error.message, variant: "destructive" });
      return;
    }
    setSentTo(email);
  };

  const reset = () => {
    setSentTo(null);
    setEmail("");
    setPassword("");
    setTab("login");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="glass border-primary/20 sm:max-w-md">
        {sentTo ? (
          <div className="flex flex-col items-center text-center py-4 gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
              <MailCheck className="w-7 h-7 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="gradient-text">验证邮件已发送</DialogTitle>
              <DialogDescription>
                我们已向 <span className="text-primary">{sentTo}</span> 发送了一封验证邮件。
                <br />请点击邮件中的链接完成验证，然后回到这里登录。
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => setSentTo(null)} variant="outline" className="w-full">
              我已验证，去登录
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="gradient-text">登录后访问</DialogTitle>
              <DialogDescription>使用邮箱注册并验证后即可使用 Clash 配置</DialogDescription>
            </DialogHeader>

            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")} className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">登录</TabsTrigger>
                <TabsTrigger value="signup">注册</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-3 mt-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" inputMode="email" autoComplete="email" placeholder="邮箱 (支持 QQ/163/Gmail 等)" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="password" autoComplete="current-password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" required />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}登录
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-3 mt-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" inputMode="email" autoComplete="email" placeholder="邮箱 (支持 QQ/163/Gmail 等)" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="password" autoComplete="new-password" placeholder="设置密码 (至少 6 位)" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" required minLength={6} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}注册并发送验证邮件
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">注册后需点击邮件中的验证链接才能登录</p>
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
