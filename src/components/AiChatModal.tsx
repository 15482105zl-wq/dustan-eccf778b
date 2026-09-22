import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ParticleBackground from "@/components/ParticleBackground";
import { supabase } from "@/integrations/supabase/client";

const WORKER_URL = "https://qxtecefxbtcukpuizvzb.supabase.co/functions/v1/clever-service";
const AI_AVATAR_URL = "https://pxyfbbohoazbslneagix.supabase.co/storage/v1/object/public/avatars/d-avatar.png";
const SESSION_KEY = "dustan_ai_session";
const MAX_LENGTH = 500;
const POLL_INTERVAL = 5000;
const WELCOME_TEXT = "你好，我是 Dustan AI助手。
网络加速VPN、海外成品账号、海外应用与开源软件、国内解锁软件，有问题直接问我就行。\nhttps://dustan.lovable.app";

type Role = "user" | "ai" | "owner";
type ChatMessage = { id: number; role: Role; content: string; created_at: string };
type OwnerProfile = { display_name?: string | null; avatar_url?: string | null };
interface AiChatModalProps { open: boolean; onOpenChange: (open: boolean) => void; }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const URL_RE = /(https?:\/\/[^\s，。；、）)]+)/g;

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

// 把一段纯文字里的网址变成可点击的链接
const renderPlain = (text: string, keyPrefix: string) =>
  text.split(URL_RE).map((seg, i) =>
    /^https?:\/\//.test(seg) ? (
      <a key={`${keyPrefix}-${i}`} href={seg} target="_blank" rel="noopener noreferrer" className="underline text-primary break-all">
        {seg}
      </a>
    ) : (
      seg
    )
  );

// 行内：**加粗** 渲染成粗体，其余按普通文字（网址可点击）
const renderInline = (line: string) =>
  line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.length > 4 && part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold">
        {renderPlain(part.slice(2, -2), `b${i}`)}
      </strong>
    ) : (
      <span key={i}>{renderPlain(part, `p${i}`)}</span>
    )
  );

// AI 回复的排版：去掉标题符号和代码符号，列表显示成圆点条目，连续空行只保留一个
const formatAiText = (text: string) => {
  const prepared = text
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, "$1 $2")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^[ \t]*#{1,6}[ \t]*/gm, "");
  const nodes: JSX.Element[] = [];
  let prevBlank = true;
  prepared.split("\n").forEach((raw, i) => {
    const isBullet = /^[ \t]*[-*][ \t]+/.test(raw);
    const line = isBullet ? raw.replace(/^[ \t]*[-*][ \t]+/, "") : raw.trim();
    if (!line) {
      if (!prevBlank) nodes.push(<div key={i} className="h-2" />);
      prevBlank = true;
      return;
    }
    prevBlank = false;
    nodes.push(
      isBullet ? (
        <div key={i} className="flex gap-1.5 pl-2">
          <span className="shrink-0">·</span>
          <span className="min-w-0 [overflow-wrap:anywhere]">{renderInline(line)}</span>
        </div>
      ) : (
        <div key={i} className="[overflow-wrap:anywhere]">{renderInline(line)}</div>
      )
    );
  });
  return nodes;
};

const AiAvatar = () => (
  <Avatar className="w-8 h-8 shrink-0">
    <AvatarImage src={AI_AVATAR_URL} />
    <AvatarFallback className="text-xs bg-secondary">D</AvatarFallback>
  </Avatar>
);

const OwnerAvatar = ({ url, name }: { url?: string | null; name: string }) => (
  <Avatar className="w-8 h-8 shrink-0">
    {url && <AvatarImage src={url} />}
    <AvatarFallback className="text-xs bg-primary/20 text-primary">{name.slice(0, 1)}</AvatarFallback>
  </Avatar>
);

const AiChatModal = ({ open, onOpenChange }: AiChatModalProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [owner, setOwner] = useState<OwnerProfile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef(0);
  const sendingRef = useRef(false);
  const sessionRef = useRef("");
  const sending = pending !== null;
  const ownerName = owner?.display_name || "站长";

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

  // 每次打开对话时，取一次站长账号当前的昵称和头像
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const { data } = await (supabase as any).rpc("get_site_owner_profile");
        if (data) setOwner(data as OwnerProfile);
      } catch {
        // 取不到就用默认的“站长”
      }
    })();
  }, [open]);
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-background/80 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.2 }} className="w-full h-full relative flex flex-col overflow-hidden bg-background">
            <ParticleBackground />
            <div className="relative z-10 flex items-center justify-between px-4 py-4 border-b border-border/40 bg-secondary/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"><MessageCircle className="w-4 h-4" /></div>
                <div><h3 className="font-semibold text-sm">Dustan AI助手</h3><p className="text-xs text-muted-foreground">有问题直接问我</p></div>
              </div>
              <button onClick={() => onOpenChange(false)} className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <div ref={scrollRef} className="relative z-10 flex-1 min-w-0 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-4">
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-center gap-2 px-1">
                  <AiAvatar />
                  <span className="text-xs text-muted-foreground">D助手</span>
                </div>
                <div className="w-full min-w-0 rounded-2xl rounded-tl-none px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] border bg-secondary/60 border-border/40 text-foreground">{renderPlain(WELCOME_TEXT, "welcome")}</div>
              </div>

              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end min-w-0 pr-1">
                    <div className="max-w-[85%] min-w-0 rounded-2xl rounded-tr-none px-3.5 py-2 text-sm whitespace-pre-wrap [overflow-wrap:anywhere] bg-primary text-primary-foreground">{m.content}</div>
                  </div>
                ) : (
                  <div key={m.id} className="flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2 px-1">
                      {m.role === "owner" ? <OwnerAvatar url={owner?.avatar_url} name={ownerName} /> : <AiAvatar />}
                      <span className="text-xs text-muted-foreground">{m.role === "owner" ? ownerName : "D助手"}</span>
                      <span className="text-[10px] text-muted-foreground/60">{formatTime(m.created_at)}</span>
                    </div>
                    <div className={`w-full min-w-0 rounded-2xl rounded-tl-none px-4 py-3 text-sm leading-relaxed border text-foreground space-y-1 [overflow-wrap:anywhere] ${m.role === "owner" ? "bg-primary/15 border-primary/40" : "bg-secondary/60 border-border/40"}`}>{formatAiText(m.content)}</div>
                  </div>
                )
              )}

              {pending !== null && (
                <>
                  <div className="flex justify-end min-w-0 pr-1">
                    <div className="max-w-[85%] min-w-0 rounded-2xl rounded-tr-none px-3.5 py-2 text-sm whitespace-pre-wrap [overflow-wrap:anywhere] bg-primary text-primary-foreground">{pending}</div>
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <AiAvatar />
                    <span className="text-xs text-muted-foreground animate-pulse">D助手 正在思考…</span>
                  </div>
                </>
              )}

              {notice && <div className="text-center text-xs text-muted-foreground">{notice}</div>}
            </div>

            <div className="relative z-10 px-2 pt-3 border-t border-border/40 bg-secondary/10" style={{ paddingBottom: "calc(3rem + env(safe-area-inset-bottom))" }}>
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