import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Download, Globe, Shield, Zap, MessageCircle, Rocket } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import ParticleBackground from "@/components/ParticleBackground";
import UserNav from "@/components/UserNav";
import AuthGateModal from "@/components/AuthGateModal";
import SEO from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const FEEDBACK_URL = "https://qm.qq.com/q/KECVhxL7a2";

const resourceLinks = [
  { icon: Zap, label: "迅雷网盘", color: "text-primary", url: "https://pan.xunlei.com/s/VOSYGLtZIWaCQejBOvXrruR8A1?pwd=bbia" },
  { icon: Download, label: "百度网盘", color: "text-primary", url: "https://pan.baidu.com/s/1-XjPDoYVf48odKNe_VW8Yw?pwd=1p44" },
  { icon: Globe, label: "夸克网盘", color: "text-primary", url: "https://pan.quark.cn/s/29e2744b31f1" },
  { icon: Shield, label: "UC网盘", color: "text-primary", url: "https://drive.uc.cn/s/b2243269454c4" },
];

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);

  const handleAccelClick = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (!user.email_confirmed_at) {
      toast({ title: "请先验证邮箱", description: "请前往邮箱点击验证链接后再访问", variant: "destructive" });
      return;
    }
    navigate("/vip");
  };

  return (
    <div className="min-h-screen relative">
      <SEO
        title="资源导航站 · 网盘直达与全球加速"
        description="精选百度网盘、迅雷、夸克、UC 优质资源一键直达，并提供全球网络加速与 Clash 全能配置资源。"
        path="/"
      />
      <ParticleBackground />
      <main className="relative z-10 flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-2xl flex justify-end mb-4">
          <UserNav />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3">
            <span className="gradient-text glow-text">Dustan Hub</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            AI工具 · 软件资源 · 实用服务 · 精选分享
          </p>
        </motion.div>

        <h2 className="sr-only">资源通道</h2>
        <div className="w-full max-w-2xl grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          {resourceLinks.map((item, i) => (
            <GlassCard
              key={item.label}
              delay={i * 0.1}
              onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
              className="p-5 flex flex-col items-center gap-3"
            >
              <item.icon className={`w-7 h-7 ${item.color}`} />
              <span className="text-sm font-medium text-foreground/90 text-center">{item.label}</span>
            </GlassCard>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-1 mb-10">
          一个资源库 · 多种下载方式
        </p>

        <h2 className="sr-only">增值服务</h2>
        <div className="w-full max-w-2xl">
          <GlassCard
            delay={0.5}
            onClick={handleAccelClick}
            className="p-6 flex items-center justify-between animate-breathe-glow border-accent/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <Globe className="w-7 h-7 text-accent" />
              </div>
              <div>
                <p className="font-heading font-bold text-foreground text-xl">Global Services</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  全球数字服务入口
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
              <div className="w-9 h-9 rounded-full bg-accent/15 border border-accent/40 flex items-center justify-center">
                <Rocket className="w-4 h-4 text-accent" />
              </div>
            </div>
          </GlassCard>
        </div>

        <motion.a
          href={FEEDBACK_URL}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 flex items-center gap-1.5 text-sm text-foreground/70 hover:text-primary transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          帮助与反馈
        </motion.a>
      </main>

      <AuthGateModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
};

export default Index;
