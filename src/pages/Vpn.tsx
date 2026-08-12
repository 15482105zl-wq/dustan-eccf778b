import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Gauge, Globe2, Layers, Send, Zap } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";

const SIGNUP_URL = "https://dustan.15482105zl.workers.dev";
const CHANNEL_URL = "https://t.me/dustan_hub";

const stats = [
  { icon: Globe2, value: "30+", label: "全球节点" },
  { icon: Gauge, value: "5Gbps", label: "单线带宽" },
  { icon: Layers, value: "1x", label: "节点倍率" },
];

const plans = [
  {
    name: "体验版",
    price: "¥9.9",
    unit: "/ 年",
    traffic: "100 GB / 月",
    features: ["全球 30+ 节点", "不限速 · 不限设备", "流媒体解锁"],
  },
  {
    name: "标准版",
    price: "¥24",
    unit: "/ 年",
    traffic: "300 GB / 月",
    features: ["全球 30+ 节点", "不限速 · 不限设备", "IPLC 专线优选", "优先客服支持"],
    featured: true,
  },
  {
    name: "尊享版",
    price: "¥68",
    unit: "/ 年",
    traffic: "1 TB / 月",
    features: ["全部节点 + 专线", "不限速 · 不限设备", "游戏加速优化", "7×24 专属支持"],
  },
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

const Vpn = () => {
  const navigate = useNavigate();
  const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="min-h-screen relative">
      <SEO
        title="VPN 专线 · 全球加速网络"
        description="30+ 全球节点、5Gbps 单线带宽、不限速不限设备的 VPN 专线加速服务。"
        path="/vpn"
        noindex
      />
      <ParticleBackground />

      <main className="relative z-10 px-5 pb-20 pt-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex items-center justify-between mb-14">
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
            className="mb-20"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-10 bg-accent/70" />
              <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
                Blazing fast · Worldwide
              </span>
            </div>
            <h1 className="font-heading text-5xl sm:text-7xl font-bold leading-[0.95] tracking-tight mb-8">
              <span className="text-foreground">VPN</span>
              <br />
              <span className="gradient-text glow-text">专线.</span>
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => open(SIGNUP_URL)}
                className="px-7 py-3 rounded-full bg-accent text-accent-foreground font-semibold text-sm shadow-[0_0_28px_hsl(var(--accent)/0.45)] animate-breathe-glow transition-transform hover:scale-[1.03] active:scale-95"
              >
                立即开通
              </button>
              <button
                onClick={() => open(CHANNEL_URL)}
                className="px-7 py-3 rounded-full border border-glass-border/60 text-foreground/80 font-semibold text-sm hover:border-primary/50 hover:text-primary transition-colors inline-flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> 加入频道
              </button>
            </div>
          </motion.section>

          {/* Stats */}
          <section className="grid grid-cols-3 gap-3 mb-20">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                className="glass rounded-xl border-glass-border/40 p-4 text-center"
              >
                <s.icon className="w-4 h-4 mx-auto mb-2 text-primary" />
                <p className="font-heading text-xl sm:text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </section>

          {/* Pricing */}
          <section className="mb-20">
            <h2 className="font-heading text-2xl font-bold mb-1">全部套餐</h2>
            <p className="text-sm text-muted-foreground mb-6">不限速 · 不限设备 · 随时续费</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {plans.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 * i }}
                  className={`glass rounded-2xl p-5 flex flex-col ${
                    p.featured
                      ? "border-accent/50 shadow-[0_0_26px_hsl(var(--accent)/0.3)]"
                      : "border-glass-border/40"
                  }`}
                >
                  <p className="text-xs text-muted-foreground mb-2">{p.name}</p>
                  <p className="font-heading text-3xl font-bold text-foreground">
                    {p.price}
                    <span className="text-sm font-normal text-muted-foreground ml-1">{p.unit}</span>
                  </p>
                  <p className="text-[11px] text-primary mt-1 mb-4">{p.traffic}</p>
                  <ul className="space-y-2 mb-5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Check className="w-3.5 h-3.5 mt-0.5 text-accent shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => open(SIGNUP_URL)}
                    className={`mt-auto w-full py-2.5 rounded-full text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-95 ${
                      p.featured
                        ? "bg-accent text-accent-foreground shadow-[0_0_20px_hsl(var(--accent)/0.4)]"
                        : "border border-glass-border/60 text-foreground/80 hover:text-primary hover:border-primary/50"
                    }`}
                  >
                    选择套餐
                  </button>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Nodes */}
          <section>
            <h2 className="font-heading text-2xl font-bold mb-1">节点列表</h2>
            <p className="text-sm text-muted-foreground mb-6">IPLC 专线与优选中转，实时可用</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {nodes.map((n, i) => (
                <motion.div
                  key={n}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.04 * i }}
                  className="glass rounded-xl border-glass-border/40 px-3 py-3 text-center"
                >
                  <Zap className="w-3.5 h-3.5 mx-auto mb-1.5 text-primary" />
                  <p className="text-[11px] text-foreground/85 leading-tight">{n}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Vpn;
