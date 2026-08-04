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
import { Loader2, Lock, Plus, Send, Trash2, User as UserIcon, X } from "lucide-react";
import { motion } from "framer-motion";


const MAX_TITLE = 60;
const MAX_BODY = 500;
const MAX_REPLY = 200;

interface Thread {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}
interface Reply {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  created_at: string;
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
  const [posting, setPosting] = useState(false);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [replying, setReplying] = useState<string | null>(null);

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

  useEffect(() => {
    if (open) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const nameOf = (uid: string) => profiles[uid]?.display_name || "匿名用户";

  const handlePostThread = async () => {
    if (!user) return;
    if (!isAdmin) {
      toast({ title: "无权发布", description: "仅站长账号可发布主贴", variant: "destructive" });
      return;
    }
    const t = title.trim().slice(0, MAX_TITLE);
    const c = body.trim().slice(0, MAX_BODY);
    if (!t || !c) return;
    setPosting(true);
    try {
      const payload = { user_id: user.id, title: t, content: c };
      const { data, error } = await supabase
        .from("forum_threads")
        .insert(payload)
        .select("id, user_id, title, content, created_at")
        .single();
      if (error) throw error;
      if (data) setThreads((prev) => [data as Thread, ...prev]);
      await fetchProfiles([user.id]);
      setTitle("");
      setBody("");
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
        .insert({ thread_id: threadId, user_id: user.id, content: content.slice(0, MAX_REPLY) })
        .select("*")
        .single();
      if (error) throw error;
      setReplies((prev) => ({ ...prev, [threadId]: [...(prev[threadId] || []), data as Reply] }));
      setReplyInputs((prev) => ({ ...prev, [threadId]: "" }));
      await fetchProfiles([user.id]);
    } catch (e: any) {
      toast({ title: "回帖失败", description: e.message, variant: "destructive" });
    } finally {
      setReplying(null);
    }
  };

  const handleDeleteThread = async (id: string) => {
    if (!window.confirm("确定删除此主贴及其所有回帖？")) return;
    const { error } = await supabase.from("forum_threads").delete().eq("id", id);
    if (error) return toast({ title: "删除失败", description: error.message, variant: "destructive" });
    setThreads((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDeleteReply = async (rid: string, tid: string) => {
    const { error } = await supabase.from("forum_replies").delete().eq("id", rid);
    if (error) return toast({ title: "删除失败", description: error.message, variant: "destructive" });
    setReplies((prev) => ({ ...prev, [tid]: (prev[tid] || []).filter((r) => r.id !== rid) }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl glass border-accent/40 shadow-[0_0_40px_hsl(var(--accent)/0.35)] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <Lock className="w-5 h-5 text-accent" />
            <span className="gradient-text">BBS · 纯文字论坛</span>
          </DialogTitle>
        </DialogHeader>

        {isOwner && (
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
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{body.length}/{MAX_BODY}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => { setComposeOpen(false); setTitle(""); setBody(""); }}>
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
                        <div className="font-heading font-semibold text-foreground text-sm break-words">{t.title}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {nameOf(t.user_id)} · {formatTime(t.created_at)} · {list.length} 回帖
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="text-sm text-foreground/85 whitespace-pre-wrap break-words mb-3 border-l-2 border-accent/40 pl-3">
                      {t.content}
                    </p>
                    {isOwner && (
                      <button
                        onClick={() => handleDeleteThread(t.id)}
                        className="text-[11px] text-muted-foreground hover:text-destructive inline-flex items-center gap-1 mb-3"
                      >
                        <Trash2 className="w-3 h-3" /> 删除主贴
                      </button>
                    )}

                    <div className="space-y-2 mt-2">
                      {list.map((r) => {
                        const rp = profiles[r.user_id];
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
                                {(isOwner || user?.id === r.user_id) && (
                                  <button onClick={() => handleDeleteReply(r.id, t.id)} className="ml-auto text-muted-foreground hover:text-destructive">
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-foreground/85 mt-0.5 whitespace-pre-wrap break-words">{r.content}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {user ? (
                      <div className="mt-3 flex gap-2">
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
