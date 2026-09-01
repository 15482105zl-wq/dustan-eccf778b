import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Apple, Globe, Lock, Rocket, Send, Search, Check, Copy, type LucideIcon } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";
import VipResourceCard from "@/components/VipResourceCard";
import CommentSection from "@/components/CommentSection";
import UnlockForum from "@/components/UnlockForum";
import AuthGateModal from "@/components/AuthGateModal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const ICON_MAP: Record<string, LucideIcon> = { Rocket, Apple, Globe, Lock, Send, Search };

const SIGNUP_URL = "https://kitty.fo/register?invite=110BKHP4";

const CHANNEL_URL = "https://t.me/bydustan";

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
  url?: string;
  onClick?: () => void;
  highlight?: boolean;
};

const FALLBACK_ROWS: VipResourceRow[] = [
  { id: "f1", category: "primary", icon: "Rocket", title: "VPN专线", url: null, highlight: true, sort_order: 1 },
  { id: "f2", category: "primary", icon: "Apple", title: "苹果服务", url: "https://dustan.id666.me", highlight: false, sort_order: 2 },
  { id: "f3", category: "secondary", icon: "Globe", title: "Clash节点", url: "https://pan.xunlei.com/s/VOnGAtlOEyZgFgT8dYpo67d1A1?pwd=45tq#", highlight: false, sort_order: 1 },
  { id: "f4", category: "secondary", icon: "Search", title: "万能搜盘", url: "https://so.252035.xyz", highlight: false, sort_order: 2 },
  { id: "f5", category: "secondary", icon: "Lock", title: "BBS", url: null, highlight: false, sort_order: 3 },
];

const Vip = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [forumOpen, setForumOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [rows, setRows] = useState<VipResourceRow[]>(FALLBACK_ROWS);
  const [counting, setCounting] = useState(false);
  const [seconds, setSeconds] = useState(5);
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    if (!counting) return;
    if (seconds <= 0) {
      window.location.href = SIGNUP_URL;
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [counting, seconds]);

  const startCountdown = () => {
    setSeconds(5);
    setCopied(false);
    setCounting(true);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(SIGNUP_URL);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = SIGNUP_URL;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
  };

  const toCard = (r: VipResourceRow): CardProps => {
    const isBBS = r.title === "BBS";
    const isVpn = r.title.includes("VPN") || r.title.includes("V2PN");
    return {
      icon: ICON_MAP[r.icon] ?? Rocket,
      title: r.title,
      url: isBBS || isVpn ? undefined : r.url ?? undefined,
      highlight: r.highlight,
      onClick: isBBS
        ? () => (canInteract ? setForumOpen(true) : requireAuth())
        : isVpn
          ? startCountdown
          : undefined,
    };
  };

  const primary = rows.filter((r) => r.category === "primary").map(toCard);
  const secondary = rows.filter((r) => r.category === "secondary").map(toCard);

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

      {/* 倒计时覆盖层 */}
      <AnimatePresence>
        {counting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-2xl px-6"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="glass relative w-full max-w-sm overflow-hidden rounded-3xl border-accent/40 p-8 text-center animate-breathe-glow"
            >
              <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl" />

              <p className="relative text-[11px] tracking-[0.35em] text-muted-foreground mb-6">
                安全通道建立中
              </p>

              {/* 进度环 */}
              <div className="relative mx-auto mb-6 h-36 w-36">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="44" fill="none" strokeWidth="4" className="stroke-glass-border/40" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="stroke-accent"
                    strokeDasharray={2 * Math.PI * 44}
                    animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - seconds / 5) }}
                    transition={{ duration: 1, ease: "linear" }}
                    style={{ filter: "drop-shadow(0 0 8px hsl(var(--accent) / 0.8))" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={seconds}
                      initial={{ opacity: 0, scale: 1.4, filter: "blur(6px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.35 }}
                      className="font-heading text-5xl font-bold gradient-text glow-text"
                    >
                      {seconds}
                    </motion.span>
                  </AnimatePresence>
                  <span className="mt-1 text-[10px] tracking-[0.2em] text-muted-foreground">SECONDS</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-2">即将为你打开注册页</p>
              <p className="mx-auto mb-6 max-w-[16rem] rounded-lg border border-glass-border/40 px-3 py-2 text-[11px] text-primary break-all">
                {SIGNUP_URL}
              </p>

              <button
                onClick={copyLink}
                className={`w-full py-3 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all ${
                  copied
                    ? "bg-primary/15 text-primary border border-primary/50"
                    : "bg-accent text-accent-foreground shadow-[0_0_24px_hsl(var(--accent)/0.45)] hover:scale-[1.02]"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> ✅ 已复制，请在浏览器中打开
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> 复制链接，浏览器打开
                  </>
                )}
              </button>
              <button
                onClick={() => setCounting(false)}
                className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                取消跳转
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Vip;
