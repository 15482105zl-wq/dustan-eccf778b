import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Apple, Globe, Lock, Rocket, Send } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import UserNav from "@/components/UserNav";
import VipResourceCard from "@/components/VipResourceCard";
import CommentSection from "@/components/CommentSection";
import UnlockForum from "@/components/UnlockForum";
import { useAuth } from "@/hooks/useAuth";

const Vip = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [forumOpen, setForumOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !user.email_confirmed_at)) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) return null;

  const primary = [
    {
      icon: Zap,
      title: "V2PN⚡专线",
      description: "高速专线 · 首选",
      url: "https://dustan.zwaaa.app/#/register?code=R4Xx2MlV",
      highlight: true,
      singleLine: true,
    },
    {
      icon: Globe,
      title: "Clash 节点",
      description: "每日免费节点",
      url: "https://pan.xunlei.com/s/VOnGAtlOEyZgFgT8dYpo67d1A1?pwd=45tq#",
      highlight: true,
      singleLine: true,
    },
  ];

  const secondary = [
    {
      icon: Apple,
      title: "苹果美区ID",
      description: "Apple独享ID",
      url: "https://docs.qq.com/doc/DRnR1Y25LY3NJbnNp",
      singleLine: true,
    },
    {
      icon: Lock,
      title: "Unlock",
      description: "纯文字社区",
      onClick: () => setForumOpen(true),
      singleLine: true,
    },
    {
      icon: Send,
      title: "TG 群组",
      description: "官方社群",
      url: "https://t.me/+yourgroup",
      singleLine: true,
    },
  ];

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

        <div className="w-full max-w-2xl grid grid-cols-6 gap-3 auto-rows-fr">
          {primary.map((c, i) => (
            <div key={c.title} className="col-span-3">
              <VipResourceCard {...c} delay={i * 0.06} />
            </div>
          ))}
          {secondary.map((c, i) => (
            <div key={c.title} className="col-span-2">
              <VipResourceCard {...c} delay={(i + 2) * 0.06} />
            </div>
          ))}
        </div>

        <div className="w-full max-w-2xl">
          <CommentSection />
        </div>
      </div>

      <UnlockForum open={forumOpen} onOpenChange={setForumOpen} />
    </div>
  );
};

export default Vip;
