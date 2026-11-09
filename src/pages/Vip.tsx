import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Apple, ArrowLeft, BookOpen, ChevronRight, Download, Film, Globe, Lock, Rocket, Search, Zap, type LucideIcon } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import GlassCard from "@/components/GlassCard";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";
import VipResourceCard from "@/components/VipResourceCard";
import SiteFooter from "@/components/SiteFooter";
import UnlockForum from "@/components/UnlockForum";
import GameAccelerateModal from "@/components/GameAccelerateModal";
import AppDownloadModal from "@/components/AppDownloadModal";
import AuthGateModal from "@/components/AuthGateModal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/track";

const APP_DOWNLOAD_URL = "https://wwwa.qyshare.com:2083/s/dustin";

const ICON_MAP: Record<string, LucideIcon> = { Rocket, Apple, Globe, Lock, Film, Search, Zap };

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
  badge?: boolean;
  imgUrl?: string;
};

const SUBTITLE_MAP: Record<string, string> = {
  "网络加速": "免费专线",
  "海外账号": "账号服务",
  "苹果商店": "账号服务", // 兼容数据库旧 title，vip_resources 表更新后可删
  "免费订阅": "FLClash",
  "互助专区": "有问必答",
  "游戏加速": "终身免费",
};

// 3D 立体图标（图床直链）：按卡片 id 与标题硬编码映射，未命中的卡片回退 lucide 线条图标
const VIP_ICON_IMAGES: Record<string, string> = {
  f1: "/site-icons/shadowrocket-color-256.webp?v=5",
  "网络加速": "/site-icons/shadowrocket-color-256.webp?v=5",
  f2: "/site-icons/appstore-color-256.webp?v=5",
  "海外账号": "/site-icons/appstore-color-256.webp?v=5",
  "苹果商店": "/site-icons/apple-transparent-256.webp?v=2",
  f3: "/site-icons/earth-transparent-256.webp",
  "免费订阅": "/site-icons/earth-transparent-256.webp",
  f5: "/site-icons/bbs-transparent-256.webp?v=5",
  "互助专区": "/site-icons/bbs-transparent-256.webp?v=5",
  f6: "/site-icons/game-lightning-256.webp",
  "游戏加速": "/site-icons/game-lightning-256.webp",
};

const FALLBACK_ROWS: VipResourceRow[] = [
  { id: "f1", category: "primary", icon: "Rocket", title: "网络加速", url: null, highlight: true, sort_order: 1 },
  { id: "f2", category: "primary", icon: "Apple", title: "海外账号", url: "https://dustan.id666.me", highlight: false, sort_order: 2 },
  { id: "f6", category: "secondary", icon: "Zap", title: "游戏加速", url: null, highlight: false, sort_order: 1 },
  { id: "f5", category: "secondary", icon: "Lock", title: "互助专区", url: null, highlight: false, sort_order: 2 },
];


const Vip = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [forumOpen, setForumOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [rows, setRows] = useState<VipResourceRow[]>(FALLBACK_ROWS);
  const [hasUnread, setHasUnread] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [appPopupOpen, setAppPopupOpen] = useState(false);

  // VIP 页下载 APP 弹窗：APP 里不弹；浏览器里每次重新打开页面就弹一次，
  // 同个页面里来回走（站内跳转不刷新）不重复弹。
  // 不用 sessionStorage：安卓浏览器关掉重开会恢复标签页，会话标记还在，导致重开不弹。
  useEffect(() => {
    try {
      // ?app_popup=1 强制弹一次，方便复查；正常访客不受影响
      const force = new URLSearchParams(window.location.search).get("app_popup") === "1";
      const win = window as unknown as { __dustanAppPopupShown?: boolean; Capacitor?: { isNativePlatform?: () => boolean } };
      if (!force && win.__dustanAppPopupShown) return;
      // 注意：网页里也会加载 Capacitor 的网页版，window.Capacitor 存在不代表在 APP 里，
      // 必须用 isNativePlatform() 判断，原生 APP 才返回 true
      const cap = win.Capacitor;
      const inApp =
        (typeof cap?.isNativePlatform === "function" && cap.isNativePlatform()) ||
        /DustanHub/i.test(navigator.userAgent || "");
      if (!force && inApp) return;
      win.__dustanAppPopupShown = true;
      const t = setTimeout(() => setAppPopupOpen(true), 500);
      return () => clearTimeout(t);
    } catch {
      return;
    }
  }, []);

  const handleAppPopupChange = (open: boolean) => {
    setAppPopupOpen(open);
  };

  const requireAuth = () => setAuthOpen(true);
  const canInteract = !!user?.email_confirmed_at;

  useEffect(() => { track("visit_vip", "VIP页访问", "visit"); }, []);

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

  useEffect(() => {
    if (!user) {
      setHasUnread(false);
      return;
    }
    (async () => {
      const { count } = await supabase
        .from("forum_notifications")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("is_read", false);
      setHasUnread(!!count && count > 0);
    })();
  }, [user, forumOpen]);

  const toCard = (r: VipResourceRow): CardProps => {
    const isBBS = r.title === "互助专区";
    const isVpn = r.title.includes("VPN") || r.title.includes("V2PN") || r.title.includes("网络加速");
    const isGame = r.title === "游戏加速";
    const title = isBBS ? "互助专区" : isVpn ? "网络加速" : r.title;
    const href = isBBS || isVpn || isGame ? undefined : r.url ?? undefined;
    const base = isBBS
      ? () => (canInteract ? setForumOpen(true) : requireAuth())
      : isGame
        ? () => setGameOpen(true)
        : undefined;
    const ckey = "vip_" + (isBBS ? "bbs" : isVpn ? "accelerate" : isGame ? "game" : (r.icon || "card").toLowerCase());
    return {
      icon: ICON_MAP[r.icon] ?? Rocket,
      title,
      subtitle: SUBTITLE_MAP[title] ?? "精选服务",
      imgUrl: VIP_ICON_IMAGES[r.id] ?? VIP_ICON_IMAGES[title],
      url: href,
      badge: isBBS ? hasUnread : undefined,
      onClick: () => { track(ckey, title, "service"); base?.(); },
    };
  };

  const primary = rows.filter((r) => r.category === "primary").map(toCard);
  const secondary = rows.filter((r) => r.category === "secondary").map(toCard);

  return (
    <div className="min-h-screen relative">
      <SEO
        title="全球数字服务"
        description="尊享节点 · 独享账号 · 极速体验"
        path={location.pathname}
        noindex
      />
      <ParticleBackground />

      <main className="relative z-10 px-4 pt-5 pb-8 sm:py-8 flex flex-col items-center min-h-screen">
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
            c.title === "网络加速" ? (
              <Link to="/accelerate" className="block" key={i}>
                <VipResourceCard {...c} delay={0} />
              </Link>
            ) : (
              <VipResourceCard key={i} {...c} delay={0} />
            )
          ))}
          {secondary.map((c, i) => (
            <VipResourceCard key={i} {...c} delay={0} />
          ))}
        </div>

        <div className="w-full max-w-2xl">
          <div
            onClick={() => { track("vip_tutorials", "教程与帮助", "service"); navigate("/tutorials"); }}
            className="bg-transparent rounded-xl py-4 px-20 cursor-pointer touch-manipulation select-none active:scale-[0.98] active:opacity-90 relative overflow-hidden transition-colors duration-300 border border-glass-border/40 hover:border-primary/40 group"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg whitespace-nowrap">
                <span className="gradient-text glow-text">教程与帮助</span>
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                从注册到使用，一步一步教您上手
              </p>
            </div>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>

        <motion.a
          href={APP_DOWNLOAD_URL}
          onClick={() => track("app_download_vip", "APP下载（VIP页）", "app")}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-sm font-bold animate-app-link inline-flex items-center gap-1.5"
          style={{ color: "#a855f7" }}
        >
          <Download className="w-4 h-4" />
          下载官方APP
        </motion.a>

        <SiteFooter />
      </main>

      <UnlockForum open={forumOpen} onOpenChange={setForumOpen} />
      <GameAccelerateModal open={gameOpen} onOpenChange={setGameOpen} />
      <AppDownloadModal open={appPopupOpen} onOpenChange={handleAppPopupChange} />
      <AuthGateModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
};

export default Vip;
