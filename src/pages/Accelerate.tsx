import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const YUETONG_URL = "https://app.xn--jdu596h.com/#/register?code=OkGae8Qp";
const APP_DOWNLOAD_URL = "https://pxyfbbohoazbslneagix.supabase.co/storage/v1/object/public/downloads/DustanHub.apk";

const NOTICE_SLOT = "accelerate_marquee";
// 公告文案写死在代码里，打开即显示；数据库里有新文案时查到后自动覆盖
const DEFAULT_NOTICE = "🧧 悦享中秋：悦通全场7折+下单博饼赢最高¥100现金红包，10月7日23:59结束";

// 悦通官方图标（手绘还原，内联 SVG 打开即显示，无需网络加载）
const YuetongIcon = () => (
  <svg
    viewBox="0 0 56 56"
    className="w-14 h-14 rounded-full flex-shrink-0"
    style={{ boxShadow: "0 0 20px rgba(88, 86, 237, 0.55)" }}
  >
    <circle cx="28" cy="28" r="28" fill="#5856ED" />
    <path
      d="M26.3 15.5 L28 24.5 L29.7 15.5"
      fill="none"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="19.7" cy="28.5" r="11" fill="none" stroke="#ffffff" strokeWidth="3" />
    <circle cx="36.3" cy="28.5" r="11" fill="none" stroke="#ffffff" strokeWidth="3" />
  </svg>
);

const Accelerate = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [noticeText, setNoticeText] = useState(DEFAULT_NOTICE);
  const [editingNotice, setEditingNotice] = useState(false);
  const [noticeDraft, setNoticeDraft] = useState("");
  const [savingNotice, setSavingNotice] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("site_notices" as any)
          .select("text")
          .eq("slot", NOTICE_SLOT)
          .eq("is_active", true)
          .maybeSingle();
        if (!error && data && (data as any).text) setNoticeText((data as any).text);
      } catch {
        /* 读取失败时用默认文案 */
      }
    })();
  }, []);

  const saveNotice = async () => {
    const text = noticeDraft.trim();
    if (!text) {
      toast({ title: "公告内容不能为空", variant: "destructive" });
      return;
    }
    setSavingNotice(true);
    try {
      const { error } = await supabase
        .from("site_notices" as any)
        .update({ text, updated_at: new Date().toISOString() } as any)
        .eq("slot", NOTICE_SLOT);
      if (error) throw error;
      setNoticeText(text);
      setEditingNotice(false);
      toast({ title: "公告已更新，全站即刻同步" });
    } catch (err: any) {
      toast({ title: "保存失败", description: err?.message || "网络异常", variant: "destructive" });
    } finally {
      setSavingNotice(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <SEO title="网络加速" description="" path="/accelerate" noindex />
      <ParticleBackground />
      <main className="relative z-10 flex flex-col items-center px-4 pt-5 pb-10 sm:py-10">
        <div className="w-full max-w-4xl flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/vip")}
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
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
            <span className="gradient-text glow-text">网络加速</span>
          </h1>
          <p className="text-muted-foreground text-sm">免费专线 · 全球直连</p>
        </motion.div>

        <div className="w-full max-w-4xl flex flex-col gap-4">
          {/* 滚动公告：文案写死在代码里即时显示，数据库有更新时自动覆盖 */}
          <div className="overflow-hidden rounded-2xl border border-amber-300/25 bg-amber-400/[0.07] py-2.5 -mt-3">
            <style>{`@keyframes dustanNoticeScroll { to { transform: translateX(-100%); } }`}</style>
            <div
              className="whitespace-nowrap"
              style={{ display: "inline-block", paddingLeft: "100%", animation: "dustanNoticeScroll 26s linear infinite" }}
            >
              <span className="text-xs text-amber-100/90">{noticeText}</span>
            </div>
          </div>
          {isAdmin && !editingNotice && (
            <div className="flex justify-end -mt-2">
              <button
                type="button"
                onClick={() => {
                  setNoticeDraft(noticeText);
                  setEditingNotice(true);
                }}
                className="text-[11px] text-amber-200/70 hover:text-amber-200 underline underline-offset-2"
              >
                编辑公告
              </button>
            </div>
          )}
          {isAdmin && editingNotice && (
            <div className="rounded-2xl border border-amber-300/25 bg-zinc-900/80 p-3 space-y-2">
              <textarea
                rows={3}
                value={noticeDraft}
                onChange={(e) => setNoticeDraft(e.target.value)}
                placeholder="输入滚动公告文字"
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs outline-none focus:border-accent resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingNotice(false)}
                  className="px-4 py-1.5 rounded-lg bg-secondary/40 hover:bg-secondary/70 text-zinc-300 text-xs border border-border/50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => void saveNotice()}
                  disabled={savingNotice}
                  className="px-4 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {savingNotice ? "保存中…" : "保存生效"}
                </button>
              </div>
            </div>
          )}
          {/* 悦通 - 唯一推荐 */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-[38px] p-6 flex flex-col relative bg-transparent border border-glass-border/40"
          >
            <div className="flex items-center gap-3.5 mb-3 mt-1">
              <YuetongIcon />
              <div>
                <h2 className="font-heading text-lg font-semibold" style={{ color: "#f2f3fa" }}>
                  悦通
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  自有客户端 · 节点稳定 · 全球覆盖
                </p>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed flex-1 text-muted-foreground">
              主打一个"稳"字——56 个国家和地区、112 个节点覆盖全球，自有 YueLink 客户端三步上手，流媒体一键解锁，适合追求长期稳定的用户。
            </p>

            <button
              onClick={() => window.open(YUETONG_URL, "_blank", "noopener,noreferrer")}
              className="mt-4 w-full rounded-full py-3 text-sm font-bold border border-white/10 bg-transparent transition-transform hover:scale-[1.02]"
              style={{ color: "#a855f7" }}
            >
              立即开始
            </button>
          </motion.div>
        </div>

        <motion.a
          href={APP_DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          initial={{
opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-sm font-bold animate-app-link"
          style={{ color: "#a855f7" }}
        >
          📲 下载 Dustan Hub App
        </motion.a>

        <footer
          className="mt-6 mb-2 text-center text-xs text-muted-foreground"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          © 2020 - 2026 Dustan Hub · 用心运营每一天
          <br />
          All Rights Reserved.
        </footer>
      </main>
    </div>
  );
};

export default Accelerate;