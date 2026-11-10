import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * 谷歌登录弹窗回跳页。
 *
 * 只显示“登录中…”，无导航栏。Supabase 客户端自动用 code 换会话；
 * 拿到会话后：是弹窗就 window.close()，关不掉且有 opener 时显示
 * “登录成功，请关闭此页返回”；无 opener（弹窗被拦截、整页跳回的
 * 主标签页）则跳回首页，useAuth 的重载兜底在首页触发。
 * 8 秒超时显示失败，不循环重载。
 */
const AuthCallback = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [timedOut, setTimedOut] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setTimedOut(true), 8000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading || !user) return;
    if (window.opener) {
      // 弹窗：关掉；关不掉时提示用户手动关
      try {
        window.close();
      } catch {
        /* ignore */
      }
      setClosed(true);
    } else {
      // 整页跳回的主标签页：回首页（useAuth 重载兜底在首页触发）
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground px-6">
      {closed ? (
        <p className="text-sm text-muted-foreground text-center">登录成功，请关闭此页返回</p>
      ) : timedOut ? (
        <p className="text-sm text-muted-foreground text-center">登录失败，请关闭此页重试</p>
      ) : (
        <>
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">登录中…</p>
        </>
      )}
    </main>
  );
};

export default AuthCallback;
