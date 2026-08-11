import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check, ExternalLink } from "lucide-react";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";

const INVITE_URL = "https://kitty.fo/register?invite=110BKHP4";
const COUNTDOWN_SECONDS = 5;

const Invite = () => {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      window.location.href = INVITE_URL;
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(INVITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // 部分浏览器不支持 clipboard API， fallback 选中复制
      const textArea = document.createElement("textarea");
      textArea.value = INVITE_URL;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen relative">
      <SEO
        title="邀请跳转中 · Dustan Hub"
        description="正在前往 Kitty Network 注册邀请页面..."
        path="/invite"
        noindex
      />
      <ParticleBackground />

      <main className="relative z-10 flex flex-col items-center px-4 py-8 min-h-screen">
        <div className="w-full max-w-2xl flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 返回首页
          </button>
          <UserNav />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full glass rounded-2xl p-8 sm:p-10 border border-accent/30 text-center animate-breathe-glow"
          >
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/40 text-xs text-accent mb-4">
                <ExternalLink className="w-3 h-3" /> 外部注册邀请
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">
                <span className="gradient-text glow-text">即将跳转</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                倒计时结束后将自动前往 Kitty Network
              </p>
            </div>

            <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-accent/20" />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <div className="text-center">
                <span className="font-heading text-4xl font-bold text-foreground block">
                  {secondsLeft}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">秒</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">目标链接</p>
              <div className="text-sm text-accent break-all bg-accent/10 border border-accent/20 rounded-lg px-4 py-3">
                {INVITE_URL}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                copied
                  ? "bg-green-500/20 text-green-400 border border-green-500/40"
                  : "bg-accent text-accent-foreground shadow-[0_0_24px_hsl(var(--accent)/0.4)] hover:shadow-[0_0_36px_hsl(var(--accent)/0.55)]"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> 已复制，请在浏览器中打开
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> 复制链接，浏览器打开
                </>
              )}
            </button>

            <p className="mt-6 text-xs text-muted-foreground">
              {secondsLeft > 0
                ? `${secondsLeft} 秒后自动跳转...`
                : "正在跳转..."}
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Invite;
