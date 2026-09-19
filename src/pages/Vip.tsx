import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Apple, Film, Globe, Lock, Rocket, Search, MessageCircle, type LucideIcon } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import GlassCard from "@/components/GlassCard";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";
import VipResourceCard from "@/components/VipResourceCard";
import UnlockForum from "@/components/UnlockForum";
import AuthGateModal from "@/components/AuthGateModal";
import ChatRoomModal from "@/components/ChatRoomModal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const ICON_MAP: Record<string, LucideIcon> = { Rocket, Apple, Globe, Lock, Film, Search, MessageCircle };

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
  "苹果商店": "账号服务",
  "Clash节点": "免费分享",
  "BBS": "软件社区",
  "BBS论坛": "软件社区",
  "在线聊天室": "实时互动 · 大家一起聊",
};

const FALLBACK_ROWS: VipResourceRow[] = [
  { id: "f1", category: "primary", icon: "Rocket", title: "网络加速", url: null, highlight: true, sort_order: 1 },
  { id: "f2", category: "primary", icon: "Apple", title: "苹果商店", url: "https://dustan.id666.me", highlight: false, sort_order: 2 },
  { id: "f3", category: "secondary", icon: "Globe", title: "Clash节点", url: "https://pan.xunlei.com/s/VOnGAtlOEyZgFgT8dYpo67d1A1?pwd=45tq#", highlight: false, sort_order: 1 },
  { id: "f5", category: "secondary", icon: "Lock", title: "BBS", url: null, highlight: false, sort_order: 2 },
  { id: "f8", category: "secondary", icon: "MessageCircle", title: "在线聊天室", url: null, highlight: false, sort_order: 3 },
];

const APP_DOWNLOAD_URL = "https://pxyfbbohoazbslneagix.supabase.co/storage/v1/object/public/downloads//DustanHub.apk";

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

  const targetMsgId = searchParams.get("msgId") || undefined;

  // 监听 URL 参数：如果包含 chat=true 则自动拉起聊天室
  useEffect(() => {
    if (searchParams.get("chat") === "true") {
      if (canInteract) {
        setChatOpen(true);
      } else {
        requireAuth();
      }
    }
  }, [searchParams, canInteract]);

  // 关闭聊天室时清理 URL 中的 chat 和 msgId 参数
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
    const isChatRoom = r.title === "在线聊天室";
    const title = isBBS ? "BBS论坛" : isVpn ? "网络加速" : r.title;
    return {
      icon: ICON_MAP[r.icon] ?? Rocket,
      title,
      subtitle: SUBTITLE_MAP[title] ?? "精选服务",
      url: isBBS || isVpn || isChatRoom ? undefined : r.url ?? undefined,
      onClick: isBBS
        ? () => (canInteract ? setForumOpen(true) : requireAuth())
        : isVpn
          ? () => navigate("/accelerate")
          : isChatRoom
            ? () => (canInteract ? setChatOpen(true) : requireAuth())
            : undefined,
    };
  };

  const primary = rows.filter((r) => r.category === "primary").map(toCard);
  const secondary = rows.filter((r) => r.category === "secondary").map(toCard);
  const gridSecondary = secondary.filter((c) => c.title !== "在线聊天室");

  const handleChatClick = () => (canInteract ? setChatOpen(true) : requireAuth());

  return (
    <div className="min-h-screen relative">
      <SEO
        title="全球数字服务"
        description=""
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
          {gridSecondary.map((c, i) => (
            <VipResourceCard key={i} {...c} delay={(i + 2) * 0.06} />
          ))}
        </div>

    {/* 底部横向在线聊天室卡片 */}
        <div className="w-full max-w-2xl">
          <div
            onClick={handleChatClick}
            className="bg-transparent rounded-xl p-4 cursor-pointer relative overflow-hidden transition-colors duration-300 border border-glass-border/40 hover:border-primary/40 flex items-center justify-between group animate-breathe-glow"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-foreground">在线聊天室</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                    公共频道
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  实时互动 · 大家一起聊
                </p>
              </div>
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
      <ChatRoomModal 
        open={chatOpen} 
        onOpenChange={handleChatOpenChange} 
        targetMessageId={targetMsgId}
      />
      <AuthGateModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
};

export default Vip;