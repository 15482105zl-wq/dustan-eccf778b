import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Cat, Leaf, Zap, Check, Copy } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";

const KITTY_URL = "https://kitty.fo/register?invite=110BKHP4";
const LVCHA_URL = "https://176.lvchavpn.me?id=509041885";
const JISU_URL = "https://dalichuqiji.mmmoyou.com/#/register?code=iabWIfKj";

const Accelerate = () => {
  const navigate = useNavigate();
  const [target, setTarget] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(3);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!target) return;
    if (seconds <= 0) {
      window.open(target, "_blank");
      setTarget(null);
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [target, seconds]);

  const start = (url: string) => {
    setCopied(false);
    setSeconds(3);
    setTarget(url);
  };

  const jumpNow = () => {
    if (!target) return;
    window.open(target, "_blank");
    setTarget(null);
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  return (
    <div className="min-h-screen relative">
      <SEO title="网络加速" description="" path="/accelerate" noindex />
      <ParticleBackground />
      <main className="relative z-10 flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-5xl flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/vip")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <UserNav />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
            <span className="gradient-text glow-text">网络加速</span>
          </h1>
          <p className="text-muted-foreground text-sm">免费专线 · 全球直连</p>
        </motion.div>

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Kitty Network */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="glass rounded-2xl p-6 flex flex-col border-accent/30"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                <Cat className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">Kitty Network</h2>
                <p className="text-[11px] text-muted-foreground">多地区节点 · 解锁流媒体AI</p>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground flex-1">
              覆盖美、日、新、韩、港、德、英、荷等主流地区节点，完美解锁流媒体和主流AI平台。不限速、不限在线设备数量，自研高性能内核，无日志记录，用起来更放心。
            </p>

            <div className="mt-4 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-center text-xs text-primary">
              低至 2元/月 · 全年仅 24元
            </div>

            <button
              onClick={() => start(KITTY_URL)}
              className="mt-3 w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-[0_0_24px_hsl(var(--accent)/0.45)] transition-transform hover:scale-[1.02]"
            >
              立即注册
            </button>
          </motion.div>

          {/* 极速网络 */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="glass rounded-2xl p-6 flex flex-col border-yellow-500/30"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-yellow-500/15 text-yellow-500 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">极速网络</h2>
                <p className="text-[11px] text-muted-foreground">畅享18元包年 · 防失联备用</p>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground flex-1">
              稳定顺畅、不失联、低延迟，Amazon 5Gbps 全球网络支持。全平台专属客户端，无倍率套路，不限设备不限速，AI、Netflix 等流媒体全部解锁。
            </p>

            <div className="mt-4 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-center text-xs text-yellow-500">
              畅享18元包年 · 优惠码 duobao88
            </div>

            <button
              onClick={() => start(JISU_URL)}
              className="mt-3 w-full rounded-full bg-yellow-500 py-3 text-sm font-semibold text-black shadow-[0_0_24px_rgba(234,179,8,0.45)] transition-transform hover:scale-[1.02]"
            >
              立即注册
            </button>
          </motion.div>

          {/* 绿叶机场 */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="glass rounded-2xl p-6 flex flex-col border-primary/30"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">绿叶机场</h2>
                <p className="text-[11px] text-muted-foreground">永久免费 · 无广告 · 全自研</p>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground flex-1">
              主打一个"零门槛"——永久免费，不收费不弹广告。连接速度快，全球节点覆盖广，日常刷剧、玩游戏都能应付，适合不想折腾的轻度用户。
            </p>

            <button
              onClick={() => start(LVCHA_URL)}
              className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.45)] transition-transform hover:scale-[1.02]"
            >
              免费下载
            </button>
          </motion.div>
        </div>

        <footer className="mt-12 mb-4 text-center text-xs text-muted-foreground">
          © 2020 - 2026 Dustan Hub · 用心运营每一天 · All Rights Reserved.
        </footer>
      </main>

      {/* 倒计时覆盖层 */}
      <AnimatePresence>
        {target && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-2xl px-6"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="glass relative w-full max-w-sm overflow-hidden rounded-3xl border-accent/40 p-8 text-center animate-breathe-glow"
            >
              <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl" />

              <p className="relative text-[11px] tracking-[0.35em] text-muted-foreground mb-6">
                安全通道建立中
              </p>

              <div className="relative mx-auto mb-6 h-36 w-36">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="44" fill="none" strokeWidth="4" className="stroke-glass-border/40" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="stroke-accent"
                    strokeDasharray={2 * Math.PI * 44}
                    animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - seconds / 3) }}
                    transition={{ duration: 1, ease: "linear" }}
                    style={{ filter: "drop-shadow(0 0 8px hsl(var(--accent) / 0.8))" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={seconds}
                      initial={{ opacity: 0, scale: 1.4, filter: "blur(6px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.35 }}
                      className="font-heading text-5xl font-bold gradient-text glow-text"
                    >
                      {seconds}
                    </motion.span>
                  </AnimatePresence>
                  <span className="mt-1 text-[10px] tracking-[0.2em] text-muted-foreground">SECONDS</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-2">即将为你打开页面</p>

              <button
                onClick={jumpNow}
                className="mx-auto mb-6 block w-full max-w-[16rem] rounded-lg border border-glass-border/40 px-3 py-2 text-[11px] text-primary transition-colors hover:bg-primary/10"
              >
                立即跳转 →
              </button>

              <button
                onClick={async () => {
                  await copyText(target);
                  setCopied(true);
                }}
                className={`w-full py-3 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all ${
                  copied
                    ? "bg-primary/15 text-primary border border-primary/50"
                    : "bg-accent text-accent-foreground shadow-[0_0_24px_hsl(var(--accent)/0.45)] hover:scale-[1.02]"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> ✅ 已复制，请在浏览器中打开
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> 复制链接，浏览器打开
                  </>
                )}
              </button>
              <button
                onClick={() => setTarget(null)}
                className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                取消跳转
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accelerate;