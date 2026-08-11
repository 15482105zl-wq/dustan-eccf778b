import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";

const PANEL_URL = "https://dustan.15482105zl.workers.dev";
const CHANNEL_URL = "https://t.me/dustanhub";

const stats = [
  { value: "30+", label: "全球节点" },
  { value: "5Gbps", label: "单线带宽" },
  { value: "1x", label: "节点倍率" },
  { value: "¥24", label: "/ 年" },
];

const Vpn = () => {
  const navigate = useNavigate();

  const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

  return (
    <div className="min-h-screen relative">
      <SEO
        title="VPN 专线 · 全球高速网络"
        description="30+ 全球节点、5Gbps 单线带宽、不限速不限设备的高速网络专线。"
        path="/vpn"
        noindex
      />
      <ParticleBackground />

      <main className="relative z-10 flex flex-col items-center px-5 py-8">
        <div className="w-full max-w-3xl flex items-center justify-between mb-14">
          <button
            onClick={() => navigate("/vip")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <UserNav />
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-10 bg-primary/70" />
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
              极速 · 全球直连
            </span>
          </div>

          <h1 className="font-heading font-bold leading-[0.95] text-5xl sm:text-7xl mb-8">
            <span className="block text-foreground">Dustan</span>
            <span className="block gradient-text glow-text">Network.</span>
          </h1>

          <div className="flex flex-wrap gap-3 mb-14">
            <button
              onClick={() => navigate("/invite")}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold bg-accent text-accent-foreground shadow-[0_0_28px_hsl(var(--accent)/0.45)] hover:shadow-[0_0_40px_hsl(var(--accent)/0.6)] transition-shadow"

            >
              立即开通 <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => open(CHANNEL_URL)}
              className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold glass glass-hover text-foreground"
            >
              <Send className="w-4 h-4" /> 加入频道
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
                className="glass rounded-xl px-4 py-5 text-center"
              >
                <p className="font-heading text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mb-10">不限速 · 不限设备数</p>

          <div className="glass rounded-2xl p-6 border-accent/40 animate-breathe-glow">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-2">套餐与节点</h2>
            <p className="text-sm text-muted-foreground mb-5">
              覆盖香港、日本、新加坡、美国等地区优质线路，流媒体解锁，随时切换。
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => open(`${PANEL_URL}/#/plan`)}
                className="rounded-full px-5 py-2.5 text-sm font-medium bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
              >
                查看套餐
              </button>
              <button
                onClick={() => open(`${PANEL_URL}/#/node`)}
                className="rounded-full px-5 py-2.5 text-sm font-medium glass glass-hover text-foreground"
              >
                节点列表
              </button>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default Vpn;
