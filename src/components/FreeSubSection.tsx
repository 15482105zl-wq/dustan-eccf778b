import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthGateModal from "@/components/AuthGateModal";

const CLAIM_URL =
  "https://itjzihpbuodcdkmyssrk.supabase.co/functions/v1/free-sub/claim";
const STATUS_URL =
  "https://itjzihpbuodcdkmyssrk.supabase.co/functions/v1/free-sub/status";
const COPY_URL =
  "https://itjzihpbuodcdkmyssrk.supabase.co/functions/v1/free-sub/copy";
const STATS_URL =
  "https://itjzihpbuodcdkmyssrk.supabase.co/functions/v1/free-sub/stats";
const FLCLASH_APK_URL =
  "https://wwwa.qyshare.com:2083/s/nujcn8";
const FLCLASH_FOLDER_URL = "https://wwwa.qyshare.com/s/3vfjoi";

// 正式版文案（boss 定稿，逐字使用）
const NOTICE_LINE_1 =
  "免费订阅每月 1 号到期，到期后请回到本站重新领取新的订阅链接，即可继续使用。";
const NOTICE_LINE_2 =
  "免费节点的数量与速度可能不太稳定，但可满足日常使用需求；如需长期稳定、不间断的服务，可以了解上方专线机场。";
// 功能性事实说明（非定稿，正式措辞）
const LIMIT_LINE = "登录即可免费领取";
// 重复领取时的正式说明
const ALREADY_NOTE = "本月已领取过 这是您的当月链接";
// 通用失败提示（与函数 500 文案一致，正式措辞）
const GENERIC_FAIL = "领取失败，请稍后再试，感谢您的理解。";

// 代理图标：同上面星辰/Nice云的 3D 玻璃质感圆图标，尺寸小一号 (w-12 vs w-14)
const LiuyunIcon = () => (
  <div
    className="w-10 h-10 rounded-full relative flex items-center justify-center flex-shrink-0 overflow-hidden"
    style={{
      background: "radial-gradient(100% 100% at 30% 25%, #e879f9 0%, #a855f7 55%, #3b0764 100%)",
      boxShadow: "0 0 20px rgba(168, 85, 247, 0.55), inset 0 1.5px 2px rgba(255, 255, 255, 0.75), inset 0 -3px 6px rgba(0, 0, 0, 0.45)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
    }}
  >
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r="20" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" strokeDasharray="3 3" />
      <circle cx="10" cy="22" r="1.3" fill="#ffffff" filter="drop-shadow(0 0 2px #fff)" />
      <circle cx="44" cy="20" r="1.5" fill="#ffffff" filter="drop-shadow(0 0 2px #fff)" />
      <g filter="drop-shadow(0 4px 8px rgba(59, 7, 100, 0.5))" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 30a6 6 0 0 1 1.8-11.8A8 8 0 0 1 35.5 20a6.5 6.5 0 0 1-1.5 12H20a4.5 4.5 0 0 1-2-2z" />
        <path d="M18 38q5-3.5 10 0t10 0" opacity="0.75" strokeWidth="1.8" />
        <path d="M22 44q5-3.5 10 0" opacity="0.55" strokeWidth="1.8" />
      </g>
    </svg>
  </div>
);

const JifengIcon = () => (
  <div
    className="w-10 h-10 rounded-full relative flex items-center justify-center flex-shrink-0 overflow-hidden"
    style={{
      background: "radial-gradient(100% 100% at 30% 25%, #4ade80 0%, #16a34a 55%, #052e16 100%)",
      boxShadow: "0 0 20px rgba(34, 197, 94, 0.55), inset 0 1.5px 2px rgba(255, 255, 255, 0.75), inset 0 -3px 6px rgba(0, 0, 0, 0.45)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
    }}
  >
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 56 56">
      <defs>
        <linearGradient id="jifengWindShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#dcfce7" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <circle cx="28" cy="28" r="20" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" strokeDasharray="3 3" />
      <circle cx="10" cy="24" r="1.3" fill="#ffffff" filter="drop-shadow(0 0 2px #fff)" />
      <circle cx="41" cy="18" r="1.5" fill="#ffffff" filter="drop-shadow(0 0 2px #fff)" />
      <circle cx="44" cy="35" r="1.2" fill="#ffffff" filter="drop-shadow(0 0 2px #fff)" />
      <g filter="drop-shadow(0 4px 8px rgba(5, 46, 22, 0.5))" fill="none" stroke="url(#jifengWindShine)" strokeWidth="3.2" strokeLinecap="round">
        <path d="M12 22h22a4 4 0 1 0-4-8" />
        <path d="M10 30h30a5 5 0 1 1-5 10" />
        <path d="M14 38h18a3.5 3.5 0 1 1-3.5 7" />
      </g>
    </svg>
  </div>
);

const FreeSubSection = () => {
  const { user, session, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [claiming, setClaiming] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [subLink, setSubLink] = useState("");
  const [subLinkJifeng, setSubLinkJifeng] = useState("");
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [showTutorial, setShowTutorial] = useState(false);
  const [displayCount, setDisplayCount] = useState<number | null>(null);

  // 下次访问直接显示已领内容: 登录后查当月领取状态, 已领就直接显示链接, 不再显示领取按钮.
  // 换号登录时先清掉旧链接, 再按新号状态显示, 不串号.
  // 查状态是异步的, 查完之前不显示领取按钮, 改显示加载中, 避免按钮闪一下又消失.
  useEffect(() => {
    const token = session?.access_token;
    if (!user || !token) {
      setSubLink("");
      setSubLinkJifeng("");
      setAlreadyClaimed(false);
      setStatusLoading(false);
      return;
    }
    let cancelled = false;
    setStatusLoading(true);
    void (async () => {
      try {
        const res = await fetch(STATUS_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => null);
        if (!cancelled && res.ok && (data as any)?.claimed && (data as any)?.link) {
          setSubLink((data as any).link);
          setSubLinkJifeng((data as any).link_jifeng || "");
          setAlreadyClaimed(true);
        }
      } catch {
        // 状态读不到就留在领取按钮, 不报错挡路
      } finally {
        if (!cancelled) setStatusLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, session]);

  // 领取人数展示数公开读 (1725 + 真实去重复制人数), 读不到就不显示, 不挡领取.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(STATS_URL);
        const data = await res.json().catch(() => null);
        if (
          !cancelled &&
          res.ok &&
          typeof (data as any)?.display_count === "number"
        ) {
          setDisplayCount((data as any).display_count);
        }
      } catch {
        // 读不到就不显示人数, 不挡领取
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClaim = async () => {
    const { data: { session: freshSession } } = await supabase.auth.getSession();
    const token = freshSession?.access_token;
    if (!freshSession?.user || !token) {
      // 未登录：沿用旧范式弹登录框，并展示 401 正式文案
      setShowAuthGate(true);
      toast({
        title: "请先登录后再领取免费订阅，感谢您的理解。",
        variant: "destructive",
      });
      return;
    }
    setClaiming(true);
    setErrorText("");
    try {
      const res = await fetch(CLAIM_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401) {
        // 登录失效：弹登录框，并原样展示函数返回的 401 文案
        setShowAuthGate(true);
        toast({
          title:
            (data as any)?.error ||
            "请先登录后再领取免费订阅，感谢您的理解。",
          variant: "destructive",
        });
        return;
      }
      if (!res.ok || !(data as any)?.link) {
        setErrorText(GENERIC_FAIL);
        toast({ title: GENERIC_FAIL, variant: "destructive" });
        return;
      }
      setSubLink((data as any).link);
      setSubLinkJifeng((data as any).link_jifeng || "");
      setAlreadyClaimed(!!(data as any).already_claimed);
      toast({
        title: (data as any).already_claimed ? "本月已领取" : "领取成功",
      });
    } catch {
      setErrorText(GENERIC_FAIL);
      toast({ title: GENERIC_FAIL, variant: "destructive" });
    } finally {
      setClaiming(false);
    }
  };

  const copySubLink = async (linkToCopy?: string) => {
    try {
      await navigator.clipboard.writeText(linkToCopy ?? subLink);
      toast({ title: "订阅链接已复制" });
      // 复制成功才记一次 (一人多次复制只算一次, 后端去重); 记数失败不影响复制结果.
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      const token = freshSession?.access_token;
      if (freshSession?.user && token) {
        try {
          await fetch(COPY_URL, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          const res = await fetch(STATS_URL);
          const data = await res.json().catch(() => null);
          if (res.ok && typeof (data as any)?.display_count === "number") {
            setDisplayCount((data as any).display_count);
          }
        } catch {
          // 记数失败不打扰用户
        }
      }
    } catch {
      toast({ title: "复制失败，请手动长按复制", variant: "destructive" });
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        className="rounded-[38px] p-6 flex flex-col relative bg-transparent border border-glass-border/40"
      >
        <div className="flex items-center gap-3.5 mb-3 mt-1">
          <div
            className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-5xl leading-none"
            style={{
              background: "rgba(168,85,247,0.14)",
              boxShadow: "0 0 20px rgba(168,85,247,0.35)",
              color: "#a855f7",
            }}
          >
            🎁
          </div>
          <div>
            <h2
              className="font-heading text-lg font-semibold"
              style={{ color: "#f2f3fa" }}
            >
              免费订阅
            </h2>
            <p className="text-[11px] text-muted-foreground">
              每月 1 号到期 · 登录免费领
            </p>
          </div>
        </div>
        <p className="text-[13px] leading-relaxed flex-1 text-muted-foreground">
          {NOTICE_LINE_1}
          <br />
          {NOTICE_LINE_2}
        </p>
        {/* 已领过就不再显示“登录即可免费领取”, 避免和“本月已领取过”自相矛盾 */}
        {!subLink && (
          <p className="mt-2 w-full text-[13px] leading-relaxed font-semibold text-center" style={{ background: "linear-gradient(90deg,#22d3ee,#6d7bff,#d946ef)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", filter: "drop-shadow(0 0 8px rgba(109,123,255,0.4))" }}>
            {LIMIT_LINE}
          </p>
        )}
        {displayCount !== null && (
          <p className="mt-2 w-full text-[13px] font-semibold text-center" style={{ color: "#7c3aed" }}>
            已有 {displayCount} 人领取
          </p>
        )}

        {!subLink ? (
          <>
            {(authLoading || statusLoading) ? (
              <button
                disabled
                className="mt-4 w-full rounded-full py-3 text-sm font-bold text-center border border-white/10 bg-transparent disabled:opacity-50"
                style={{ color: "#a855f7" }}
              >
                加载中…
              </button>
            ) : (
              <button
                onClick={() => void handleClaim()}
                disabled={claiming}
                className="mt-4 w-full rounded-full py-3 text-sm font-bold text-center border border-white/10 bg-transparent transition-transform hover:scale-[1.02] disabled:opacity-50"
                style={{ color: "#a855f7" }}
              >
                {claiming ? "领取中…" : "领取本月订阅链接"}
              </button>
            )}
            {errorText && (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {errorText}
              </p>
            )}
          </>
        ) : (
          <div className="mt-3">
            {alreadyClaimed && (
              <p className="w-full text-xs text-muted-foreground text-center mb-2">
                {ALREADY_NOTE}
              </p>
            )}
            <p className="w-full text-xs text-muted-foreground text-center mb-2">
              两个链接任选导入即可
            </p>
            <p className="flex items-center gap-2.5 text-base font-semibold mb-1" style={{ color: "#f2f3fa" }}>
              <LiuyunIcon />
              流云代理（节点多，更新快）
            </p>
            <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 mb-2">
              <code className="block text-[11px] text-muted-foreground break-all select-all">
                {subLink}
              </code>
            </div>
            <button
              onClick={() => void copySubLink(subLink)}
              className="w-full rounded-full py-2.5 text-sm font-bold mb-3"
              style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}
            >
              复制流云链接
            </button>
            {subLinkJifeng && (
              <>
                <p className="flex items-center gap-2.5 text-base font-semibold mb-1" style={{ color: "#f2f3fa" }}>
                  <JifengIcon />
                  疾风代理（无波动，速度快）
                </p>
                <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 mb-2">
                  <code className="block text-[11px] text-muted-foreground break-all select-all">
                    {subLinkJifeng}
                  </code>
                </div>
                <button
                  onClick={() => void copySubLink(subLinkJifeng)}
                  className="w-full rounded-full py-2.5 text-sm font-bold"
                  style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}
                >
                  复制疾风链接
                </button>
              </>
            )}
            <button
              onClick={() => setShowTutorial(true)}
              className="mt-2 w-full rounded-full py-3 text-sm font-bold border border-white/10 bg-transparent transition-transform hover:scale-[1.02]"
              style={{ color: "#a855f7" }}
            >
              查看使用教程
            </button>
          </div>
        )}
      </motion.div>

      <AuthGateModal open={showAuthGate} onOpenChange={setShowAuthGate} />

      {/* 免费订阅使用教程：2026-10-27 晚 boss 定扩写，含更新节点、测速选节点、仪表盘启动 */}
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
              <h3
                className="font-heading text-base font-semibold"
                style={{ color: "#f2f3fa" }}
              >
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
              <div
                className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                style={{ background: "#a855f7", color: "#fff" }}
              >
                1
              </div>
              <div className="flex-1">
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: "#f2f3fa" }}
                >
                  下载客户端
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  如果下载速度不稳，请使用备用下载。
                </p>
                <a
                  href={FLCLASH_APK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-full px-5 py-2.5 text-sm font-bold"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                    color: "#fff",
                  }}
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
              <div
                className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                style={{ background: "#a855f7", color: "#fff" }}
              >
                2
              </div>
              <div className="flex-1">
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: "#f2f3fa" }}
                >
                  复制订阅链接
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  两个链接任选导入即可。
                </p>
                <p className="flex items-center gap-2.5 text-base font-semibold mb-1" style={{ color: "#f2f3fa" }}>
                  <LiuyunIcon />
                  流云代理
                </p>
                <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 mb-2">
                  <code className="block text-[11px] text-muted-foreground break-all select-all">
                    {subLink}
                  </code>
                </div>
                <button
                  onClick={() => void copySubLink(subLink)}
                  className="w-full rounded-full py-2.5 text-sm font-bold mb-3"
                  style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}
                >
                  复制流云链接
                </button>
                {subLinkJifeng && (
                  <>
                    <p className="flex items-center gap-2.5 text-base font-semibold mb-1" style={{ color: "#f2f3fa" }}>
                      <JifengIcon />
                      疾风代理
                    </p>
                    <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 mb-2">
                      <code className="block text-[11px] text-muted-foreground break-all select-all">
                        {subLinkJifeng}
                      </code>
                    </div>
                    <button
                      onClick={() => void copySubLink(subLinkJifeng)}
                      className="w-full rounded-full py-2.5 text-sm font-bold"
                      style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}
                    >
                      复制疾风链接
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 mb-5">
              <div
                className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                style={{ background: "#a855f7", color: "#fff" }}
              >
                3
              </div>
              <div className="flex-1">
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: "#f2f3fa" }}
                >
                  导入订阅并更新
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  打开 FLClash，点下方“配置” → 点“+”添加配置 → 选“URL”
                  → 粘贴订阅链接 → 点提交，然后点“更新”刷新订阅
                </p>
              </div>
            </div>

            <div className="flex gap-3 mb-5">
              <div
                className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                style={{ background: "#a855f7", color: "#fff" }}
              >
                4
              </div>
              <div className="flex-1">
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: "#f2f3fa" }}
                >
                  自动选择最快节点
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  默认走自动选择，不用手动挑：客户端每 5 分钟自动测速，用延迟最低的节点。点下方“代理”，点测速，看各节点延迟；想自己挑，就切到手动选择，再点延迟低的节点，点中的会打勾。
                </p>
              </div>
            </div>

            <div className="flex gap-3 mb-5">
              <div
                className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                style={{ background: "#a855f7", color: "#fff" }}
              >
                5
              </div>
              <div className="flex-1">
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: "#f2f3fa" }}
                >
                  回到仪表盘，开启代理
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  选好节点后，点下方“仪表盘”，点启动，显示已连接就能用了。
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div
                className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                style={{ background: "#a855f7", color: "#fff" }}
              >
                6
              </div>
              <div className="flex-1">
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: "#f2f3fa" }}
                >
                  连不上先更新节点
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  如果连不上、打不开网页，别急着换软件：先回到下方“配置”，点更新同步最新节点（免费节点会不定期更换，旧节点失效就连不上），更新完再去“代理”测速重选一个延迟低的节点，再回“仪表盘”启动。
                </p>
              </div>
            </div>

            <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
              {NOTICE_LINE_1}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default FreeSubSection;
