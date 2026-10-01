import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AiChatModal from "@/components/AiChatModal";

// 全站悬浮 D助手：完全透明晶透底座 + 定制青紫科技流光「D·智能光核」图标。
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
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setOpen(true)}
            aria-label="打开 D助手"
            className="fixed z-40 outline-none group"
            style={{ right: "1.25rem", bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
          >
            <div className="relative flex h-13 w-13 items-center justify-center rounded-full bg-black/15 hover:bg-black/30 backdrop-blur-md border border-white/15 hover:border-cyan-400/50 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_28px_rgba(34,211,238,0.55)] transition-all duration-300">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 blur-sm opacity-60 group-hover:opacity-100 transition-opacity" />

              <svg
                viewBox="0 0 48 48"
                className="relative z-10 h-7 w-7 transition-transform duration-300 group-hover:rotate-6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="d-assist-grad" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                  <linearGradient id="d-pulse-grad" x1="18" y1="18" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>

                <circle
                  cx="24"
                  cy="24"
                  r="21"
                  stroke="url(#d-assist-grad)"
                  strokeWidth="1.2"
                  strokeDasharray="3 4"
                  opacity="0.35"
                />

                <path
                  d="M37 9L38.2 12.8L42 14L38.2 15.2L37 19L35.8 15.2L32 14L35.8 12.8Z"
                  fill="#22d3ee"
                  className="animate-pulse"
                />
                <circle cx="11" cy="35" r="1.5" fill="#c084fc" opacity="0.8" />

                <path
                  d="M17 12C17 11.4477 17.4477 11 18 11H26C33.1797 11 39 16.8203 39 24C39 31.1797 33.1797 37 26 37H18C17.4477 37 17 36.5523 17 36V12Z"
                  stroke="url(#d-assist-grad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M23 17H26C29.866 17 33 20.134 33 24C33 27.866 29.866 31 26 31H23V17Z"
                  fill="url(#d-pulse-grad)"
                  opacity="0.25"
                />

                <circle cx="23" cy="24" r="2.5" fill="#22d3ee" />
              </svg>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
      <AiChatModal open={open} onOpenChange={setOpen} />
    </>
  );
};

export default FloatingAssistant;
