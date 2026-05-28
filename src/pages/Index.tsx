import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Globe, Shield, Zap, MessageCircle } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import ParticleBackground from "@/components/ParticleBackground";
import UserNav from "@/components/UserNav";
import AuthGateModal from "@/components/AuthGateModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const ACCEL_URL = "https://campsite.bio/dustan";
const FEEDBACK_URL = "https://qm.qq.com/q/KECVhxL7a2";

const resourceLinks = [
  { icon: Zap, label: "迅雷资源通道", color: "text-primary", url: "https://pan.xunlei.com/s/VOSYGLtZIWaCQejBOvXrruR8A1?pwd=bbia" },
  { icon: Download, label: "百度网盘通道", color: "text-primary", url: "https://pan.baidu.com/s/1nfoD2fSrMEnpLbbi2Q5ZyQ?pwd=dab7" },
  { icon: Globe, label: "夸克资源通道", color: "text-primary", url: "https://pan.quark.cn/s/29e2744b31f1" },
  { icon: Shield, label: "UC资源通道", color: "text-primary", url: "https://drive.uc.cn/s/b2243269454c4" },
];

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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
    window.open(ACCEL_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <div className="relative z-10 flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-2xl flex justify-end mb-4">
          <UserNav />
        </div>

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

        <div className="w-full max-w-2xl">
          <GlassCard
            delay={0.5}
            onClick={handleAccelClick}
            className="p-6 flex items-center justify-between animate-breathe-glow border-accent/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-heading font-bold text-foreground text-lg">全球网络加速</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user?.email_confirmed_at ? "点击访问 →" : "登录后访问 →"}
                </p>
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
          </GlassCard>
        </div>

        <motion.a
          href={FEEDBACK_URL}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          帮助与反馈
        </motion.a>
      </div>

      <AuthGateModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
};

export default Index;
