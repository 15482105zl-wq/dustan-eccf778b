import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import SEO from "@/components/SEO";
import UserNav from "@/components/UserNav";

const Selfcheck = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative flex flex-col">
      <SEO title="人生自查问卷" description="81道自查题，测测你的人生地基牢不牢" path="/selfcheck" noindex />
      <ParticleBackground />
      <main className="relative z-10 flex flex-col items-center px-4 pt-5 pb-8 flex-1">
        <div className="w-full max-w-4xl flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/vip")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <UserNav />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-1">
            <span className="gradient-text glow-text">人生自查问卷</span>
          </h1>
          <p className="text-muted-foreground text-xs">81 道题 · 10 个维度 · 测测你的人生地基牢不牢</p>
        </motion.div>

        <div className="w-full max-w-4xl flex-1 rounded-2xl overflow-hidden border border-glass-border/40" style={{ minHeight: "70vh" }}>
          <iframe
            src="/selfcheck.html"
            title="人生自查问卷"
            className="w-full h-full"
            style={{ minHeight: "70vh", border: "none", background: "#fff" }}
          />
        </div>

        <div className="w-full max-w-4xl mt-6 text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            对结果有疑问？不知道先从哪件做起？点右下角 <span style={{ color: "#a855f7" }}>D助手</span> 问我
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-3 leading-relaxed">
            内容来源：<a href="https://github.com/eternity4719/HowToLiveBetter" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">eternity4719/HowToLiveBetter</a>（CC-BY-4.0）
            <br />
            想看完整指南 → <a href="https://eternity4719.github.io/HowToLiveBetter/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">原作者在线版</a>
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-2">
            本问卷由 Dustan Hub 提供
          </p>
        </div>
      </main>
    </div>
  );
};

export default Selfcheck;
