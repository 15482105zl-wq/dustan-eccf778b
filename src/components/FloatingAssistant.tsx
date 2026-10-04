import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AiChatModal from "@/components/AiChatModal";
import AiIcon from "@/components/AiIcon";

// 全站悬浮 AI 助手：挂在 App 路由外面，所有页面右下角常驻。
// 点开的是同一个 AiChatModal、同一个会话（localStorage dustan_ai_session），
// 和副页里直接点的 AI 助手效果完全一致，换页面聊天不中断。
// 按钮：渐变底色 + 半透明磨砂，卡片同款 D 图标（深色 D）。
const FloatingAssistant = () => {
  const [open, setOpen] = useState(false);

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
            style={{ right: "1rem", bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
          >
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/70 via-indigo-500/70 to-fuchsia-500/70 shadow-lg shadow-indigo-500/30 ring-1 ring-white/30 backdrop-blur-md animate-breathe-glow-strong">
              <AiIcon className="h-6 w-6" dFill="#0c1424" />
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
