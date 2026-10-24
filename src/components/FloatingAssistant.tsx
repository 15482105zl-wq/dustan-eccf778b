import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import AiChatModal from "@/components/AiChatModal";

// 全站悬浮 AI 助手：挂在 App 路由外面，所有页面右侧居中常驻。
// 点开的是同一个 AiChatModal、同一个会话（localStorage dustan_ai_session），
// 和副页里直接点的 AI 助手效果完全一致，换页面聊天不中断。
// 按钮：渐变底色 + 半透明磨砂，白色聊天气泡图标。
// 未读红点：窗口关着时每 20 秒轻量轮询一次，发现 D助手/站长的新回复就亮红点，点开消失。
// 已读进度由 AiChatModal 在窗口打开时写入 localStorage（dustan_ai_seen_id），两边共用。
const WORKER_URL = "https://qxtecefxbtcukpuizvzb.supabase.co/functions/v1/clever-service";
const SESSION_KEY = "dustan_ai_session";
const SEEN_KEY = "dustan_ai_seen_id";
const BG_POLL_INTERVAL = 20000;

const FloatingAssistant = () => {
  const [open, setOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // 打开窗口，红点消失
  useEffect(() => {
    if (open) setHasUnread(false);
  }, [open ]);

  // 窗口关着时轮询新回复（仅限已有会话的用户；页面切后台时跳过）
  useEffect(() => {
    if (open) return;
    let stopped = false;
    const check = async () => {
      if (document.hidden) return;
      let session: string | null = null;
      let seenRaw: string | null = null;
      try {
        session = localStorage.getItem(SESSION_KEY);
        seenRaw = localStorage.getItem(SEEN_KEY);
      } catch {
        // 内置浏览器读不了本地存储就放弃轮询
        return;
      }
      if (!session) return;
      try {
        // 第一次没有已读记录时，先把现存消息的最大 id 记为已读基线，不亮红点
        const after = seenRaw === null ? 0 : Number(seenRaw) || 0;
        const res = await fetch(`${WORKER_URL}/poll?session=${session}&after=${after}`);
        if (!res.ok) return;
        const data = await res.json();
        const incoming: { id: number; role: string }[] = data.messages || [];
        if (stopped || incoming.length === 0) return;
        if (seenRaw === null) {
          try {
            localStorage.setItem(SEEN_KEY, String(Math.max(...incoming.map((m) => m.id))));
          } catch {
            // 存不了就下一轮再试
          }
          return;
        }
        if (incoming.some((m) => m.role !== "user")) setHasUnread(true);
      } catch {
        // 网络波动，下一轮再试
      }
    };
    void check();
    const timer = setInterval(check, BG_POLL_INTERVAL);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [open ]);

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(true)}
            aria-label="打开 D助手"
            className="fixed z-40 flex flex-col items-center gap-1 outline-none"
            style={{ right: "0.25rem", top: "50%", y: "-50%" }}
          >
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/70 via-indigo-500/70 to-fuchsia-500/70 shadow-lg shadow-indigo-500/30 ring-1 ring-white/30 backdrop-blur-md animate-breathe-glow-strong">
              <MessageCircle className="h-6 w-6 text-white" strokeWidth={2.2} />
              {hasUnread && (
                <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-rose-500 ring-2 ring-background" />
              )}
            </span>
            <span className="text-[11px] font-medium text-foreground/80 bg-background/70 backdrop-blur px-2 py-0.5 rounded-full border border-border/40">
              D助手
            </span>
          </motion.button>
        )}
      </AnimatePresence>
      <AiChatModal open={open} onOpenChange={setOpen} />
    </>
  );
};

export default FloatingAssistant;
