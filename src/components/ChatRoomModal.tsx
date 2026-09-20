import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, MessageCircle, Bot } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ParticleBackground from "@/components/ParticleBackground";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

type ChatMessage = { id: string; content: string; user_id: string; created_at: string; sender_name?: string; sender_avatar?: string | null };
type Profile = { display_name?: string | null; avatar_url?: string | null };
interface ChatRoomModalProps { open: boolean; onOpenChange: (open: boolean) => void; targetMessageId?: string | null; }

const MAX_LENGTH = 500;

const ChatRoomModal = ({ open, onOpenChange, targetMessageId }: ChatRoomModalProps) => {
  const { isAdmin } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, Profile>>({});
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const user: SupabaseUser | null = session?.user ?? null;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfiles = useCallback(async (userIds: string[]) => {
    const missing = userIds.filter((id) => !profileMap[id]);
    if (missing.length === 0) return;
    const { data } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", missing);
    if (data) {
      setProfileMap((prev) => {
        const next = { ...prev };
        data.forEach((p: any) => { next[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url }; });
        return next;
      });
    }
  }, [profileMap]);

  const loadMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("id, content, user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("load messages error:", error);
      return;
    }

    const list = ((data || []) as ChatMessage[]).reverse();
    setMessages(list);
    const ids = Array.from(new Set(list.map((m) => m.user_id)));
    fetchProfiles(ids);
  }, [fetchProfiles]);

  useEffect(() => {
    if (!open) return;
    loadMessages();
    const ch = supabase.channel("chat-room-comments").on("postgres_changes", { event: "INSERT", schema: "public", table: "comments" }, (payload) => {
      const raw = payload.new as ChatMessage;
      setMessages((prev) => (prev.some((m) => m.id === raw.id) ? prev : [...prev, raw]));
      fetchProfiles([raw.user_id]);
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [open, loadMessages, fetchProfiles]);

  useEffect(() => {
    if (!targetMessageId && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, targetMessageId]);

  useEffect(() => {
    if (!open || !targetMessageId || messages.length === 0) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`msg-${targetMessageId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedId(targetMessageId);
        const clear = setTimeout(() => setHighlightedId(null), 3000);
        return () => clearTimeout(clear);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [open, targetMessageId, messages]);

  const handleAtUser = (name?: string | null) => {
    if (!name) return;
    setInput((prev) => { const t = prev.trim(); return t ? `${t} @${name} ` : `@${name} `; });
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !user || sending || trimmed.length > MAX_LENGTH) return;
    setSending(true);
    const { error } = await supabase.from("comments").insert({ content: trimmed, user_id: user.id });
    setSending(false);
    if (!error) setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl h-[85vh] flex flex-col rounded-2xl border border-glass-border/60 bg-background/90 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <ParticleBackground />
            </div>
            <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-border/40 bg-secondary/20">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm text-foreground">Dustan AI助手</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">点 @D助手 直接提问 · 大家一起聊</span>
              </div>
              <button onClick={() => onOpenChange(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs space-y-1">
                  <span>暂无消息</span>
                  <span>快来发表第一条消息吧</span>
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = user && m.user_id === user.id;
                  const profile = profileMap[m.user_id];
                  const displayName = profile?.display_name || m.sender_name || (isMine ? "我" : "用户");
                  const avatarUrl = profile?.avatar_url || m.sender_avatar;
                  const isHighlighted = highlightedId === m.id;
                  return (
                    <div
                      key={m.id}
                      id={`msg-${m.id}`}
                      className={`w-full flex flex-col gap-1.5 p-3 rounded-xl border transition-all duration-300 ${
                        isHighlighted
                          ? "bg-primary/20 ring-2 ring-primary border-primary"
                          : isMine
                          ? "bg-primary/10 border-primary/25"
                          : "bg-secondary/30 border-border/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Avatar className="w-6 h-6 cursor-pointer shrink-0" onClick={() => !isMine && handleAtUser(displayName)}>
                          {avatarUrl ? <AvatarImage src={avatarUrl} /> : null}
                          <AvatarFallback className="text-[10px]">{displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span
                          className={`text-xs font-semibold ${isMine ? "text-primary" : "text-foreground/90"} ${!isMine ? "cursor-pointer hover:underline" : ""}`}
                          onClick={() => !isMine && handleAtUser(displayName)}
                        >
                          {displayName}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 ml-auto">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="w-full text-sm text-foreground leading-relaxed break-words whitespace-pre-wrap pl-1">
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="relative z-10 p-3 border-t border-border/40 bg-secondary/10 flex flex-col gap-2" style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}>
              <div className="flex items-center gap-2 px-1">
                <button type="button" onClick={() => handleAtUser("D助手")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/15 text-blue-500 border border-blue-500/30 hover:bg-blue-500/25 transition-colors">
                  <Bot className="w-4 h-4" /><span>@D助手</span>
                </button>
                {isAdmin && (
                  <button type="button" onClick={() => handleAtUser("所有人")} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-500 border border-amber-500/30 hover:bg-amber-500/25 transition-colors">
                    <span>@所有人</span>
                  </button>
                )}
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={user ? "问点什么，或点上面的 @D助手 直接提问... (Enter 发送)" : "请先登录后参与聊天"} disabled={!user || sending} maxLength={MAX_LENGTH} rows={3} className="w-full resize-none rounded-xl bg-background/80 border border-border/50 px-4 pt-3 pb-6 text-base focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
                  <div className="absolute right-3 bottom-2 text-xs text-muted-foreground/60">{input.length}/{MAX_LENGTH}</div>
                </div>
                <button onClick={handleSend} disabled={!user || !input.trim() || sending || input.length > MAX_LENGTH} className="h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 hover:bg-primary/90 transition-colors shrink-0">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChatRoomModal;
