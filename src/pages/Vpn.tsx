import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Copy, Send, Zap } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";

const SIGNUP_URL = "https://kitty.fo/register?invite=110BKHP4";
const CHANNEL_URL = "https://t.me/bydustan";

const stats = [
  { value: "30+", label: "全球节点" },
  { value: "5Gbps", label: "单线带宽" },
  { value: "1x", label: "节点倍率" },
  { value: "¥24", label: "/ 年" },
];

const nodes = [
  "香港 · IPLC",
  "台湾 · HiNet",
  "日本 · 东京",
  "新加坡 · 樟宜",
  "美国 · 洛杉矶",
  "韩国 · 首尔",
  "英国 · 伦敦",
  "德国 · 法兰克福",
];

const plans = [
  { name: "体验版", price: "¥9.9", unit: "/ 年", traffic: "100 GB / 月" },
  { name: "标准版", price: "¥24", unit: "/ 年", traffic: "300 GB / 月", featured: true },
  { name: "尊享版", price: "¥68", unit: "/ 年", traffic: "1 TB / 月" },
];

const Vpn = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"plans" | "nodes">("plans");
  const [counting, setCounting] = useState(false);
  const [seconds, setSeconds] = useState(5);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!counting) return;
    if (seconds <= 0) {
      window.location.href = SIGNUP_URL;
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [counting, seconds]);

  const startCountdown = () => {
    setSeconds(5);
    setCopied(false);
    setCounting(true);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(SIGNUP_URL);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = SIGNUP_URL;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
  };

  return (
    <div className="min-h-screen relative">
      <SEO
        title="Dustan Network · 全球加速专线"
        description="30+ 全球节点、5Gbps 单线带宽、不限速不限设备数的加速专线服务。"
        path="/vpn"
        noindex
      />
      <ParticleBackground />

      <main className="relative z-10 px-5 pb-20 pt-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex items-center justify-between mb-16">
            <button
              onClick={() => navigate("/vip")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> 返回
            </button>
            <UserNav />
          </div>

          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-10 bg-primary/70" />
              <span className="text-xs tracking-[0.25em] text-muted-foreground">极速 · 全球直连</span>
            </div>
            <h1 className="font-heading text-5xl sm:text-7xl font-bold leading-[0.95] tracking-tight mb-8">
              <span className="text-foreground">Dustan</span>
              <br />
              <span className="gradient-text glow-text">Network.</span>
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={startCountdown}
                className="px-7 py-3 rounded-full bg-accent text-accent-foreground font-semibold text-sm shadow-[0_0_28px_hsl(var(--accent)/0.45)] animate-breathe-glow transition-transform hover:scale-[1.03] active:scale-95 inline-flex items-center gap-2"
              >
                立即开通 <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.open(CHANNEL_URL, "_blank", "noopener,noreferrer")}
                className="px-7 py-3 rounded-full border border-glass-border/60 text-foreground/80 font-semibold text-sm hover:border-primary/50 hover:text-primary transition-colors inline-flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> 加入频道
              </button>
            </div>
          </motion.section>

          {/* Stats */}
          <section className="grid grid-cols-2 gap-3 mb-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                className="glass rounded-2xl border-glass-border/40 py-8 text-center"
              >
                <p className="font-heading text-3xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{s.label}</p>
              </motion.div>
            ))}
          </section>
          <p className="text-sm text-muted-foreground tracking-wide mb-10">不限速 · 不限设备数</p>

          {/* 套餐与节点 */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="glass rounded-2xl p-6 border-accent/40 animate-breathe-glow"
          >
            <h2 className="font-heading text-2xl font-bold mb-3">套餐与节点</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              覆盖香港、日本、新加坡、美国等地区优质线路，流媒体解锁，随时切换。
            </p>
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setTab("plans")}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  tab === "plans"
                    ? "bg-primary/15 text-primary border border-primary/40"
                    : "border border-glass-border/60 text-foreground/75"
                }`}
              >
                查看套餐
              </button>
              <button
                onClick={() => setTab("nodes")}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  tab === "nodes"
                    ? "bg-primary/15 text-primary border border-primary/40"
                    : "border border-glass-border/60 text-foreground/75"
                }`}
              >
                节点列表
              </button>
            </div>

            {tab === "plans" ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {plans.map((p) => (
                  <div
                    key={p.name}
                    className={`rounded-xl p-4 border ${
                      p.featured
                        ? "border-accent/50 shadow-[0_0_22px_hsl(var(--accent)/0.28)]"
                        : "border-glass-border/40"
                    }`}
                  >
                    <p className="text-xs text-muted-foreground mb-1">{p.name}</p>
                    <p className="font-heading text-2xl font-bold text-foreground">
                      {p.price}
                      <span className="text-xs font-normal text-muted-foreground ml-1">{p.unit}</span>
                    </p>
                    <p className="text-[11px] text-primary mt-1 mb-3">{p.traffic}</p>
                    <button
                      onClick={startCountdown}
                      className="w-full py-2 rounded-full text-xs font-semibold border border-glass-border/60 text-foreground/80 hover:text-primary hover:border-primary/50 transition-colors"
                    >
                      选择套餐
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {nodes.map((n) => (
                  <div key={n} className="rounded-xl border border-glass-border/40 px-3 py-3 text-center">
                    <Zap className="w-3.5 h-3.5 mx-auto mb-1.5 text-primary" />
                    <p className="text-[11px] text-foreground/85 leading-tight">{n}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        </div>
      </main>

      {/* 倒计时覆盖层 */}
      <AnimatePresence>
        {counting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-xl px-6"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass rounded-2xl border-accent/40 p-8 w-full max-w-sm text-center animate-breathe-glow"
            >
              <p className="text-xs tracking-[0.2em] text-muted-foreground mb-4">正在跳转</p>
              <p className="font-heading text-6xl font-bold gradient-text glow-text mb-4">{seconds}</p>
              <p className="text-xs text-muted-foreground mb-2">秒后自动打开注册页</p>
              <p className="text-[11px] text-primary break-all mb-6">{SIGNUP_URL}</p>
              <button
                onClick={copyLink}
                className={`w-full py-3 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors ${
                  copied
                    ? "bg-primary/15 text-primary border border-primary/50"
                    : "bg-accent text-accent-foreground shadow-[0_0_20px_hsl(var(--accent)/0.4)]"
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
                onClick={() => setCounting(false)}
                className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                取消
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Vpn;
