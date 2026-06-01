import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Download, Apple, Globe, Search, Send, Rocket } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import UserNav from "@/components/UserNav";
import VipResourceCard from "@/components/VipResourceCard";
import CommentSection from "@/components/CommentSection";
import { useAuth } from "@/hooks/useAuth";

const resources = [
  {
    icon: Zap,
    title: "⚡V2pn专线 · 全球加速⚡",
    description: "高速专线 · 推荐首选",
    url: "https://dustan.zwaaa.app/#/register?code=R4Xx2MlV",
    highlight: true,
  },
  {
    icon: Download,
    title: "FlClash开源梯子",
    description: "开源客户端 · 迅雷下载",
    url: "https://pan.xunlei.com/s/VOtIOK6rxYbj6SC8zzHL70cAA1?pwd=s62d#",
    code: "s62d",
  },
  {
    icon: Apple,
    title: "IOS（独享美区ID）",
    description: "腾讯文档共享",
    url: "https://docs.qq.com/doc/DRnR1Y25LY3NJbnNp",
  },
  {
    icon: Globe,
    title: "Clash公共免费节点",
    description: "免费节点订阅",
    url: "https://pan.xunlei.com/s/VOnGAtlOEyZgFgT8dYpo67d1A1?pwd=45tq#",
    code: "45tq",
  },
  {
    icon: Search,
    title: "IP环境查询",
    description: "ping0.cc · 检测IP纯净度",
    url: "https://ping0.cc",
  },
  {
    icon: Send,
    title: "TG 群组",
    description: "Telegram 官方社群",
    url: "https://t.me/bydustan",
  },
];

const Vip = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !user.email_confirmed_at)) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <div className="relative z-10 flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-2xl flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/")}
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/40 text-xs text-accent mb-3">
            <Rocket className="w-3 h-3" /> VIP 加速通道
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
            <span className="gradient-text glow-text">全球网络加速</span>
          </h1>
          <p className="text-muted-foreground text-sm">精选高速通道 · 自由畅游全球</p>
        </motion.div>

        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
          {resources.map((r, i) => (
            <VipResourceCard key={r.title} {...r} delay={i * 0.06} />
          ))}
        </div>

        <CommentSection />
      </div>
    </div>
  );
};

export default Vip;
