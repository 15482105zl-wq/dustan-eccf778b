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
import AuthGateModal from "@/components/AuthGateModal";

const YUETONG_URL = "https://app.xn--jdu596h.com/#/register?code=OkGae8Qp";
const FLCLASH_APK_URL = "https://qxtecefxbtcukpuizvzb.supabase.co/storage/v1/object/public/downloads/FLClash-0.8.93-android-arm64-v8a.apk";
const APP_DOWNLOAD_URL = "https://pxyfbbohoazbslneagix.supabase.co/storage/v1/object/public/downloads/DustanHub.apk";

const NOTICE_SLOT = "accelerate_marquee";
// 公告图标固定写在代码里（换图标跟助手说）；文字走数据库，编辑按钮可改；默认文案保证打开即显示
const NOTICE_ICON = "📢";
const DEFAULT_NOTICE = "悦享中秋：悦通全场7折+下单博饼赢最高¥100现金红包，10月7日23:59结束";

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
  const { isAdmin, user } = useAuth();
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

  // ---- 免费体验装 ----
  const [trialStatus, setTrialStatus] = useState<any>(null);
  const [trialUrl, setTrialUrl] = useState<string>("");
  const [claiming, setClaiming] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const loadTrialStatus = async () => {
    try {
      const { data } = await supabase.rpc("trial_status");
      const st = data as any;
      setTrialStatus(st);
      // 已领过的人直接取回链接，方便刷新后查看（不消耗名额）
      if (st?.ok && st.claimed) {
        const { data: cdata } = await supabase.rpc("claim_trial");
        if ((cdata as any)?.ok) setTrialUrl((cdata as any).sub_url || "");
      } else {
        setTrialUrl("");
      }
    } catch {
      /* 接口异常时不打扰 */
    }
  };

  useEffect(() => {
    loadTrialStatus();
  }, [user]);

  const handleClaim = async () => {
    if (!user) {
      setShowAuthGate(true);
      return;
    }
    setClaiming(true);
    try {
      const { data } = await supabase.rpc("claim_trial");
      const r = data as any;
      if (!r?.ok) {
        toast({
          title: r?.error === "sold_out" ? "本月名额已领完，下个月再来" : "领取失败，稍后再试",
          variant: "destructive",
        });
        loadTrialStatus();
        return;
      }
      setTrialUrl(r.sub_url || "");
      toast({ title: r.already ? "本月已领取" : "领取成功 🎉" });
      loadTrialStatus();
      // 领取成功（或已领过）直接弹出教程
      setShowTutorial(true);
    } catch (err: any) {
      toast({ title: "领取失败", description: err?.message || "网络异常", variant: "destructive" });
    } finally {
      setClaiming(false);
    }
  };

  const copyTrialUrl = async () => {
    try {
      await navigator.clipboard.writeText(trialUrl);
      toast({ title: "订阅链接已复制" });
    } catch {
      toast({ title: "复制失败，请手动长按复制", variant: "destructive" });
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
              <span className="text-xs text-amber-100/90">{NOTICE_ICON} {noticeText}</span>
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
          {/* 免费体验装 */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="rounded-[38px] p-6 flex flex-col relative bg-transparent border border-glass-border/40"
          >
            <div className="flex items-center gap-3.5 mb-3 mt-1">
              <div
                className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-[28px]"
                style={{ background: "rgba(168,85,247,0.14)", boxShadow: "0 0 20px rgba(168,85,247,0.35)" }}
              >
                🎁
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold" style={{ color: "#f2f3fa" }}>
                  免费体验装
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  小机场 · 每月200G大家分 · 日常够用
                </p>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed flex-1 text-muted-foreground">
              追剧看片悠着用——流量烧完连不上不是坏了，是该升级了。每月15个名额，先到先得，每人每月限领一次。
            </p>

            {trialStatus?.ok ? (
              <>
                {!trialUrl ? (
                  <>
                    <p className="mt-3 text-xs text-muted-foreground">
                      本月剩余 <span style={{ color: "#a855f7" }} className="font-bold">{trialStatus.slots_left}</span> / {trialStatus.slots_total} 个名额
                    </p>
                    <button
                      onClick={handleClaim}
                      disabled={claiming || trialStatus.slots_left <= 0}
                      className="mt-3 w-full rounded-full py-3 text-sm font-bold border border-white/10 bg-transparent transition-transform hover:scale-[1.02] disabled:opacity-50"
                      style={{ color: "#a855f7" }}
                    >
                      {trialStatus.slots_left <= 0 ? "本月名额已领完" : claiming ? "领取中…" : "领取体验装"}
                    </button>
                  </>
                ) : (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">本月已领取，教程里有客户端下载和订阅链接：</p>
                    <button
                      onClick={() => setShowTutorial(true)}
                      className="w-full rounded-full py-3 text-sm font-bold border border-white/10 bg-transparent transition-transform hover:scale-[1.02]"
                      style={{ color: "#a855f7" }}
                    >
                      查看使用教程
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">本月体验装筹备中，敬请期待</p>
            )}

            <button
              onClick={() => window.open(YUETONG_URL, "_blank", "noopener,noreferrer")}
              className="mt-4 w-full rounded-full py-3 text-sm font-bold transition-transform hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff" }}
            >
              流量不够用？一步到位用高性能的悦通
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
      <AuthGateModal open={showAuthGate} onOpenChange={setShowAuthGate} />
      {/* 免费体验装使用教程 */}
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
              <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: "#a855f7", color: "#fff" }}>1</div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1" style={{ color: "#f2f3fa" }}>下载客户端</p>
                <p className="text-xs text-muted-foreground mb-2">FLClash（安卓版约50MB），安装时允许"安装未知应用"</p>
                <a
                  href={FLCLASH_APK_URL}
                  className="inline-block rounded-full px-5 py-2.5 text-sm font-bold"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff" }}
                >
                  下载 FLClash
                </a>
              </div>
            </div>

            <div className="flex gap-3 mb-5">
              <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: "#a855f7", color: "#fff" }}>2</div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1" style={{ color: "#f2f3fa" }}>复制订阅链接</p>
                <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 mb-2">
                  <code className="block text-[11px] text-muted-foreground break-all select-all">{trialUrl}</code>
                </div>
                <button
                  onClick={copyTrialUrl}
                  className="w-full rounded-full py-2.5 text-sm font-bold"
                  style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}
                >
                  复制订阅链接
                </button>
              </div>
            </div>

            <div className="flex gap-3 mb-5">
              <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: "#a855f7", color: "#fff" }}>3</div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1" style={{ color: "#f2f3fa" }}>导入订阅</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  打开 FLClash，点下方"配置" → 点"+"添加配置 → 选"URL" → 粘贴订阅链接 → 点提交
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: "#a855f7", color: "#fff" }}>4</div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1" style={{ color: "#f2f3fa" }}>选择节点并连接</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  点下方"代理"，选一个节点，打开开关就能用了。流量烧完连不上是正常的——想要一直稳定，就去用高性能的悦通
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accelerate;