import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Satellite, Leaf, Check, Copy, Ticket } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";

const STARLINK_URL = "https://4.xn--mes995ajya725k.com/#/register?code=PcjcmSQZ";
const LVCHA_URL = "https://tgj.lvcha.me/?id=509041885";

const Accelerate = () => {
  const navigate = useNavigate();
  const [target, setTarget] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(3);
  const [copied, setCopied] = useState(false);
  const [couponCopied, setCouponCopied] = useState(false);
  const [preloading, setPreloading] = useState(false);
  const preloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (preloadTimerRef.current) clearTimeout(preloadTimerRef.current);
    };
  }, []);

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

  const start = (url: string, preload = false) => {
    if (preloadTimerRef.current) clearTimeout(preloadTimerRef.current);
    setCopied(false);
    if (preload) {
      setPreloading(true);
      preloadTimerRef.current = setTimeout(() => {
        setPreloading(false);
        setSeconds(3);
        setCouponCopied(false);
        setTarget(url);
      }, 1800);
      return;
    }
    setSeconds(3);
    setCouponCopied(false);
    setTarget(url);
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
        <div className="w-full max-w-4xl flex items-center justify-between mb-6">
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

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 星链机场 */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="glass rounded-2xl p-6 flex flex-col border-accent/30"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                <Satellite className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">星链机场</h2>
                <p className="text-[11px] text-muted-foreground">自建高端节点 | 不受限制 | 全球直连加速</p>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground flex-1">
              自建机房，独享高端节点，速度和稳定性有保障。多平台账号运营、4K高清剧集流畅观看都不在话下，全程军事级加密保护隐私安全。
            </p>

            <button
              onClick={async () => {
                await copyText("rXRW4708");
                setCouponCopied(true);
              }}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary transition-colors hover:bg-primary/15"
            >
              <Ticket className="w-3.5 h-3.5" />
              {couponCopied ? "已复制优惠券 rXRW4708" : "优惠券：rXRW4708（8.9折）"}
            </button>

            <button
              onClick={() => start(STARLINK_URL, true)}
              className="mt-3 w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-[0_0_24px_hsl(var(--accent)/0.45)] transition-transform hover:scale-[1.02]"
            >
              立即注册
            </button>
          </motion.div>

          {/* 绿茶VPN */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="glass rounded-2xl p-6 flex flex-col border-primary/30"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">绿茶VPN</h2>
                <p className="text-[11px] text-muted-foreground">永久免费 · 无广告 · 全自研</p>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground flex-1">
              主打一个“零门槛”——永久免费，不收费不弹广告。连接速度快，全球节点覆盖广，日常刷剧、玩游戏都能应付，适合不想折腾的轻度用户。
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
              <p className="mx-auto mb-6 max-w-[16rem] rounded-lg border border-glass-border/40 px-3 py-2 text-[11px] text-primary">
                正在为你跳转
              </p>

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
