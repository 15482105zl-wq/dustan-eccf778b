import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import SEO from "@/components/SEO";

const Selfcheck = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <SEO title="人生自查问卷" description="81道自查题，测测你的人生地基牢不牢" path="/selfcheck" noindex />

      {/* 顶部栏：标题 + 关闭按钮 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <h1 className="font-bold text-base text-gray-900">人生自查问卷</h1>
        <button
          onClick={() => navigate("/vip")}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="关闭"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* 问卷全屏 */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src="/selfcheck.html"
          title="人生自查问卷"
          className="w-full h-full"
          style={{ border: "none", background: "#fff" }}
        />
      </div>

      {/* 底部署名条 */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 shrink-0 text-center">
        <p className="text-[11px] text-gray-500 leading-relaxed">
          内容来源：<a href="https://github.com/eternity4719/HowToLiveBetter" target="_blank" rel="noopener noreferrer" className="underline">eternity4719/HowToLiveBetter</a>（CC-BY-4.0）· 本问卷由 Dustan Hub 提供
        </p>
      </div>
    </div>
  );
};

export default Selfcheck;
