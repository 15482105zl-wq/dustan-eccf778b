import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
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
}

const MAX_LENGTH = 200;

const ChatRoomModal = ({ open, onOpenChange }: ChatRoomModalProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, Profile>>({});
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const fetchProfiles = useCallback(async (userIds: string[]) => {
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
          next[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url };
        });
        return next;
      });
    }
  }, [profileMap]);

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
        { event: "INSERT", schema: "public", table: "comments" },
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    if (!error) {
      setInput("");
    } else {
      console.error("send message error:", error);
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
          className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md flex flex-col"
        >
          {/* 顶部栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <span className="font-heading font-semibold text-foreground">在线聊天室</span>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 消息流 */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-10">
                还没有消息，来说第一句话吧 ✨
              </div>
            ) : (
              messages.map((m) => {
                const isMine = m.user_id === user?.id;
                const profile = profileMap[m.user_id];
                const name = profile?.display_name || "用户";
                const avatarUrl = profile?.avatar_url || undefined;

                return (
                  <div
                    key={m.id}
                    className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <Avatar className="w-8 h-8 border border-border flex-shrink-0">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="bg-secondary text-xs">
                        {name?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col max-w-[70%] ${isMine ? "items-end" : "items-start"}`}>
                      {!isMine && (
                        <span className="text-[11px] text-muted-foreground mb-0.5 px-1">{name}</span>
                      )}
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm break-words whitespace-pre-wrap ${
                          isMine
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-secondary text-foreground rounded-bl-sm"
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                        {new Date(m.created_at).toLocaleTimeString("zh-CN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 底部输入条 */}
          <div className="border-t border-border p-3 flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, MAX_LENGTH))}
              onKeyDown={handleKeyDown}
              placeholder="说点什么…"
              rows={1}
              className="flex-1 resize-none rounded-xl bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary max-h-24"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="rounded-full bg-primary text-primary-foreground p-2.5 disabled:opacity-40 transition-opacity"
              aria-label="发送"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-right px-3 pb-2 text-[10px] text-muted-foreground">
            {input.length}/{MAX_LENGTH}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatRoomModal;