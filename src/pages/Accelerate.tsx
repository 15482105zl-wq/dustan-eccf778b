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
import SiteFooter from "@/components/SiteFooter";
import FreeSubSection from "@/components/FreeSubSection";

const YUETONG_URL = "https://app.xn--9kq451mn9g.com/#/register?code=OkGae8Qp";
const NICE_URL = "https://dustan.mmmoyou.com/#/register?code=0lc8ncSH";
const XINGCHEN_URL = "https://xc1.luniu8.com/?code=qm8A2dss";
const FLCLASH_APK_URL = "https://wwwa.qyshare.com:2083/s/nujcn8";
const FLCLASH_FOLDER_URL = "https://wwwa.qyshare.com/s/3vfjoi";

const NOTICE_SLOT = "accelerate_marquee";
// 公告图标默认📢；文案开头自带 emoji 时用文案自带的
const NOTICE_ICON = "📢";
// 默认消息已清空（boss 2026-11-10 令：滚动条暂时不显示）；
// 数据库 site_notices 有文案时仍会显示，管理员在页面上编辑公告也可重新打开。
const DEFAULT_NOTICE = "";

// 3D 玻璃质感发光 - Nice·云 圆形图标
const NiceCloudIcon = () => (
  <div
    className="w-14 h-14 rounded-full relative flex items-center justify-center flex-shrink-0 overflow-hidden"
    style={{
      background: "radial-gradient(100% 100% at 30% 25%, #2bd2ff 0%, #0077ff 55%, #052a6b 100%)",
      boxShadow: "0 0 20px rgba(0, 140, 255, 0.55), inset 0 1.5px 2px rgba(255, 255, 255, 0.75), inset 0 -3px 6px rgba(0, 0, 0, 0.45)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
    }}
  >
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 56 56">
      <defs>
        <linearGradient id="cloudShineRound" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="40%" stopColor="#cdeeff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#85d1ff" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <circle cx="28" cy="28" r="20" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" strokeDasharray="3 3" />
      <ellipse cx="28" cy="28" rx="22" ry="11" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" transform="rotate(-20 28 28)" />
      <circle cx="10" cy="24" r="1.3" fill="#ffffff" filter="drop-shadow(0 0 2px #fff)" />
      <circle cx="41" cy="18" r="1.5" fill="#ffffff" filter="drop-shadow(0 0 2px #fff)" />
      <circle cx="44" cy="35" r="1.2" fill="#ffffff" filter="drop-shadow(0 0 2px #fff)" />
      <path
        d="M20 37h17a7.5 7.5 0 0 0 2.2-14.7 10 10 0 0 0-18.7-2.8A7.5 7.5 0 0 0 20 37z"
        fill="url(#cloudShineRound)"
        filter="drop-shadow(0 4px 8px rgba(0, 30, 90, 0.45))"
      />
      <ellipse cx="29" cy="25" rx="5.5" ry="4.5" fill="#ffffff" opacity="0.45" />
      <ellipse cx="23" cy="31" rx="4" ry="3" fill="#ffffff" opacity="0.35" />
    </svg>
  </div>
);

// 悦通官方图标（3D 立体图，图床直链，保持原尺寸与辉光阴影）
const YuetongIcon = () => (
  <div
    className="w-14 h-14 rounded-full relative flex items-center justify-center flex-shrink-0 overflow-hidden"
    style={{
      background: "radial-gradient(100% 100% at 30% 25%, #c084fc 0%, #7c3aed 55%, #2e1065 100%)",
      boxShadow: "0 0 20px rgba(124, 58, 237, 0.55), inset 0 1.5px 2px rgba(255, 255, 255, 0.75), inset 0 -3px 6px rgba(0, 0, 0, 0.45)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
    }}
  >
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 56 56">
      <defs>
        <linearGradient id="yuetongRingShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#e9d5ff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <circle cx="28" cy="28" r="20" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" strokeDasharray="3 3" />
      <ellipse cx="28" cy="28" rx="22" ry="11" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" transform="rotate(-20 28 28)" />
      <circle cx="10" cy="24" r="1.3" fill="#ffffff" filter="drop-shadow(0 0 2px #fff)" />
      <circle cx="41" cy="18" r="1.5" fill="#ffffff" filter="drop-shadow(0 0 2px #fff)" />
      <circle cx="44" cy="35" r="1.2" fill="#ffffff" filter="drop-shadow(0 0 2px #fff)" />
      <g filter="drop-shadow(0 4px 8px rgba(40, 10, 90, 0.5))">
        <circle cx="22.5" cy="29" r="8.5" fill="none" stroke="url(#yuetongRingShine)" strokeWidth="5" />
        <circle cx="33.5" cy="29" r="8.5" fill="none" stroke="url(#yuetongRingShine)" strokeWidth="5" />
      </g>
      <path d="M15.5 24a8.5 8.5 0 0 1 6-7.2" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
    </svg>
  </div>
);

// 星辰·云图标（黑夜星星：深夜底 + 发光大星，boss 2026-10-29 批预览版）
const XingchenIcon = () => (
  <div
    className="w-14 h-14 rounded-full relative flex items-center justify-center flex-shrink-0 overflow-hidden"
    style={{
      background: "radial-gradient(100% 100% at 30% 25%, #1e293b 0%, #0f172a 55%, #020617 100%)",
      boxShadow: "0 0 20px rgba(250, 204, 21, 0.45), inset 0 1.5px 2px rgba(255, 255, 255, 0.75), inset 0 -3px 6px rgba(0, 0, 0, 0.45)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
    }}
  >
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 56 56">
      <defs>
        <linearGradient id="xingchenNightStar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
          <stop offset="50%" stopColor="#fef3c7" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <circle cx="28" cy="28" r="20" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" strokeDasharray="3 3" />
      <polygon points="15,14 16.2,16.8 19,18 16.2,19.2 15,22 13.8,19.2 11,18 13.8,16.8" fill="#ffffff" opacity="0.9" />
      <polygon points="42,12 43.4,15.6 47,17 43.4,18.4 42,22 40.6,18.4 37,17 40.6,15.6" fill="#ffffff" opacity="0.85" />
      <polygon points="40,36 41,38.5 43.5,39.5 41,40.5 40,43 39,40.5 36.5,39.5 39,38.5" fill="#ffffff" opacity="0.8" />
      <circle cx="16" cy="38" r="1" fill="#ffffff" opacity="0.8" />
      <circle cx="22" cy="14" r="1" fill="#ffffff" opacity="0.7" />
      <g filter="drop-shadow(0 0 4px rgba(250, 204, 21, 0.9))">
        <polygon points="28,12 31.2,24.8 44,28 31.2,31.2 28,44 24.8,31.2 12,28 24.8,24.8" fill="url(#xingchenNightStar)" />
        <polygon points="28,18 29.8,26.2 38,28 29.8,29.8 28,38 26.2,29.8 18,28 26.2,26.2" fill="#fef3c7" opacity="0.9" />
      </g>
    </svg>
  </div>
);

const Accelerate = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [noticeText, setNoticeText] = useState(DEFAULT_NOTICE);
  const [editingNotice, setEditingNotice] = useState(false);
  const [noticeDraft, setNoticeDraft] = useState("");
  const [savingNotice, setSavingNotice] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

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
    setSavingNotice(true);
    try {
      if (!text) {
        const { error } = await supabase
          .from("site_notices" as any)
          .update({ is_active: false, updated_at: new Date().toISOString() } as any)
          .eq("slot", NOTICE_SLOT);
        if (error) throw error;
        setNoticeText("");
        setEditingNotice(false);
        toast({ title: "滚动公告已关闭" });
      } else {
        const { error } = await supabase
          .from("site_notices" as any)
          .update({ text, is_active: true, updated_at: new Date().toISOString() } as any)
          .eq("slot", NOTICE_SLOT);
        if (error) throw error;
        setNoticeText(text);
        setEditingNotice(false);
        toast({ title: "公告已更新，全站即刻同步" });
      }
    } catch (err: any) {
      toast({ title: "保存失败", description: "网络异常", variant: "destructive" });
    } finally {
      setSavingNotice(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <SEO title="网络加速" description="星辰云、Nice云网络加速，IEPL专线，稳定快速" path="/accelerate" noindex />
      <ParticleBackground />
      <main className="relative z-10 flex flex-col items-center px-4 pt-5 pb-10 sm:py-10">
        <div className="w-full max-w-4xl flex items-center justify-between mb-6">
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
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">
            <span className="gradient-text glow-text">网络加速</span>
          </h1>
          <p className="text-muted-foreground text-sm">免费专线 · 全球直连</p>
        </motion.div>

        <div className="w-full max-w-4xl flex flex-col gap-4">
          {/* 滚动公告：数据库有文案时才显示，清空即关闭 */}
          {noticeText && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-2xl border border-amber-300/25 bg-amber-400/[0.07] py-2.5 -mt-3"
          >
            <style>{`@keyframes dustanNoticeScroll { to { transform: translateX(-100%); } }`}</style>
            <div
              className="whitespace-nowrap"
              style={{ display: "inline-block", paddingLeft: "100%", animation: "dustanNoticeScroll 26s linear infinite" }}
            >
              <span className="text-xs text-amber-100/90">{/^\p{Extended_Pictographic}/u.test(noticeText) ? noticeText : `${NOTICE_ICON} ${noticeText}`}</span>
            </div>
          </motion.div>
          )}
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
          {/* 星辰·云（2026-10-12 新增，首推） */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.04 }}
            className="rounded-[38px] p-6 flex flex-col relative bg-transparent border border-glass-border/40"
          >
            <div className="flex items-center gap-3.5 mb-3 mt-1">
              <XingchenIcon />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-lg font-semibold" style={{ color: "#f2f3fa" }}>
                    星辰·云
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowTutorial(true)}
                    className="text-sm font-semibold hover:opacity-80 transition-opacity"
                    style={{ color: "#a855f7" }}
                  >
                    教程
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  老牌机场 · IEPL专线 · 套餐亲民
                </p>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed flex-1 text-muted-foreground">
              专线是看家本领——IEPL 高速专线，月付 8 元起，不限设备，流媒体一键解锁，适合追求性价比的重度用户。
            </p>

            <a
              href={XINGCHEN_URL} target="_blank" rel="noopener noreferrer"
              className="mt-4 w-full rounded-full py-3 text-center text-sm font-bold border border-white/10 bg-transparent transition-transform hover:scale-[1.02]"
              style={{ color: "#a855f7" }}
            >
              立即开始
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.04 }}
            className="rounded-[38px] p-6 flex flex-col relative bg-transparent border border-glass-border/40"
          >
            <div className="flex items-center gap-3.5 mb-3 mt-1">
              <NiceCloudIcon />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-lg font-semibold" style={{ color: "#f2f3fa" }}>
                    Nice·云
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowTutorial(true)}
                    className="text-sm font-semibold hover:opacity-80 transition-opacity"
                    style={{ color: "#a855f7" }}
                  >
                    教程
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  防失联 · 全球直连 · 峰值10Gbps
                </p>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed flex-1 text-muted-foreground">
              防失联是看家本领——内置备用节点，主线路波动无感快速切换。SS/Hy2/Vmess协议，峰值10Gbps，流媒体一键解锁，适合追求速度和不断线的用户。
            </p>

            <a
              href={NICE_URL} target="_blank" rel="noopener noreferrer"
              className="mt-4 w-full rounded-full py-3 text-center text-sm font-bold border border-white/10 bg-transparent transition-transform hover:scale-[1.02]"
              style={{ color: "#a855f7" }}
            >
              立即开始
            </a>
          </motion.div>
          {/* 2026-10-14 隐藏悦通：只推星辰·云和Nice·云（恢复时取消本注释块即可）
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

            <a
              href={YUETONG_URL} target="_blank" rel="noopener noreferrer"
              className="mt-4 w-full rounded-full py-3 text-center text-sm font-bold border border-white/10 bg-transparent transition-transform hover:scale-[1.02]"
              style={{ color: "#a855f7" }}
            >
              立即开始
            </a>
          </motion.div>
          */}

          {/* 免费订阅领取区：付费卡片之下，主列容器内 */}
          <FreeSubSection />
        </div>

        {showTutorial && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowTutorial(false)}
          >
            <div
              className="w-full max-w-md rounded-[28px] border border-white/10 p-6 max-h-[85vh] overflow-y-auto"
              style={{ background: "#14141c" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading text-base font-semibold" style={{ color: "#f2f3fa" }}>
                  使用教程
                </h3>
                <button
                  onClick={() => setShowTutorial(false)}
                  className="text-muted-foreground text-2xl leading-none px-2"
                  aria-label="关闭"
                >
                  ×
                </button>
              </div>

              <div className="flex gap-3 mb-5">
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: "#a855f7", color: "#fff" }}>
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1" style={{ color: "#f2f3fa" }}>
                    选一家买套餐
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    星辰、Nice任选一家，点卡片上的立即开始，注册账号，按用量选个套餐付款，开通后就能用。
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mb-5">
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: "#a855f7", color: "#fff" }}>
                  2
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1" style={{ color: "#f2f3fa" }}>
                    复制订阅链接
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    付费套餐的订阅链接在机场官网首页里复制。
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mb-5">
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: "#a855f7", color: "#fff" }}>
                  3
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1" style={{ color: "#f2f3fa" }}>
                    下载客户端
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    如果下载速度不稳，请使用备用下载：打开分享链接，分享页里面就有备用下载，不用另外找链接。
                  </p>
                  <a
                    href={FLCLASH_APK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-full px-5 py-2.5 text-sm font-bold"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff" }}
                  >
                    下载 FLClash 0.9.3 安卓版
                  </a>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    桌面版也有：
                    <a
                      href={FLCLASH_FOLDER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2"
                      style={{ color: "#c4b5fd" }}
                    >
                      点这里下载
                    </a>
                    （电脑 41.27MB、Mac 56.41MB、Linux 38.61MB）
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mb-5">
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: "#a855f7", color: "#fff" }}>
                  4
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1" style={{ color: "#f2f3fa" }}>
                    导入订阅并更新
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    打开 FLClash，点下方“配置” → 点“+”添加配置 → 选“URL” → 粘贴订阅链接 → 点提交，然后点“更新”刷新订阅
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: "#a855f7", color: "#fff" }}>
                  5
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1" style={{ color: "#f2f3fa" }}>
                    选节点并启动
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    点下方“代理”，点测速，看各节点延迟，自动选最快的就行，想自己挑就切手动选一个延迟低的，回到“仪表盘”点启动，显示已连接就能用了。
                  </p>
                </div>
              </div>

              <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
                连不上先回“配置”点更新同步最新节点，再重选一个延迟低的节点，实在不行去互助专区问。
              </p>
            </div>
          </div>
        )}

        <SiteFooter />
      </main>

    </div>
  );
};

export default Accelerate;