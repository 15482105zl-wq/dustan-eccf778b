import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Bell, ImagePlus, Loader2, Lock, Pencil, Pin, Plus, Reply as ReplyIcon, Send, Trash2, User as UserIcon, X } from "lucide-react";
import { motion } from "framer-motion";


const MAX_TITLE = 60;
const MAX_BODY = 500;
const MAX_REPLY = 200;
const MAX_IMAGES = 2;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

interface Thread {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  pinned: boolean;
  image_urls: string[];
}
interface Reply {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  created_at: string;
  reply_to_id: string | null;
}
interface Profile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  return d.toLocaleDateString("zh-CN");
};

const linkify = (text: string) => {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline break-all"
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
};

const sortThreads = (list: Thread[]) =>
  [...list].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

const randomId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const UnlockForum = ({ open, onOpenChange }: Props) => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const isOwner = isAdmin;

  const [loading, setLoading] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [composeOpen, setComposeOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [composeImages, setComposeImages] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [replying, setReplying] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<Record<string, string | null>>({});
  const [unreadNotice, setUnreadNotice] = useState(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchProfiles = useCallback(async (ids: string[]) => {
    const missing = Array.from(new Set(ids)).filter((id) => id && !profiles[id]);
    if (!missing.length) return;
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", missing);
    if (data) {
      setProfiles((prev) => {
        const next = { ...prev };
        for (const p of data) next[p.user_id] = p as Profile;
        return next;
      });
    }
  }, [profiles]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const { data: ts } = await supabase
        .from("forum_threads")
        .select("*")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);
      const tList = (ts || []) as Thread[];
      setThreads(tList);

      if (tList.length) {
        const { data: rs } = await supabase
          .from("forum_replies")
          .select("*")
          .in("thread_id", tList.map((t) => t.id))
          .order("created_at", { ascending: true });
        const grouped: Record<string, Reply[]> = {};
        (rs || []).forEach((r: any) => {
          (grouped[r.thread_id] ||= []).push(r as Reply);
        });
        setReplies(grouped);

        const ids = [
          ...tList.map((t) => t.user_id),
          ...(rs || []).map((r: any) => r.user_id),
        ];
        await fetchProfiles(ids);
      }
    } catch (e: any) {
      toast({ title: "加载失败", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [fetchProfiles, toast]);

  const checkNotifications = useCallback(async () => {
    if (!user) return;
    const { count } = await supabase
      .from("forum_notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false);
    if (count && count > 0) {
      setUnreadNotice(count);
      await supabase
        .from("forum_notifications")
        .update({ is_read: true })
        .eq("recipient_id", user.id)
        .eq("is_read", false);
    } else {
      setUnreadNotice(0);
    }
  }, [user]);

  useEffect(() => {
    if (open) {
      loadAll();
      checkNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const nameOf = (uid: string) => profiles[uid]?.display_name || "匿名用户";

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (composeImages.length >= MAX_IMAGES) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "文件类型不对", description: "只能上传图片", variant: "destructive" });
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast({ title: "图片太大", description: "单张图片不能超过 2MB，请压缩后重试", variant: "destructive" });
      return;
    }
    setComposeImages((prev) => [...prev, file]);
  };

  const removeComposeImage = (idx: number) => {
    setComposeImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePostThread = async () => {
    if (!user) return;
    const t = title.trim().slice(0, MAX_TITLE);
    const c = body.trim().slice(0, MAX_BODY);
    if (!t || !c) return;
    setPosting(true);
    try {
      const imageUrls: string[] = [];
      for (const file of composeImages) {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${user.id}/${randomId()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("forum-images").upload(path, file);
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("forum-images").getPublicUrl(path);
        imageUrls.push(pub.publicUrl);
      }

      const payload = { user_id: user.id, title: t, content: c, image_urls: imageUrls };
      const { data, error } = await supabase
        .from("forum_threads")
        .insert(payload)
        .select("id, user_id, title, content, created_at, pinned, image_urls")
        .single();
      if (error) throw error;
      if (data) setThreads((prev) => sortThreads([data as Thread, ...prev]));
      await fetchProfiles([user.id]);
      setTitle("");
      setBody("");
      setComposeImages([]);
      setComposeOpen(false);
      toast({ title: "主贴已发布 ✨" });
    } catch (e: any) {
      console.error("post thread error", e);
      toast({ title: "发布失败", description: e.message || "请稍后重试", variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (threadId: string) => {
    if (!user) return;
    const content = (replyInputs[threadId] || "").trim();
    if (!content) return;
    setReplying(threadId);
    try {
      const { data, error } = await supabase
        .from("forum_replies")
        .insert({
          thread_id: threadId,
          user_id: user.id,
          content: content.slice(0, MAX_REPLY),
          reply_to_id: replyTarget[threadId] || null,
        })
        .select("*")
        .single();
      if (error) throw error;
      setReplies((prev) => ({ ...prev, [threadId]: [...(prev[threadId] || []), data as Reply] }));
      setReplyInputs((prev) => ({ ...prev, [threadId]: "" }));
      setReplyTarget((prev) => ({ ...prev, [threadId]: null }));
      await fetchProfiles([user.id]);
    } catch (e: any) {
      toast({ title: "回帖失败", description: e.message, variant: "destructive" });
    } finally {
      setReplying(null);
    }
  };

  const handleDeleteThread = async (t: Thread) => {
    if (!window.confirm("确定删除此主贴及其所有回帖？")) return;
    try {
      if (t.image_urls && t.image_urls.length > 0) {
        const marker = "/forum-images/";
        const paths = t.image_urls
          .map((url) => {
            const idx = url.indexOf(marker);
            return idx >= 0 ? url.slice(idx + marker.length) : null;
          })
          .filter((p): p is string => !!p);
        if (paths.length) {
          await supabase.storage.from("forum-images").remove(paths);
        }
      }
      const { error } = await supabase.from("forum_threads").delete().eq("id", t.id);
      if (error) throw error;
      setThreads((prev) => prev.filter((th) => th.id !== t.id));
    } catch (e: any) {
      toast({ title: "删除失败", description: e.message, variant: "destructive" });
    }
  };

  const handleDeleteReply = async (rid: string, tid: string) => {
    const { error } = await supabase.from("forum_replies").delete().eq("id", rid);
    if (error) return toast({ title: "删除失败", description: error.message, variant: "destructive" });
    setReplies((prev) => ({ ...prev, [tid]: (prev[tid] || []).filter((r) => r.id !== rid) }));
  };

  const handleStartEdit = (t: Thread) => {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditBody(t.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
  };

  const handleSaveEdit = async (id: string) => {
    const t = editTitle.trim().slice(0, MAX_TITLE);
    const c = editBody.trim().slice(0, MAX_BODY);
    if (!t || !c) return;
    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from("forum_threads")
        .update({ title: t, content: c })
        .eq("id", id);
      if (error) throw error;
      setThreads((prev) =>
        prev.map((th) => (th.id === id ? { ...th, title: t, content: c } : th))
      );
      handleCancelEdit();
      toast({ title: "已保存修改 ✨" });
    } catch (e: any) {
      toast({ title: "保存失败", description: e.message, variant: "destructive" });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleTogglePin = async (t: Thread) => {
    const next = !t.pinned;
    const { error } = await supabase
      .from("forum_threads")
      .update({ pinned: next })
      .eq("id", t.id);
    if (error) {
      toast({ title: "操作失败", description: error.message, variant: "destructive" });
      return;
    }
    setThreads((prev) =>
      sortThreads(prev.map((th) => (th.id === t.id ? { ...th, pinned: next } : th)))
    );
    toast({ title: next ? "已置顶 📌" : "已取消置顶" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl glass border-accent/40 shadow-[0_0_40px_hsl(var(--accent)/0.35)] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <Lock className="w-5 h-5 text-accent" />
            <span className="gradient-text">BBS</span>
          </DialogTitle>
        </DialogHeader>

        {unreadNotice > 0 && (
          <div className="flex items-center gap-2 text-xs text-accent bg-accent/10 border border-accent/30 rounded-lg px-3 py-2">
            <Bell className="w-3.5 h-3.5 shrink-0" />
            你有 {unreadNotice} 条新回复，看看是谁在跟你聊～
          </div>
        )}

        {user && (
          <div className="border border-accent/40 rounded-xl p-3 bg-accent/5 shadow-[0_0_18px_hsl(var(--accent)/0.25)]">
            {!composeOpen ? (
              <Button
                size="sm"
                onClick={() => setComposeOpen(true)}
                className="bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> 发布新主贴
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
                  placeholder="主题标题"
                  maxLength={MAX_TITLE}
                  className="bg-transparent border-accent/30"
                />
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY))}
                  placeholder="纯文字正文（最多 500 字）"
                  maxLength={MAX_BODY}
                  className="bg-transparent border-accent/30 min-h-[100px] resize-none"
                />

                <div className="flex items-center gap-2 flex-wrap">
                  {composeImages.map((file, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-accent/30">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeComposeImage(i)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-background/80 flex items-center justify-center"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                  {composeImages.length < MAX_IMAGES && (
                    <label className="w-16 h-16 rounded-lg border border-dashed border-accent/40 flex items-center justify-center cursor-pointer text-accent/70 hover:bg-accent/5">
                      <ImagePlus className="w-5 h-5" />
                      <input type="file" accept="image/*" className="hidden" onChange={handlePickImage} />
                    </label>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">最多 {MAX_IMAGES} 张图片，单张不超过 2MB</p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{body.length}/{MAX_BODY}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { setComposeOpen(false); setTitle(""); setBody(""); setComposeImages([]); }}
                    >
                      取消
                    </Button>
                    <Button
                      size="sm"
                      disabled={posting || !title.trim() || !body.trim()}
                      onClick={handlePostThread}
                      className="bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30"
                    >
                      {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "发布"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {loading && (
            <div className="flex justify-center py-6 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> 加载中...
            </div>
          )}

          {!loading && threads.length === 0 && (
            <div className="text-center py-10 text-sm text-muted-foreground">
              暂无主贴，敬请期待 ✨
            </div>
          )}

          <Accordion type="multiple" className="space-y-3">
            {threads.map((t) => {
              const author = profiles[t.user_id];
              const list = replies[t.id] || [];
              const isEditing = editingId === t.id;
              const canManage = isOwner || user?.id === t.user_id;
              const currentTarget = replyTarget[t.id]
                ? list.find((r) => r.id === replyTarget[t.id])
                : null;
              return (
                <AccordionItem
                  key={t.id}
                  value={t.id}
                  className="rounded-xl overflow-hidden border border-accent/40 bg-background/40 shadow-[0_0_18px_hsl(var(--accent)/0.18)] animate-breathe-glow"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-start gap-3 text-left w-full">
                      <Avatar className="w-8 h-8 border border-accent/40 shrink-0">
                        <AvatarImage src={author?.avatar_url || undefined} />
                        <AvatarFallback className="bg-secondary text-xs">
                          {author?.display_name?.[0]?.toUpperCase() || <UserIcon className="w-3.5 h-3.5" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <div className="font-heading font-semibold text-foreground text-sm break-words">{t.title}</div>
                          {t.pinned && (
                            <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/40 inline-flex items-center gap-0.5">
                              <Pin className="w-2.5 h-2.5" /> 置顶
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {nameOf(t.user_id)} · {formatTime(t.created_at)} · {list.length} 回帖
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    {isEditing ? (
                      <div className="space-y-2 mb-3">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value.slice(0, MAX_TITLE))}
                          placeholder="主题标题"
                          maxLength={MAX_TITLE}
                          className="bg-transparent border-accent/30"
                        />
                        <Textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value.slice(0, MAX_BODY))}
                          placeholder="纯文字正文（最多 500 字）"
                          maxLength={MAX_BODY}
                          className="bg-transparent border-accent/30 min-h-[100px] resize-none"
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{editBody.length}/{MAX_BODY}</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                              取消
                            </Button>
                            <Button
                              size="sm"
                              disabled={savingEdit || !editTitle.trim() || !editBody.trim()}
                              onClick={() => handleSaveEdit(t.id)}
                              className="bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30"
                            >
                              {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "保存"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-foreground/85 whitespace-pre-wrap break-words mb-3 border-l-2 border-accent/40 pl-3">
                          {linkify(t.content)}
                        </p>
                        {t.image_urls && t.image_urls.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {t.image_urls.map((url, i) => (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-24 h-24 rounded-lg overflow-hidden border border-border/40"
                              >
                                <img src={url} alt="" className="w-full h-full object-cover" />
                              </a>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {!isEditing && canManage && (
                      <div className="flex items-center gap-3 mb-3">
                        <button
                          onClick={() => handleDeleteThread(t)}
                          className="text-[11px] text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> 删除主贴
                        </button>
                        <button
                          onClick={() => handleStartEdit(t)}
                          className="text-[11px] text-muted-foreground hover:text-accent inline-flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" /> 编辑
                        </button>
                        {isOwner && (
                          <button
                            onClick={() => handleTogglePin(t)}
                            className="text-[11px] text-muted-foreground hover:text-accent inline-flex items-center gap-1"
                          >
                            <Pin className="w-3 h-3" /> {t.pinned ? "取消置顶" : "置顶"}
                          </button>
                        )}
                      </div>
                    )}

                    <div className="space-y-2 mt-2">
                      {list.map((r) => {
                        const rp = profiles[r.user_id];
                        const target = r.reply_to_id ? list.find((x) => x.id === r.reply_to_id) : null;
                        return (
                          <motion.div
                            key={r.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-lg p-2.5 border border-glass-border/30 bg-background/50 flex gap-2.5"
                          >
                            <Avatar className="w-7 h-7 border border-primary/30 shrink-0">
                              <AvatarImage src={rp?.avatar_url || undefined} />
                              <AvatarFallback className="bg-secondary text-[10px]">
                                {rp?.display_name?.[0]?.toUpperCase() || <UserIcon className="w-3 h-3" />}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 text-[11px]">
                                <span className="font-semibold text-foreground/90">{nameOf(r.user_id)}</span>
                                <span className="text-muted-foreground">{formatTime(r.created_at)}</span>
                                {user && (
                                  <button
                                    onClick={() => setReplyTarget((prev) => ({ ...prev, [t.id]: r.id }))}
                                    className="text-accent hover:text-accent/80 inline-flex items-center gap-1 font-medium bg-accent/10 px-1.5 py-0.5 rounded-full border border-accent/30"
                                  >
                                    <ReplyIcon className="w-3 h-3" /> 回复
                                  </button>
                                )}
                                {(isOwner || user?.id === r.user_id) && (
                                  <button onClick={() => handleDeleteReply(r.id, t.id)} className="ml-auto text-muted-foreground hover:text-destructive">
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              {target && (
                                <div className="text-[10px] text-accent/70 mt-0.5">
                                  回复 {nameOf(target.user_id)}：{target.content.slice(0, 20)}
                                </div>
                              )}
                              <p className="text-sm text-foreground/85 mt-0.5 whitespace-pre-wrap break-words">{linkify(r.content)}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {user ? (
                      <div className="mt-3">
                        {currentTarget && (
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-accent/5 border border-accent/20 rounded-lg px-2 py-1 mb-1.5">
                            <span className="truncate">回复 {nameOf(currentTarget.user_id)}：{currentTarget.content.slice(0, 20)}</span>
                            <button onClick={() => setReplyTarget((prev) => ({ ...prev, [t.id]: null }))}>
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Input
                            value={replyInputs[t.id] || ""}
                            onChange={(e) => setReplyInputs((prev) => ({ ...prev, [t.id]: e.target.value.slice(0, MAX_REPLY) }))}
                            placeholder="纯文字回帖…"
                            maxLength={MAX_REPLY}
                            className="bg-transparent border-glass-border/50 h-9 text-sm"
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(t.id); } }}
                          />
                          <Button
                            size="sm"
                            disabled={replying === t.id || !(replyInputs[t.id] || "").trim()}
                            onClick={() => handleReply(t.id)}
                            className="bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30"
                          >
                            {replying === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 text-xs text-muted-foreground">请登录后回帖</div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnlockForum;