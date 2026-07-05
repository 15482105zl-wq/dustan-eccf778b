import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, Wrench, Apple, Wifi, ArrowLeft } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";

const tools = [
  { icon: Globe, label: "全球加速", desc: "高速稳定的全球网络加速" },
  { icon: Wrench, label: "开源工具", desc: "精选开源工具合集" },
  { icon: Apple, label: "美区ID", desc: "Apple美区账号资源" },
  { icon: Wifi, label: "每日免费节点", desc: "每日更新免费可用节点" },
];

const Tools = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <SEO
        title="工具与配置 · Clash 与 V2pn 资源"
        description="Clash / V2pn 全球加速节点、开源工具合集、Apple 美区 ID 与每日免费节点资源。"
        path="/tools"
      />
      <ParticleBackground />
      <main className="relative z-10 flex flex-col items-center px-4 py-12">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="self-start mb-8 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3">
            <span className="gradient-text glow-text">工具 & 配置</span>
          </h1>
          <p className="text-muted-foreground text-sm">Clash · V2pn · 节点资源</p>
        </motion.div>

        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((item, i) => (
            <GlassCard key={item.label} delay={i * 0.12} className="p-6 flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-heading font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tools;
