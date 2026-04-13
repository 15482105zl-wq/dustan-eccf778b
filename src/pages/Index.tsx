import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Globe, Shield, Zap } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import ParticleBackground from "@/components/ParticleBackground";
import CommentSection from "@/components/CommentSection";
import UserNav from "@/components/UserNav";

const resourceLinks = [
  { icon: Zap, label: "迅雷资源通道", color: "text-primary" },
  { icon: Download, label: "百度网盘通道", color: "text-primary" },
  { icon: Globe, label: "夸克资源通道", color: "text-primary" },
  { icon: Shield, label: "UC资源通道", color: "text-primary" },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <div className="relative z-10 flex flex-col items-center px-4 py-12">
        {/* User Nav */}
        <div className="w-full max-w-2xl flex justify-end mb-4">
          <UserNav />
        </div>
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3">
            <span className="gradient-text glow-text">资源导航站</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            精选优质资源 · 一键直达
          </p>
        </motion.div>

        {/* Resource grid */}
        <div className="w-full max-w-2xl grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          {resourceLinks.map((item, i) => (
            <GlassCard key={item.label} delay={i * 0.1} className="p-5 flex flex-col items-center gap-3">
              <item.icon className={`w-7 h-7 ${item.color}`} />
              <span className="text-sm font-medium text-foreground/90 text-center">{item.label}</span>
            </GlassCard>
          ))}
        </div>

        {/* Clash card */}
        <div className="w-full max-w-2xl">
          <GlassCard
            delay={0.5}
            onClick={() => navigate("/tools")}
            className="p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-heading font-semibold text-foreground">Clash V2pn 全能配置</p>
                <p className="text-xs text-muted-foreground mt-0.5">点击进入工具页 →</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </GlassCard>
        </div>

        {/* Comments */}
        <CommentSection />
      </div>
    </div>
  );
};

export default Index;
