import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ParticleBackground from "@/components/ParticleBackground";

const WORKER_URL = "https://tg-dustan.15482105zl.workers.dev";
const AI_AVATAR_URL = "https://pxyfbbohoazbslneagix.supabase.co/storage/v1/object/public/avatars//d-avatar.png";
const OWNER_AVATAR_URL = "https://pxyfbbohoazbslneagix.supabase.co/storage/v1/object/public/avatars/6ee6e82b-c990-4373-aa98-84f6b46baf52/avatar.png";
const SESSION_KEY = "dustan_ai_session";
const MAX_LENGTH = 500;
const POLL_INTERVAL = 5000;
const WELCOME_TEXT = "你好，我是 Dustan AI助手。网络加速、苹果账号、软件资源、使用上的问题，直接问我就行。";

type Role = "user" | "ai" | "owner";
type ChatMessage = { id: number; role: Role; content: string; created_at: string };
interface AiChatModalProps { open: boolean; onOpenChange: (open: boolean) => void; }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let memorySession: string | null = null;

function fallbackUuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getSessionId(): string {
  if (memorySession) return memorySession;
  let id: string | null = null;
  try {
    id = localStorage.getItem(SESSION_KEY);
  } catch {
    // 部分内置浏览器不允许读取本地存储，忽略
  }
  if (!id || !UUID_RE.test(id)) {
    id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : fallbackUuid();
    try {
      localStorage.setItem(SESSION_KEY, id);
    } catch {
      // 存不了就只在本次打开期间有效
    }
  }
  memorySession = id;
  return id;
}

const formatTime = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const AiAvatar = () => (
  <Avatar className="w-8 h-8 shrink-0">
    <AvatarImage src={AI_AVATAR_URL} />
    <AvatarFallback className="text-xs bg-secondary">D</AvatarFallback>
  </Avatar>
);

const OwnerAvatar = () => (
  <Avatar className="w-8 h-8 shrink-0">
    <AvatarImage src={OWNER_AVATAR_URL} />
    <AvatarFallback className="text-xs bg-primary/20 text-primary">站</AvatarFallback>
  </Avatar>
);

const AiChatModal = ({ open, onOpenChange }: AiChatModalProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef(0);
  const sendingRef = useRef(false);
  const sessionRef = useRef("");
  const sending = pending !== null;

  const fetchNew = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return;
    try {
      const res = await fetch(`${WORKER_URL}/poll?session=${session}&after=${lastIdRef.current}`);
      if (!res.ok) return;
      const data = await res.json();
      const incoming: ChatMessage[] = data.messages || [];
      if (incoming.length === 0) return;
      lastIdRef.current = Math.max(lastIdRef.current, ...incoming.map((m) => m.id));
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const fresh = incoming.filter((m) => !seen.has(m.id));
        return fresh.length ? [...prev, ...fresh] : prev;
      });
    } catch {
      // 网络波动，下一轮再试
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    sessionRef.current = getSessionId();
    fetchNew();
    const timer = setInterval(() => {
      if (sendingRef.current || document.hidden) return;
      fetchNew();
    }, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [open, fetchNew]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, pending, notice, open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sendingRef.current) return;
    sendingRef.current = true;
    setPending(text);
    setInput("");
    setNotice(null);
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "chat", session: sessionRef.current, content: text }),
      });
      if (!res.ok) {
        setNotice(res.status === 503 ? "AI 现在有点忙，稍后再试一下。" : "发送失败，请重试。");
      }
    } catch {
      setInput(text);
      setNotice("网络不太稳，消息没发出去，请重试。");
    } finally {
      // 先取回服务器上的消息，再收起“发送中”的气泡，避免重复显示
      await fetchNew();
      sendingRef.current = false;
      setPending(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.2 }} className="w-full h-full relative flex flex-col overflow-hidden bg-background">
            <ParticleBackground />
            <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-border/40 bg-secondary/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><MessageCircle className="w-4 h-4" /></div>
                <div><h3 className="font-semibold text-sm">Dustan AI助手</h3><p className="text-xs text-muted-foreground">有问题直接问我</p></div>
              </div>
              <button onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4">
              <div className="flex items-start gap-2.5">
                <AiAvatar />
                <div className="flex flex-col max-w-[75%] items-start">
                  <div className="flex items-center gap-1.5 mb-1 px-1"><span className="text-xs text-muted-foreground">D助手</span></div>
                  <div className="rounded-2xl rounded-tl-none px-3.5 py-2 text-sm whitespace-pre-wrap break-words border bg-secondary/60 border-border/40 text-foreground">{WELCOME_TEXT}</div>
                </div>
              </div>

              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[75%] rounded-2xl rounded-tr-none px-3.5 py-2 text-sm whitespace-pre-wrap break-words bg-primary text-primary-foreground">{m.content}</div>
                  </div>
                ) : (
                  <div key={m.id} className="flex items-start gap-2.5">
                    {m.role === "owner" ? <OwnerAvatar /> : <AiAvatar />}
                    <div className="flex flex-col max-w-[75%] items-start">
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-xs text-muted-foreground">{m.role === "owner" ? "站长" : "D助手"}</span>
                        <span className="text-[10px] text-muted-foreground/60">{formatTime(m.created_at)}</span>
                      </div>
                      <div className={`rounded-2xl rounded-tl-none px-3.5 py-2 text-sm whitespace-pre-wrap break-words border text-foreground ${m.role === "owner" ? "bg-primary/15 border-primary/40" : "bg-secondary/60 border-border/40"}`}>{m.content}</div>
                    </div>
                  </div>
                )
              )}

              {pending !== null && (
                <>
                  <div className="flex justify-end">
                    <div className="max-w-[75%] rounded-2xl rounded-tr-none px-3.5 py-2 text-sm whitespace-pre-wrap break-words bg-primary text-primary-foreground">{pending}</div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <AiAvatar />
                    <div className="rounded-2xl rounded-tl-none px-3.5 py-2 text-sm border bg-secondary/60 border-border/40 text-muted-foreground animate-pulse">正在思考…</div>
                  </div>
                </>
              )}

              {notice && <div className="text-center text-xs text-muted-foreground">{notice}</div>}
            </div>

            <div className="relative z-10 p-3 border-t border-border/40 bg-secondary/10" style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}>
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="问点什么... (Enter 发送)" disabled={sending} maxLength={MAX_LENGTH} rows={3} className="w-full resize-none rounded-xl bg-background/80 border border-border/50 px-4 pt-3 pb-6 text-base focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
                  <div className="absolute right-3 bottom-2 text-xs text-muted-foreground/60">{input.length}/{MAX_LENGTH}</div>
                </div>
                <button onClick={handleSend} disabled={!input.trim() || sending} className="h-12 px-5 rounded-xl bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 hover:bg-primary/90 transition-colors shrink-0">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AiChatModal;
