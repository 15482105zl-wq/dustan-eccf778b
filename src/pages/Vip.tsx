import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Apple, Globe, Lock, Rocket, Send, type LucideIcon } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";
import VipResourceCard from "@/components/VipResourceCard";
import CommentSection from "@/components/CommentSection";
import UnlockForum from "@/components/UnlockForum";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const ICON_MAP: Record<string, LucideIcon> = { Zap, Apple, Globe, Lock, Send };

type VipResourceRow = {
  id: string;
  category: "primary" | "secondary";
  icon: string;
  title: string;
  description: string;
  sub_description: string | null;
  url: string | null;
  highlight: boolean;
  sort_order: number;
};

type CardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  subDescription?: string;
  url?: string;
  onClick?: () => void;
  highlight?: boolean;
};

const Vip = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [forumOpen, setForumOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [primary, setPrimary] = useState<CardProps[]>([]);
  const [secondary, setSecondary] = useState<CardProps[]>([]);

  const requireAuth = () => setAuthOpen(true);
  const canInteract = !!user?.email_confirmed_at;

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("vip_resources")
        .select("id,category,icon,title,description,sub_description,url,highlight,sort_order")
        .order("sort_order", { ascending: true });
      if (error || !data) return;
      const toCard = (r: VipResourceRow): CardProps => ({
        icon: ICON_MAP[r.icon] ?? Rocket,
        title: r.title,
        description: r.description,
        subDescription: r.sub_description ?? undefined,
        url: r.title === "BBS" ? undefined : r.url ?? undefined,
        highlight: r.highlight,
        onClick: r.title === "BBS" ? () => (canInteract ? setForumOpen(true) : requireAuth()) : undefined,
      });
      setPrimary((data as VipResourceRow[]).filter((r) => r.category === "primary").map(toCard));
      setSecondary((data as VipResourceRow[]).filter((r) => r.category === "secondary").map(toCard));
    })();
  }, [canInteract]);


  return (
    <div className="min-h-screen relative">
      <SEO
        title="尊享中心 · 资源导航站"
        description="全球加速、Clash 共享节点、Apple 美区 ID 与 IP 环境查询的尊享资源。"
        path="/vip"
        noindex
      />
      <ParticleBackground />
      <main className="relative z-10 flex flex-col items-center px-4 py-10">
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
            <Rocket className="w-3 h-3" /> 高速加速通道
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
            <span className="gradient-text glow-text">全球网络加速</span>
          </h1>
          <p className="text-muted-foreground text-sm">精选网络服务 · 畅享全球连接</p>
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
          <CommentSection onRequireAuth={requireAuth} />
        </div>
      </main>

      <UnlockForum open={forumOpen} onOpenChange={setForumOpen} />
      <AuthGateModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
};

export default Vip;
