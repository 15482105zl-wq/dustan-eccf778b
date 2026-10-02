import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";

const NICE_URL = "https://dustan.mmmoyou.com/#/register?code=0lc8ncSH";
const LVCHA_URL = "https://pan.quark.cn/s/1d9113e678f3";
const APP_DOWNLOAD_URL = "https://pxyfbbohoazbslneagix.supabase.co/storage/v1/object/public/downloads/DustanHub.apk";

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

// 3D 玻璃质感发光 - 绿叶机场 圆形图标
const LeafAirportIcon = () => (
  <div
    className="w-14 h-14 rounded-full relative flex items-center justify-center flex-shrink-0 overflow-hidden"
    style={{
      background: "radial-gradient(100% 100% at 30% 25%, #3bf087 0%, #00b84c 55%, #03481f 100%)",
      boxShadow: "0 0 20px rgba(0, 230, 118, 0.55), inset 0 1.5px 2px rgba(255, 255, 255, 0.75), inset 0 -3px 6px rgba(0, 0, 0, 0.45)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
    }}
  >
 <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 56 56">
      <defs>
        <linearGradient id="leafGradRound" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#d2ffe3" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#67fab0" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      <ellipse
        cx="28"
        cy="28"
        rx="22"
        ry="8.5"
        fill="none"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="1.2"
        transform="rotate(-25 28 28)"
        filter="drop-shadow(0 0 3px rgba(255,255,255,0.9))"
      />

      <path
        d="M37 15c-1 8-7 18-18 23 1-8 6-18 18-23z"
        fill="url(#leafGradRound)"
        filter="drop-shadow(0 4px 6px rgba(0, 50, 20, 0.4))"
      />
      <path
        d="M37 15c-8 6-13 13-18 23"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M19 38c-2 2-3 4-3 5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  </div>
);

const Accelerate = () => {
  const navigate = useNavigate();
  const [couponCopied, setCouponCopied] = useState(false);

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
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
          {/* 滚动公告：Nice 云 IPv4 阻断通知 */}
          <div className="overflow-hidden rounded-2xl border border-amber-300/25 bg-amber-400/[0.07] py-2.5">
            <style>{`@keyframes dustanNoticeScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
            <div
              className="flex whitespace-nowrap"
              style={{ width: "max-content", animation: "dustanNoticeScroll 24s linear infinite" }}
            >
              <span className="pr-16 text-xs text-amber-100/90">
                📢 公告：近期 IPv4 阻断较严重，WiFi 用户请开启路由器 IPv6 支持，或切换手机流量使用；流量也无法使用请重启手机。
              </span>
              <span className="pr-16 text-xs text-amber-100/90" aria-hidden="true">
                📢 公告：近期 IPv4 阻断较严重，WiFi 用户请开启路由器 IPv6 支持，或切换手机流量使用；流量也无法使用请重启手机。
              </span>
            </div>
          </div>
          {/* Nice·云 - 主力推荐 */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-[38px] p-6 flex flex-col relative bg-transparent border border-glass-border/40"
          >
            <div className="flex items-center gap-3.5 mb-3 mt-1">
              <NiceCloudIcon />
              <div>
                <h2 className="font-heading text-lg font-semibold" style
={{ color: "#f2f3fa" }}>
                  Nice·云
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  老牌机场 · 线路稳定 · 全球直连
                </p>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed flex-1 text-muted-foreground">
              主打一个"稳"字——内置防失联节点，主线路波动无感快速切换。SS/Hy2/Vmess协议，峰值10Gbps，流媒体一键解锁，适合追求速度和稳定的重度用户。
            </p>

            <button
              onClick={async () => {
                await copyText("nice888");
                setCouponCopied(true);
                setTimeout(() => setCouponCopied(false), 2000);
              }}
              className="mt-4 w-full rounded-full px-3 py-3 text-center text-xs font-bold inline-flex items-center justify-center gap-1.5 border border-white/10 bg-transparent transition-opacity hover:opacity-80"
            >
              {couponCopied ? (
                <>
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    已复制 nice888
                  </span>
                  <Check className="w-3.5 h-3.5 text-accent" />
                </>
              ) : (
                <>
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    7折优惠券：nice888
                  </span>
                  <Copy className="w-3.5 h-3.5 text-accent" />
                </>
              )}
            </button>

            <button
              onClick={() => window.open(NICE_URL, "_blank", "noopener,noreferrer")}
              className="mt-3 w-full rounded-full py-3 text-sm font-bold border border-white/10 bg-transparent transition-transform hover:scale-[1.02]"
              style={{ color: "#a855f7" }}
            >
              立即开始
            </button>
          </motion.div>

          {/* 绿叶机场 */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="bg-transparent rounded-2xl p-6 flex flex-col border border-glass-border/40"
          >
            <div className="flex items-center gap-3.5 mb-3">
              <LeafAirportIcon />
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">绿叶机场</h2>
                <p className="text-[11px] text-muted-foreground">永久免费 · 无广告 · 全自研</p>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground flex-1">
              主打一个"零门槛"——永久免费，不收费不弹广告。连接速度快，全球节点覆盖广，日常刷剧、玩游戏都能应付，适合不想折腾的轻度用户。
            </p>

            <button
              onClick={() => window.open(LVCHA_URL, "_blank", "noopener,noreferrer")}
              className="mt-4 w-full rounded-full py-3 text-sm font-bold border border-white/10 bg-transparent transition-transform hover:scale-[1.02]"
              style={{ color: "#a855f7" }}
            >
              免费下载
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
    </div>
  );
};

export default Accelerate;