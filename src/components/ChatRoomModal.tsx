import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, MessageCircle, Bot } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
}

const MAX_LENGTH = 500;

const ChatRoomModal = ({ open, onOpenChange }: ChatRoomModalProps) => {
  const { isAdmin } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, Profile>>({});
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

    if (!error) {
      setInput("");
    } else {
      console.error("send message error:", error);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full bg-card flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-secondary/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MessageCircle className="w-4 h-4" />
                </div>

                <div>
                  <h3 className="font-semibold text-foreground text-base">
                    在线聊天室
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    实时互动 · 大家一起聊
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message List */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  暂无消息，来发第一条吧~
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = user && m.user_id === user.id;
                  const profile = profileMap[m.user_id];
                  const name = profile?.display_name || "用户";
                  const avatar = profile?.avatar_url;

                  return (
                    <div
                      key={m.id}
                      className={`flex gap-2.5 max-w-[85%] ${
                        isMine
                          ? "ml-auto flex-row-reverse"
                          : "mr-auto"
                      }`}
                    >
                      <Avatar
                        className={`w-8 h-8 flex-shrink-0 cursor-pointer ${
                          !isMine
                            ? "hover:opacity-80 ring-1 ring-border"
                            : ""
                        }`}
                        onClick={
                          !isMine
                            ? () => handleAtUser(name)
                            : undefined
                        }
                      >
                        {avatar && (
                          <AvatarImage src={avatar} alt={name} />
                        )}

                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {name.slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className={`flex flex-col ${
                          isMine
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        <span
                          className={`text-[11px] text-muted-foreground mb-1 px-1 cursor-pointer ${
                            !isMine
                              ? "hover:text-primary transition-colors"
                              : ""
                          }`}
                          onClick={
                            !isMine
                              ? () => handleAtUser(name)
                              : undefined
                          }
                        >
                          {name}
                        </span>

                        <div
                          className={`px-3.5 py-2 rounded-2xl text-sm break-words whitespace-pre-wrap leading-relaxed shadow-sm ${
                            isMine
                              ? "bg-primary text-primary-foreground rounded-tr-sm"
                              : "bg-secondary/80 text-foreground rounded-tl-sm border border-border/40"
                          }`}
                        >
                          {m.content}
                        </div>

                        <span className="text-[10px] text-muted-foreground/60 mt-1 px-1">
                          {new Date(
                            m.created_at
                          ).toLocaleTimeString([], {
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

            {/* Input Bar */}
            <div className="p-3 border-t border-border/40 bg-secondary/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1">
                {/* 所有人可见的蓝色 AI助手 快捷按钮 */}
                <button
                  type="button"
                  onClick={() => handleAtUser("AI助手")}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 hover:border-blue-500/50 transition-all active:scale-95 shadow-sm"
                >
                  <Bot className="w-3.5 h-3.5 text-blue-400" />
                  <span>@AI助手</span>
                </button>

                {/* 管理员专用的 @所有人 快捷按钮 */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleAtUser("所有人")}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] text-primary hover:bg-primary/10 transition-colors"
                  >
                    [@所有人]
                  </button>
                )}
              </div>

              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    user
                      ? "说点什么…"
                      : "登录后即可参与聊天"
                  }
                  disabled={!user || sending}
                  maxLength={MAX_LENGTH}
                  rows={2}
                  className="flex-1 resize-none rounded-xl bg-secondary/50 border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary max-h-24"
                />

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={
                    !user ||
                    !input.trim() ||
                    sending
                  }
                  className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-end px-1">
                <span className="text-[10px] text-muted-foreground">
                  {input.length}/{MAX_LENGTH}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ChatRoomModal;