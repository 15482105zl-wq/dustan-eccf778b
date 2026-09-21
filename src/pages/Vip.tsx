import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Apple, Film, Globe, Lock, Rocket, Search, type LucideIcon } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import GlassCard from "@/components/GlassCard";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";
import VipResourceCard from "@/components/VipResourceCard";
import UnlockForum from "@/components/UnlockForum";
import AuthGateModal from "@/components/AuthGateModal";
import AiChatModal from "@/components/AiChatModal";
import AiIcon from "@/components/AiIcon";
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
  "苹果商店": "账号服务",
  "Clash订阅": "免费节点",
  "BBS论坛": "会员社区",
};

const FALLBACK_ROWS: VipResourceRow[] = [
  { id: "f1", category: "primary", icon: "Rocket", title: "网络加速", url: null, highlight: true, sort_order: 1 },
  { id: "f2", category: "primary", icon: "Apple", title: "苹果商店", url: "https://dustan.id666.me", highlight: false, sort_order: 2 },
  { id: "f3", category: "secondary", icon: "Globe", title: "Clash订阅", url: "https://pan.xunlei.com/s/VOnGAtlOEyZgFgT8dYpo67d1A1?pwd=45tq#", highlight: false, sort_order: 1 },
  { id: "f5", category: "secondary", icon: "Lock", title: "BBS", url: null, highlight: false, sort_order: 2 },
];

const APP_DOWNLOAD_URL = "https://pxyfbbohoazbslneagix.supabase.co/storage/v1/object/public/downloads/DustanHub.apk";

const Vip = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [forumOpen, setForumOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [rows, setRows] = useState<VipResourceRow[]>(FALLBACK_ROWS);

  const requireAuth = () => setAuthOpen(true);
  const canInteract = !!user?.email_confirmed_at;

  // 网址包含 chat=true 时，自动打开 AI 助手对话（不需要登录）
  useEffect(() => {
    if (searchParams.get("chat") === "true") {
      setChatOpen(true);
    }
  }, [searchParams]);

  // 关闭对话时清理 URL 中的 chat 和 msgId 参数
  const handleChatOpenChange = (open: boolean) => {
    setChatOpen(open);
    if (!open && searchParams.get("chat")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("chat");
      nextParams.delete("msgId");
      setSearchParams(nextParams, { replace: true });
    }
  };

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

  const handleChatClick = () => setChatOpen(true);

  return (
    <div className="min-h-screen relative">
      <SEO
        title="全球��字服务"
        description="尊享节点 · 独享账号 · 极速体验"
        path="/vip"
        noindex
      />
      <ParticleBackground />

      <main className="relative z-10 px-4 py-8 flex flex-col items-center min-h-screen">
        <div className="w-full max-w-2xl flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            aria-label="返回首页"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <UserNav />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-blue-400 to-primary/70 bg-clip-text text-transparent">
            全球数字服务
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            尊享节点 · 独享账号 · 极速体验
          </p>
        </motion.div>

        <div className="w-full max-w-2xl grid grid-cols-2 gap-4 mb-6">
          {primary.map((c, i) => (
            <VipResourceCard key={i} {...c} delay={i * 0.06} />
          ))}
          {secondary.map((c, i) => (
            <VipResourceCard key={i} {...c} delay={(i + 2) * 0.06} />
          ))}
        </div>

        {/* 底部横向 AI 助手卡片 */}
        <div className="w-full max-w-2xl">
          <div
            onClick={handleChatClick}
            className="bg-transparent rounded-xl py-5 px-16 cursor-pointer relative overflow-hidden transition-colors duration-300 border border-glass-border/40 hover:border-primary/40 group animate-breathe-glow"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AiIcon className="w-7 h-7" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg text-foreground whitespace-nowrap">Dustan AI助手</h3>
              <p className="text-sm text-muted-foreground mt-1">
                有问题直接问我
              </p>
            </div>
          </div>
        </div>

        <motion.a
          href={APP_DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 text-sm font-bold animate-app-link"
          style={{ color: "#a855f7" }}
        >
          📲 下载 Dustan Hub App
        </motion.a>

        <footer
          className="mt-12 mb-2 text-center text-xs text-muted-foreground"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          © 2020 - 2026 Dustan Hub · 用心运营每一天
          <br />
          All Rights Reserved.
        </footer>
      </main>

      <UnlockForum open={forumOpen} onOpenChange={setForumOpen} />
      <AiChatModal open={chatOpen} onOpenChange={handleChatOpenChange} />
      <AuthGateModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
};

export default Vip;
