import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (userId: string) => {
    try {
      const { data } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // defer to avoid deadlock
        setTimeout(() => checkAdmin(s.user.id), 0);
        // 刚从谷歌登录回跳回来：真刷新一次。location.replace 是导航，清不掉
        // Chrome 从谷歌带过来的桌面版宽度；只有 location.reload() 真刷新才行。
        // 顺序：先清标记 → 用 replaceState 把 code/state/hash 从地址栏清掉
        // （不清 code 直接 reload 会重复换码）→ 再 reload。
        // 例外：在 /auth-callback 回跳页里不重载、不清标记：弹窗流程靠关弹窗
        // 完成；弹窗被拦截整页跳回时，回调页回首页后 INITIAL_SESSION 再触发
        // 重载兜底。
        try {
          if (sessionStorage.getItem("oauth_return") === "1" && window.location.pathname !== "/auth-callback") {
            sessionStorage.removeItem("oauth_return");
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete("code");
              url.searchParams.delete("state");
              url.hash = "";
              window.history.replaceState(null, "", url.pathname + url.search);
            } catch {}
            window.location.reload();
            return;
          }
        } catch {}
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) checkAdmin(s.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 回到页面时主动重读会话（弹窗登录完回主标签页、切标签页回来时同步
  // 用户态）。只同步不清除：有会话就同步，没会话不清除本地状态。
  useEffect(() => {
    const refreshSession = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (s?.user) {
          setSession(s);
          setUser(s.user);
          setTimeout(() => checkAdmin(s.user.id), 0);
        }
      } catch {
        /* ignore */
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refreshSession();
    };
    const onFocus = () => void refreshSession();
    const onPageShow = () => void refreshSession();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  const signOut = async () => {
    // Optimistically clear local state so UI never freezes
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("signOut error", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
