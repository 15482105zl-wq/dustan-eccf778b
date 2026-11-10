import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

/**
 * 谷歌登录弹窗回跳页。
 *
 * 只显示“登录中…”，无导航栏。Supabase 客户端自动用 code 换会话；
 * 拿到会话后：是弹窗就 window.close()，等 500ms 页面还在且有 opener
 * 就显示“登录成功，请返回”加一个“返回”按钮（点返回再试一次 close，
 * 还关不掉就跳回首页）；无 opener（弹窗被拦截、整页跳回的主标签页）
 * 则清掉 oauth_return 标记 → 把地址改成 "/"（去掉 code 和 state）
 * → window.location.reload() 真刷新一次，清掉 Chrome 从谷歌带过来的
 * 桌面版宽度。弹窗分支不动。
 * 8 秒超时显示失败，不循环重载。
 */
const AuthCallback = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [timedOut, setTimedOut] = useState(false);
  const [showReturn, setShowReturn] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setTimedOut(true), 8000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading || !user) return;
    if (window.opener) {
      // 弹窗：先试着关；等 500ms 页面还在（关不掉）就显示“返回”按钮
      try {
        window.close();
      } catch {
        /* ignore */
      }
      const t = window.setTimeout(() => {
        if (window.opener) setShowReturn(true);
      }, 500);
      return () => window.clearTimeout(t);
    } else {
      // 整页跳回的主标签页：清标记 → 把地址改成 "/"（去掉 code 和 state）
      // → 真刷新一次，清掉 Chrome 从谷歌带过来的桌面版宽度。
      // 注意：这里不能只用 navigate("/")，那是前端路由跳转，AuthProvider
      // 不重新挂载，onAuthStateChange 不会再触发，useAuth 的重载兜底
      // 永远执行不到，oauth_return 标记也会一直留在 sessionStorage。
      try {
        sessionStorage.removeItem("oauth_return");
      } catch {}
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        url.searchParams.delete("state");
        url.hash = "";
        window.history.replaceState(null, "", url.pathname + url.search);
      } catch {}
      window.location.reload();
    }
  }, [user, loading, navigate]);

  const handleReturn = () => {
    // 再试一次关弹窗；还关不掉就跳回首页
    try {
      window.close();
    } catch {
      /* ignore */
    }
    window.setTimeout(() => {
      navigate("/", { replace: true });
    }, 300);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground px-6">
      {showReturn ? (
        <>
          <p className="text-sm text-muted-foreground text-center">登录成功，请返回</p>
          <Button onClick={handleReturn} variant="outline">
            返回
          </Button>
        </>
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
