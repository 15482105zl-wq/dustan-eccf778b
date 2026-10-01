import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AiChatModal from "@/components/AiChatModal";
import AiIcon from "@/components/AiIcon";

// 全站悬浮 AI 助手：挂在 App 路由外面，所有页面右下角常驻。
// 点开的是同一个 AiChatModal、同一个会话（localStorage dustan_ai_session），
// 和副页里直接点的 AI 助手效果完全一致，换页面聊天不中断。
// 按钮用白色实心圆 + 品牌渐变 D 标，在深色背景上对比最明显。
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
            style={{ right: "1rem", bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
          >
            <span className="relative flex w-14 h-14 rounded-full items-center justify-center bg-white ring-2 ring-white/90 shadow-[0_0_28px_rgba(109,123,255,0.55)]">
              <AiIcon className="relative w-8 h-8" />
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
