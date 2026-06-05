import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare, Reply, Send, Trash2, User as UserIcon, X, Pencil, Check } from "lucide-react";

const ADMIN_EMAIL = "15482105zl@gmail.com";
import { motion, AnimatePresence } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Profile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
}

const PAGE_SIZE = 20;

const formatTime = (iso: string) => {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} 天前`;
  return d.toLocaleDateString("zh-CN");
};

const DAILY_LIMIT = 5;
const MAX_LEN = 60;

const startOfTodayISO = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const CommentSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [comments, setComments] = useState<Comment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const isAdmin = user?.email === ADMIN_EMAIL;
  const reachedLimit = dailyCount >= DAILY_LIMIT;

  const refreshDailyCount = useCallback(async () => {
    if (!user) {
      setDailyCount(0);
      return 0;
    }
    const { count } = await supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfTodayISO());
    const n = count ?? 0;
    setDailyCount(n);
    return n;
  }, [user]);

  useEffect(() => {
    refreshDailyCount();
  }, [refreshDailyCount]);

  const fetchProfilesFor = useCallback(async (userIds: string[]) => {
    const missing = Array.from(new Set(userIds)).filter((id) => !profiles[id]);
    if (missing.length === 0) return;
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

  const loadPage = useCallback(async (pageIndex: number) => {
    setLoading(true);
    try {
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("comments")
        .select("id, user_id, parent_id, content, created_at")
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      const rows = (data || []) as Comment[];
      setComments((prev) => {
        const seen = new Set(prev.map((c) => c.id));
        return [...prev, ...rows.filter((r) => !seen.has(r.id))];
      });
      setHasMore(rows.length === PAGE_SIZE);
      const ids = rows.map((r) => r.user_id);
      // include parent authors
      const parentIds = rows.map((r) => r.parent_id).filter(Boolean) as string[];
      if (parentIds.length) {
        const { data: parents } = await supabase
          .from("comments")
          .select("id, user_id")
          .in("id", parentIds);
        parents?.forEach((p) => ids.push(p.user_id));
      }
      await fetchProfilesFor(ids);
    } catch (e: any) {
      toast({ title: "加载留言失败", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [fetchProfilesFor, toast]);

  useEffect(() => {
    loadPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh own profile so newly fetched displayName is current
  useEffect(() => {
    if (user) fetchProfilesFor([user.id]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const parentMap = useMemo(() => {
    const m: Record<string, Comment> = {};
    for (const c of comments) m[c.id] = c;
    return m;
  }, [comments]);

  const nameOf = (uid: string) => profiles[uid]?.display_name || "匿名用户";

  const handleReply = (c: Comment) => {
    setReplyTo(c);
    const mention = `@${nameOf(c.user_id)} `;
    setInput((prev) => (prev.startsWith(mention) ? prev : mention));
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleCancelReply = () => {
    setReplyTo(null);
    setInput("");
  };

  const handlePost = async () => {
    if (!user) return;
    const content = input.trim();
    if (!content) return;
    if (content.length > MAX_LEN) {
      toast({ title: `留言过长（最多 ${MAX_LEN} 字）`, variant: "destructive" });
      return;
    }
    const current = await refreshDailyCount();
    if (current >= DAILY_LIMIT) {
      toast({ title: `今日留言次数已达上限 (${DAILY_LIMIT}/${DAILY_LIMIT})`, variant: "destructive" });
      return;
    }
    setPosting(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({ user_id: user.id, content, parent_id: replyTo?.id ?? null })
        .select("id, user_id, parent_id, content, created_at")
        .single();
      if (error) throw error;
      setComments((prev) => [data as Comment, ...prev]);
      setInput("");
      setReplyTo(null);
      setDailyCount((n) => n + 1);
      await fetchProfilesFor([user.id]);
    } catch (e: any) {
      toast({ title: "发送失败", description: e.message, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("确定删除此留言？");
    if (!ok) return;
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) {
      toast({ title: "删除失败", description: error.message, variant: "destructive" });
      return;
    }
    setComments((prev) => prev.filter((c) => c.id !== id && c.parent_id !== id));
  };

  const startEdit = (c: Comment) => {
    setEditingId(c.id);
    setEditingText(c.content);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };
  const saveEdit = async (id: string) => {
    const content = editingText.trim().slice(0, MAX_LEN);
    if (!content) return;
    const { error } = await supabase.from("comments").update({ content }).eq("id", id);
    if (error) {
      toast({ title: "编辑失败", description: error.message, variant: "destructive" });
      return;
    }
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, content } : c)));
    cancelEdit();
  };

  return (
    <section className="w-full max-w-2xl mx-auto mt-10">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-accent" />
        <h2 className="font-heading text-lg font-bold gradient-text">在线留言</h2>
        <span className="text-xs text-muted-foreground">· 已加载 {comments.length}</span>
      </div>

      {/* Input */}
      <div className="glass rounded-xl p-3 border border-glass-border/40 mb-6">
        {replyTo && (
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 px-1">
            <span>回复 <span className="text-accent">@{nameOf(replyTo.user_id)}</span></span>
            <button onClick={handleCancelReply} className="hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_LEN))}
          placeholder={user ? (reachedLimit ? `今日留言次数已达上限 (${DAILY_LIMIT}/${DAILY_LIMIT})` : "说点什么…（支持 @昵称 回复）") : "请先登录后留言"}
          disabled={!user || posting || reachedLimit}
          className="bg-transparent border-glass-border/50 min-h-[72px] resize-none text-sm"
          maxLength={MAX_LEN}
        />
        <div className="flex items-center justify-between mt-2 gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{input.length}/{MAX_LEN}</span>
            {user && (
              <span className={reachedLimit ? "text-destructive" : "text-accent/80"}>
                · 今日 {Math.min(dailyCount, DAILY_LIMIT)}/{DAILY_LIMIT}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handlePost}
            disabled={!user || posting || !input.trim() || reachedLimit}
            className="bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30 disabled:opacity-50"
          >
            {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {reachedLimit ? "已达上限" : "发送"}
          </Button>
        </div>
      </div>

      {/* List grouped by date (today expanded by default) */}
      <div className="space-y-3">
        {(() => {
          const groups = new Map<string, Comment[]>();
          for (const c of comments) {
            const key = new Date(c.created_at).toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-");
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(c);
          }
          const todayKey = new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-");
          const keys = Array.from(groups.keys());
          return (
            <Accordion type="multiple" defaultValue={[todayKey]} className="space-y-2">
              {keys.map((dateKey) => {
                const list = groups.get(dateKey)!;
                const isToday = dateKey === todayKey;
                return (
                  <AccordionItem key={dateKey} value={dateKey} className="glass rounded-xl border border-glass-border/40 overflow-hidden">
                    <AccordionTrigger className="px-4 py-2.5 hover:no-underline">
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`font-mono ${isToday ? "text-accent" : "text-foreground/80"}`}>{dateKey}</span>
                        {isToday && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">今日</span>}
                        <span className="text-xs text-muted-foreground">共 {list.length} 条留言</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3">
                      <div className="space-y-3">
                        <AnimatePresence initial={false}>
                          {list.map((c) => {
                            const p = profiles[c.user_id];
                            const parent = c.parent_id ? parentMap[c.parent_id] : null;
                            return (
                              <motion.div
                                key={c.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.2 }}
                                className="rounded-lg p-3 border border-glass-border/30 bg-background/30 hover:border-primary/30 transition-colors"
                              >
                                <div className="flex gap-3">
                                  <Avatar className="w-9 h-9 border border-primary/30 shrink-0">
                                    <AvatarImage src={p?.avatar_url || undefined} />
                                    <AvatarFallback className="bg-secondary text-xs">
                                      {p?.display_name?.[0]?.toUpperCase() || <UserIcon className="w-4 h-4" />}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-sm font-semibold text-foreground/90">{nameOf(c.user_id)}</span>
                                      <span className="text-[11px] text-muted-foreground">{formatTime(c.created_at)}</span>
                                    </div>
                                    {parent && (
                                      <div className="mt-1.5 text-xs text-muted-foreground border-l-2 border-accent/40 pl-2 py-0.5 bg-secondary/30 rounded-r">
                                        <span className="text-accent">@{nameOf(parent.user_id)}</span>: {parent.content.slice(0, 80)}
                                        {parent.content.length > 80 && "…"}
                                      </div>
                                    )}
                                    <p className="text-sm text-foreground/85 mt-1.5 whitespace-pre-wrap break-words">{c.content}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                      {user && (
                                        <button
                                          onClick={() => handleReply(c)}
                                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors"
                                        >
                                          <Reply className="w-3 h-3" /> 回复
                                        </button>
                                      )}
                                      {user?.id === c.user_id && (
                                        <button
                                          onClick={() => handleDelete(c.id)}
                                          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                          <Trash2 className="w-3 h-3" /> 删除
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          );
        })()}

        {comments.length === 0 && !loading && (
          <div className="text-center py-10 text-sm text-muted-foreground">
            还没有留言，来抢沙发吧 ✨
          </div>
        )}


        {hasMore && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => {
                const next = page + 1;
                setPage(next);
                loadPage(next);
              }}
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "加载更多"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CommentSection;
