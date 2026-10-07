import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import AiChatModal from "@/components/AiChatModal";

// D助手专属聊天页：整页直接展开 AiChatModal（与全站悬浮按钮同一组件、
// 同一会话 localStorage dustan_ai_session、同一 Worker 后端）。
// 关闭聊天窗口时返回上一页，没有上一页时回到首页。
const Ai = () => {
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <>
      <SEO title="D助手｜Dustan Hub" description="D助手 AI 聊天" path="/ai" />
      <AiChatModal open onOpenChange={handleClose} />
    </>
  );
};

export default Ai;
