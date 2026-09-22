import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Download, Globe, Shield, Zap, Rocket, Share2, Check } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import ParticleBackground from "@/components/ParticleBackground";
import UserNav from "@/components/UserNav";
import SEO from "@/components/SEO";

const resourceLinks = [
  { icon: Zap, label: "迅雷网盘", color: "text-primary", url: "https://pan.xunlei.com/s/VOSYGLtZIWaCQejBOvXrruR8A1?pwd=bbia" },
  { icon: Download, label: "百度网盘", color: "text-primary", url: "https://pan.baidu.com/s/1-XjPDoYVf48odKNe_VW8Yw?pwd=1p44" },
  { icon: Globe, label: "夸克网盘", color: "text-primary", url: "https://pan.quark.cn/s/29e2744b31f1" },
  { icon: Shield, label: "UC网盘", color: "text-primary", url: "https://drive.uc.cn/s/b2243269454c4" },
];
const APP_DOWNLOAD_URL = "https://pxyfbbohoazbslneagix.supabase.co/storage/v1/object/public/downloads/DustanHub.apk";
const Index = () => {
  const navigate = useNavigate();
  const [shared, setShared] = useState(false);

  const handleAccelClick = () => {
    navigate("/vip");
  };

  const handleShare = async () => {
    const shareData = {
      title: "Dustan Hub · 数字站",
      text: "AI工具 · 软件资源 · 实用服务 · 精选分享",
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // 用户取消分享，忽略
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = shareData.url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    }
  };

  return (
    <div className="min-h-screen relative">
      <SEO
        title="Dustan Hub · 数字站"
        description=""
        path="/"
      />
      <ParticleBackground />
      <main className="relative z-10 flex flex-col items-center px-4 py-12">
        <div className="w-full max-w-2xl flex items-center justify-between mb-4">
          <motion.img
            src="/logo.png"
            alt="Dustan Hub"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/30 shadow-lg shadow-primary/20"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-accent/15 border border-accent/40 text-accent text-xs transition-transform hover:scale-105"
              aria-label="分享"
            >
              {shared ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {shared ? "已复制" : "分享"}
            </button>
            <UserNav />
          </div>
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
        <p className="text-center text-xs text-muted-foreground mb-4">
          一个资源库 · 多种下载方式
        </p>
        <div className="w-full max-w-2xl grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          {resourceLinks.map((item, i) => (
            <GlassCard
              key={item.label}
              delay={i * 0.1}
              onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
              className="!bg-transparent !backdrop-blur-none !shadow-none p-5 flex flex-col items-center gap-3"
            >
              <item.icon className={`w-7 h-7 ${item.color}`} />
              <span className="text-sm font-medium text-foreground/90 text-center">{item.label}</span>
            </GlassCard>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mb-6">
          网络加速 · 海外账号 · 会员专属
        </p>

        <h2 className="sr-only">增值服务</h2>
        <div className="w-full max-w-2xl">
          <GlassCard
            delay={0.5}
            onClick={handleAccelClick}
            className="!bg-transparent !backdrop-blur-none p-6 flex items-center justify-between animate-breathe-glow border-accent/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
                <Globe className="w-7 h-7 text-accent" />
              </div>
              <div>
                <p className="font-heading font-bold text-foreground text-xl sm:text-2xl leading-tight">
                  全球数字服务入口
                </p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Global Services
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
          href={APP_DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="mt-10 text-sm font-bold animate-app-link"
          style={{ color: "#a855f7" }}
        >
          📲 下载 Dustan Hub App
        </motion.a>
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 mb-2 text-center text-xs text-muted-foreground"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          © 2020 - 2026 Dustan Hub · 用心运营每一天
          <br />
          All Rights Reserved.
        </motion.footer>
      </main>
    </div>
  );
};

export default Index;