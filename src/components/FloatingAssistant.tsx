import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AiChatModal from "@/components/AiChatModal";
import AiIcon from "@/components/AiIcon";

// 全站悬浮 AI 助手：挂在 App 路由外面，所有页面右下角常驻。
// 点开的是同一个 AiChatModal、同一个会话（localStorage dustan_ai_session），
// 和副页里直接点的 AI 助手效果完全一致，换页面聊天不中断。
// 图标用副页 AI 客服卡片左边那颗 AiIcon（渐变气泡 D 标），白色圆底衬托。
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
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_0_24px_rgba(109,123,255,0.5)] ring-2 ring-white/90">
              <AiIcon className="h-8 w-8" />
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
