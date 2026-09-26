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
          {/* Nice·云 - 主力推荐（云朵配色） */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-[38px] p-6 flex flex-col relative"
            style={{
              background: "#141225",
              border: "1px solid #2a2648",
            }}
          >
            <div className="flex items-center gap-3 mb-3 mt-1">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "#1d9bf0" }}
              >
                <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true">
                  <ellipse cx="24" cy="40" rx="14" ry="11" fill="#ffffff" />
                  <ellipse cx="40" cy="40" rx="16" ry="13" fill="#ffffff" />
                  <ellipse cx="32" cy="30" rx="13" ry="11" fill="#ffffff" />
                  <ellipse cx="20" cy="34" rx="9" ry="8" fill="#ffffff" />
                  <ellipse cx="46" cy="35" rx="8" ry="7" fill="#ffffff" />
                  <rect x="14" y="38" width="36" height="10" rx="5" fill="#ffffff" />
                </svg>
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold" style={{ color: "#f2f3fa" }}>
                  Nice·云
                </h2>
                <p className="text-[11px]" style={{ color: "#7bc4f5" }}>
                  老牌机场 · 线路稳定速度快
                </p>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed flex-1" style={{ color: "#7bc4f5" }}>
              全线路走中转、内置防失联节点，就算主线路波动也能快速切换。订单流量按日重置，SS/Hy2/Vmess多协议可选，最大10Gbps峰值带宽，多种流媒体一键解锁。
            </p>

            <button
              onClick={async () => {
                await copyText("nice888");
                setCouponCopied(true);
                setTimeout(() => setCouponCopied(false), 2000);
              }}
              className="mt-4 w-full rounded-full px-3 py-3 text-center text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-opacity hover:opacity-80"
              style={{ background: "#1c2b45", color: "#9cd4f7" }}
            >
              {couponCopied ? (
                <>
                  已复制 nice888 <Check className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  7折优惠券：nice888 <Copy className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <button
              onClick={() => window.open(NICE_URL, "_blank", "noopener,noreferrer")}
              className="mt-3 w-full rounded-full py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
              style={{ background: "#1d9bf0" }}
            >
              立即开始
            </button>
          </motion.div>

          {/* 绿叶机场 */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="glass rounded-2xl p-6 flex flex-col border-primary/30"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
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
              className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.45)] transition-transform hover:scale-[1.02]"
            >
              免费下载
            </button>
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