import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, MessageCircle, Bot } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ParticleBackground from "@/components/ParticleBackground";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

type ChatMessage = {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string | null;
};

type Profile = {
  display_name?: string | null;
  avatar_url?: string | null;
};

interface ChatRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetMessageId?: string | null;
}

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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfiles = useCallback(
    async (userIds: string[]) => {
      const missing = userIds.filter((id) => !profileMap[id]);

      if (missing.length === 0) return;

      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", missing);

      if (data) {
        setProfileMap((prev) => {
          const next = { ...prev };

          data.forEach((p: any) => {
            next[p.user_id] = {
              display_name: p.display_name,
              avatar_url: p.avatar_url,
            };
          });

          return next;
        });
      }
    },
    [profileMap]
  );

  const loadMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("id, content, user_id, created_at")
      .order("created_at", { ascending: true })
      .limit(200);

    if (error) {
      console.error("load messages error:", error);
      return;
    }

    const list = (data || []) as ChatMessage[];

    setMessages(list);

    const ids = Array.from(new Set(list.map((m) => m.user_id)));

    fetchProfiles(ids);
  }, [fetchProfiles]);

  useEffect(() => {
    if (!open) return;

    loadMessages();

    const channel = supabase
      .channel("chat-room-comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
        },
        (payload) => {
          const raw = payload.new as ChatMessage;

          setMessages((prev) => {
            if (prev.some((m) => m.id === raw.id)) return prev;
            return [...prev, raw];
          });

          fetchProfiles([raw.user_id]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, loadMessages, fetchProfiles]);

  // 正常接收新消息时滚动到底部（仅当未指定定位目标时）
  useEffect(() => {
    if (!targetMessageId && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, targetMessageId]);

  // 当带有 targetMessageId 打开聊天室时，自动定位并高亮对应消息
  useEffect(() => {
    if (!open || !targetMessageId || messages.length === 0) return;

    const timer = setTimeout(() => {
      const el = document.getElementById(`msg-${targetMessageId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedId(targetMessageId);
        const clearTimer = setTimeout(() => {
          setHighlightedId(null);
        }, 3000);
        return () => clearTimeout(clearTimer);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [open, targetMessageId, messages]);

  const handleAtUser = (name?: string | null) => {
    if (!name) return;

    setInput((prev) => {
      const trimmed = prev.trim();

      return trimmed ? `${trimmed} @${name} ` : `@${name} `;
    });

    inputRef.current?.focus();
  };

  const handleSend = async () => {
    const trimmed = input.trim();

    if (!trimmed || !user || sending) return;

    if (trimmed.length > MAX_LENGTH) return;

    setSending(true);

    const { error } = await supabase.from("comments").insert({
      content: trimmed,
      user_id: user.id,
    });

    setSending(false);

    if (error) {
      console.error("send comment error:", error);
    } else {
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full relative flex flex-col overflow-hidden bg-background"
          >
            <ParticleBackground />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-border/40 bg-secondary/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">在线聊天室</h3>
                  <p className="text-xs text-muted-foreground">实时互动 · 大家一起聊</p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message List */}
            <div
              ref={scrollRef}
              className="relative z-10 flex-1
className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-500 border border-blue-500/30 hover:bg-blue-500/25 transition-colors"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>@D助手</span>
                </button>

                {/* 仅管理员可见的 @所有人 快捷按钮 */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleAtUser("所有人")}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-500 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
                  >
                    <span>@所有人</span>
                  </button>
                )}
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={user ? "发条消息吧... (Enter 发送)" : "请先登录后参与聊天"}
                    disabled={!user || sending}
                    maxLength={MAX_LENGTH}
                    rows={2}
                    className="w-full resize-none rounded-xl bg-background/80 border border-border/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                  />
                  <div className="absolute right-2 bottom-1.5 text-[10px] text-muted-foreground/60">
                    {input.length}/{MAX_LENGTH}
                  </div>
                </div>

                <button
                  onClick={handleSend}
                  disabled={!user || !input.trim() || sending || input.length > MAX_LENGTH}
                  className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 hover:bg-primary/90 transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatRoomModal;