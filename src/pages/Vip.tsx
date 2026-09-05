import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Apple, Film, Globe, Lock, Rocket, Search, type LucideIcon } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";
import VipResourceCard from "@/components/VipResourceCard";
import CommentSection from "@/components/CommentSection";
import UnlockForum from "@/components/UnlockForum";
import AuthGateModal from "@/components/AuthGateModal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const ICON_MAP: Record<string, LucideIcon> = { Rocket, Apple, Globe, Lock, Film, Search };




type VipResourceRow = {
  id: string;
  category: "primary" | "secondary";
  icon: string;
  title: string;
  url: string | null;
  highlight: boolean;
  sort_order: number;
};

type CardProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  url?: string;
  onClick?: () => void;
};

const SUBTITLE_MAP: Record<string, string> = {
  "网络加速": "免费专线",
  "VPN专线": "免费专线",
  "苹果服务": "应用账号",
  "Clash节点": "免费分享",
  "BBS": "软件社区",
  "BBS论坛": "软件社区",
  "影视中心": "电影 · 剧集 · 短剧",
  "万能搜盘": "影片 · 软件 · 音乐",
};

const FALLBACK_ROWS: VipResourceRow[] = [
  { id: "f1", category: "primary", icon: "Rocket", title: "网络加速", url: null, highlight: true, sort_order: 1 },
  { id: "f2", category: "primary", icon: "Apple", title: "苹果服务", url: "https://dustan.id666.me", highlight: false, sort_order: 2 },
  { id: "f3", category: "secondary", icon: "Globe", title: "Clash节点", url: "https://pan.xunlei.com/s/VOnGAtlOEyZgFgT8dYpo67d1A1?pwd=45tq#", highlight: false, sort_order: 1 },
  { id: "f5", category: "secondary", icon: "Lock", title: "BBS", url: null, highlight: false, sort_order: 2 },
  { id: "f6", category: "secondary", icon: "Film", title: "影视中心", url: "https://gztv5.com/home", highlight: false, sort_order: 3 },
  { id: "f7", category: "secondary", icon: "Search", title: "万能搜盘", url: "https://so.252035.xyz", highlight: false, sort_order: 4 },
];

const Vip = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [forumOpen, setForumOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [rows, setRows] = useState<VipResourceRow[]>(FALLBACK_ROWS);

  const requireAuth = () => setAuthOpen(true);
  const canInteract = !!user?.email_confirmed_at;

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("vip_resources")
        .select("id,category,icon,title,url,highlight,sort_order")
        .order("sort_order", { ascending: true });
      if (error || !data || data.length === 0) return;
      setRows(data as VipResourceRow[]);
    })();
  }, []);

  const toCard = (r: VipResourceRow): CardProps => {
    const isBBS = r.title === "BBS" || r.title === "BBS论坛";
    const isVpn = r.title.includes("VPN") || r.title.includes("V2PN") || r.title.includes("网络加速");
    const title = isBBS ? "BBS论坛" : isVpn ? "网络加速" : r.title;
    return {
      icon: ICON_MAP[r.icon] ?? Rocket,
      title,
      subtitle: SUBTITLE_MAP[title] ?? "精选服务",
      url: isBBS || isVpn ? undefined : r.url ?? undefined,
      onClick: isBBS
        ? () => (canInteract ? setForumOpen(true) : requireAuth())
        : isVpn
          ? () => navigate("/accelerate")
          : undefined,
    };
  };

  const primary = rows.filter((r) => r.category === "primary").map(toCard);
  const secondary = rows.filter((r) => r.category === "secondary").map(toCard);

  return (
    <div className="min-h-screen relative">
      <SEO
        title="全球数字服务"
        description=""
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
            <div key={c.title} className={secondary.length <= 3 ? "col-span-2" : "col-span-3"}>
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
