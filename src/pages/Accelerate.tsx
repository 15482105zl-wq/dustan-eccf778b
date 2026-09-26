import { useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";

const NICE_URL = "https://dustan.mmmoyou.com/#/register?code=0lc8ncSH";
const LVCHA_URL = "https://pan.quark.cn/s/1d9113e678f3";
const APP_DOWNLOAD_URL = "https://pxyfbbohoazbslneagix.supabase.co/storage/v1/object/public/downloads/DustanHub.apk";

const scanlineStyle = {
  backgroundImage:
    "repeating-linear-gradient(to bottom, #000000 0px, #000000 2px, #060606 2px, #060606 4px)",
};

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

        <div className="w-full max-w-4xl flex flex-col gap-4 font-mono">
          {/* Nice·云 - 黑科技风，青色主题 */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative rounded overflow-hidden p-6"
            style={{ background: "#000000", border: "1px solid #00e5ff" }}
          >
            <div className="absolute inset-0 opacity-70 pointer-events-none" style={scanlineStyle} />
            <svg width="26" height="26" viewBox="0 0 26 26" className="absolute top-0 left-0">
              <path d="M0 12 L0 0 L12 0" fill="none" stroke="#00e5ff" strokeWidth="2" />
            </svg>
            <svg width="26" height="26" viewBox="0 0 26 26" className="absolute bottom-0 right-0">
              <path d="M26 14 L26 26 L14 26" fill="none" stroke="#00e5ff" strokeWidth="2" />
            </svg>

            <div className="relative">
              <div className="flex justify-between items-center mb-3.5">
                <span className="text-[10px] tracking-wider" style={{ color: "#ffffff" }}>
                  // NODE_01
                </span>
                <span className="text-[10px]" style={{ color: "#ffffff" }}>
                  ● ONLINE
                </span>
              </div>

              <div className="flex items-center gap-3.5 mb-3.5">
                <div
                  className="w-[52px] h-[52px] flex items-center justify-center flex-shrink-0"
                  style={{ border: "1px solid #00e5ff", background: "#001014" }}
                >
                  <svg width="28" height="28" viewBox="0 0 64 64">
                    <ellipse cx="24" cy="40" rx="14" ry="11" fill="#ffffff" />
                    <ellipse cx="40" cy="40" rx="16" ry="13" fill="#ffffff" />
                    <ellipse cx="32" cy="30" rx="13" ry="11" fill="#ffffff" />
                    <ellipse cx="20" cy="34" rx="9" ry="8" fill="#ffffff" />
                    <ellipse cx="46" cy="35" rx="8" ry="7" fill="#ffffff" />
                    <rect x="14" y="38" width="36" height="10" rx="5" fill="#ffffff" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-wide" style={{ color: "#ffffff" }}>
                    NICE·云
                  </h2>
                  <p className="text-[10px] mt-1" style={{ color: "#8a939c" }}>
                    老牌机场_线路稳定_速度快
                  </p>
                </div>
              </div>

              <p className="text-[12px] leading-relaxed mb-4" style={{ color: "#8a939c" }}>
                全线路走中转、内置防失联节点，就算主线路波动也能快速切换。订单流量按日重置，SS/Hy2/Vmess多协议可选，最大10Gbps峰值带宽，多种流媒体一键解锁。
              </p>

              <button
                onClick={async () => {
                  await copyText("nice888");
                  setCouponCopied(true);
                  setTimeout(() => setCouponCopied(false), 2000);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 mb-3 text-[12px] transition-opacity hover:opacity-80"
                style={{ background: "#001014", border: "1px solid #00596b", color: "#ffffff" }}
              >
                {couponCopied ? (
                  <>
                    已复制 nice888 <Check className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    [7折] nice888 <Copy className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <button
                onClick={() => window.open(NICE_URL, "_blank", "noopener,noreferrer")}
                className="w-full h-[46px] text-[13px] font-bold tracking-wide transition-transform hover:scale-[1.01]"
                style={{ background: "#04080a", border: "1px solid #00e5ff", color: "#ffffff" }}
              >
                &gt; 立即开始_
              </button>
            </div>
          </motion.div>

          {/* 绿叶机场 - 黑科技风，绿色主题 */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="relative rounded overflow-hidden p-6"
            style={{ background: "#000000", border: "1px solid #00ff88" }}
          >
            <div className="absolute inset-0 opacity-70 pointer-events-none" style={scanlineStyle} />
            <svg width="26" height="26" viewBox="0 0 26 26" className="absolute top-0 left-0">
              <path d="M0 12 L0 0 L12 0" fill="none" stroke="#00ff88" strokeWidth="2" />
            </svg>
            <svg width="26" height="26" viewBox="0 0 26 26" className="absolute bottom-0 right-0">
              <path d="M26 14 L26 26 L14 26" fill="none" stroke="#00ff88" strokeWidth="2" />
            </svg>

            <div className="relative">
              <div className="flex justify-between items-center mb-3.5">
                <span className="text-[10px] tracking-wider" style={{ color: "#00ff88" }}>
                  // NODE_02
                </span>
                <span className="text-[10px]" style={{ color: "#00ff88" }}>
                  ● FREE
                </span>
              </div>

              <div className="flex items-center gap-3.5 mb-3.5">
                <div
                  className="w-[52px] h-[52px] flex items-center justify-center flex-shrink-0"
                  style={{ border: "1px solid #00ff88", background: "#001208" }}
                >
                  <Leaf className="w-6 h-6" style={{ color: "#00ff88" }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-wide" style={{ color: "#00ff88" }}>
                    绿叶机场
                  </h2>
                  <p className="text-[10px] mt-1" style={{ color: "#4d9169" }}>
                    永久免费_无广告_全自研
                  </p>
                </div>
              </div>

              <p className="text-[12px] leading-relaxed mb-4" style={{ color: "#6eaea0" }}>
                主打一个"零门槛"——永久免费，不收费不弹广告。连接速度快，全球节点覆盖广，日常刷剧、玩游戏都能应付，适合不想折腾的轻度用户。
              </p>

              <button
                onClick={() => window.open(LVCHA_URL, "_blank", "noopener,noreferrer")}
                className="w-full h-[46px] text-[13px] font-bold tracking-wide transition-transform hover:scale-[1.01]"
                style={{ background: "#04080a", border: "1px solid #00ff88", color: "#00ff88" }}
              >
                &gt; 免费下载_
              </button>
            </div>
          </motion.div>
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
    </div>
  );
};

export default Accelerate;