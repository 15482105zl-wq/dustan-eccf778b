import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";
import SiteFooter from "@/components/SiteFooter";
import SiteStatsPanel from "@/components/SiteStatsPanel";
import { ArrowLeft, Camera, Save, Loader2 } from "lucide-react";

const Profile = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, bio, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!active) return;
      if (data) {
        setDisplayName(data.display_name || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url);
      } else {
        setDisplayName("");
      }
      setLoaded(true);
    })();
    return () => { active = false; };
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "头像不能超过 2MB", variant: "destructive" });
      return;
    }
    const ALLOWED_MIME: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
    };
    const ext = ALLOWED_MIME[file.type];
    if (!ext) {
      toast({ title: "仅支持 JPG / PNG / GIF / WEBP 格式", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const path = `${user.id}/avatar.${ext}`;

      const { data: existingFiles } = await supabase.storage.from("avatars").list(user.id);
      if (existingFiles && existingFiles.length > 0) {
        const staleFiles = existingFiles
          .filter((f) => f.name !== `avatar.${ext}`)
          .map((f) => `${user.id}/${f.name}`);
        if (staleFiles.length > 0) {
          await supabase.storage.from("avatars").remove(staleFiles);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) {
        toast({ title: "上传失败", description: uploadError.message, variant: "destructive" });
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      const cacheBusted = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(cacheBusted);
      const { error: upsertErr } = await supabase
        .from("profiles")
        .upsert(
          { user_id: user.id, avatar_url: cacheBusted },
          { onConflict: "user_id" }
        );
      if (upsertErr) {
        toast({ title: "头像保存失败", description: upsertErr.message, variant: "destructive" });
        return;
      }
      await supabase.auth.updateUser({ data: { avatar_url: cacheBusted } });
      toast({ title: "头像已更新 ✨" });
    } catch (err: any) {
      toast({ title: "上传失败", description: err?.message || "未知错误", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    if (displayName.trim().length > 6) {
      toast({ title: "昵称最多 6 个字", variant: "destructive" });
      return;
    }
    if (bio.trim().length > 60) {
      toast({ title: "简介最多 60 个字", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            display_name: displayName.trim(),
            bio: bio.trim(),
          },
          { onConflict: "user_id" }
        );
      if (error) {
        toast({ title: "保存失败", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "资料已更新 ✨" });
      }
    } catch (err: any) {
      toast({ title: "保存失败", description: err?.message || "未知错误", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText.trim() !== "确认注销") return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account", { body: {} });
      if (error || !data?.ok) {
        toast({ title: "注销失败", description: error?.message || data?.error || "请稍后再试", variant: "destructive" });
        return;
      }
      try { localStorage.removeItem("dustan_my_profile"); } catch { /* 忽略 */ }
      await signOut();
      toast({ title: "账号已永久注销" });
      navigate("/", { replace: true });
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || !loaded) {
    return (
      <div className="min-h-screen relative">
        <ParticleBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />加载中...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <SEO
        title="个人资料 · Dustan Hub · 数字站"
        description="管理账号头像、昵称与个人资料。"
        path="/profile"
        noindex
      />
      <ParticleBackground />
      <main className="relative z-10 flex flex-col items-center px-4 py-12">
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
          <h1 className="font-heading text-3xl font-bold">
            <span className="gradient-text glow-text">个人资料</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-sm glass rounded-xl p-6 space-y-6"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <Avatar className="w-20 h-20 border-2 border-primary/30">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="bg-secondary text-foreground text-xl">
                  {displayName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploading ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : <Camera className="w-5 h-5 text-primary" />}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              {uploading ? "上传中..." : "点击头像更换"}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">昵称</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={6}
                className="bg-secondary/50 border-border/50"
                placeholder="你的昵称"
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{displayName.length}/6</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">邮箱</label>
              <Input
                value={user?.email || ""}
                disabled
                className="bg-secondary/30 border-border/30 text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">个人简介</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={60}
                rows={2}
                className="bg-secondary/50 border-border/50 resize-none"
                placeholder="介绍一下自己..."
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{bio.length}/60</p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? "保存中..." : "保存资料"}
          </Button>
        </motion.div>

        {isAdmin && <SiteStatsPanel />}

        <div className="w-full max-w-sm glass rounded-xl p-6 mt-6 space-y-3 border border-destructive/30">
          <h2 className="text-sm font-semibold text-destructive">永久注销账号</h2>
          <p className="text-xs text-muted-foreground">
            将永久删除你的账号、头像、昵称和所有留言，删除后不能恢复。
          </p>
          {!confirmOpen ? (
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(true)}
              className="w-full border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              注销账号
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-destructive">请输入「确认注销」以继续：</p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="确认注销"
                className="bg-secondary/50 border-destructive/40"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={deleting}
                  onClick={() => { setConfirmOpen(false); setConfirmText(""); }}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={deleting || confirmText.trim() !== "确认注销"}
                  onClick={handleDeleteAccount}
                >
                  {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  永久删除
                </Button>
              </div>
            </div>
          )}
        </div>
        <SiteFooter />
      </main>
    </div>
  );
};

export default Profile;