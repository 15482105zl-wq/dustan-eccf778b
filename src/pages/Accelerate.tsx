import { useNavigate } from "react-router-dom";
import { ArrowLeft, Leaf, Zap, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";

const NICE_URL = "https://dustan.mmmoyou.com/#/register?code=0lc8ncSH";
const LVCHA_URL = "https://pan.quark.cn/s/1d9113e678f3";

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
      <main className="relative z-10 flex flex-col items-center px-4 py-10">
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
          {/* Nice云 - 主力推荐 */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="glass rounded-2xl p-6 flex flex-col relative border-accent/30 animate-breathe-glow"
          >
            <div className="absolute -top-3 right-5 text-[10px] font-bold px-3 py-1 rounded-full bg-accent text-accent-foreground">
              🔥 主力推荐
            </div>
            <div className="flex items-center gap-3 mb-3 mt-1">
              <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">Nice云</h2>
                <p className="text-[11px] text-accent">老牌机场 · 线路稳定速度快</p>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground flex-1">
              老牌机场，线路稳定速度快，全线路走中转、内置防失联节点，就算主线路波动也能快速切换。订单流量按日重置，SS/Hy2/Vmess多协议可选，最大10Gbps峰值带宽，多种流媒体一键解锁。
            </p>

            <button
              onClick={async () => {
                await copyText("nice888");
                setCouponCopied(true);
                setTimeout(() => setCouponCopied(false), 2000);
              }}
              className="mt-4 w-full rounded-xl bg-accent/15 px-3 py-2 text-center text-xs font-semibold text-accent inline-flex items-center justify-center gap-1.5 transition-opacity hover:opacity-80"
            >
              {couponCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> 已复制 nice888
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> 7折优惠券：nice888
                </>
              )}
            </button>

            <button
              onClick={() => window.open(NICE_URL, "_blank", "noopener,noreferrer")}
              className="mt-3 w-full rounded-full bg-accent py-3 text-sm font-bold text-accent-foreground shadow-[0_0_24px_hsl(var(--accent)/0.45)] transition-transform hover:scale-[1.02]"
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