import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { translateAuthError } from "@/lib/authErrors";

interface UseGooglePopupLoginOpts {
  /** 登录成功后回调（主标签页拿到会话时触发） */
  onSuccess?: () => void;
}

/**
 * 谷歌登录弹窗共用 hook。
 *
 * 根因：谷歌“选择账号”页一旦在主标签页渲染，Chrome 就把该标签页标成
 * 桌面模式，回跳后按 980px 渲染。弹窗登录让主标签页不离站、不刷新，
 * 宽度就不会变。弹窗被拦截时回退整页跳转，登完靠 /auth-callback +
 * 真刷新兜底（全自动，用户不用多点一下）。
 *
 * APP 内（Capacitor 原生）仍走原深链流程：整页跳转，redirectTo 回 origin。
 */
export function useGooglePopupLogin(opts?: UseGooglePopupLoginOpts) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const popupRef = useRef<Window | null>(null);
  const timerRef = useRef<number | null>(null);
  const pendingRef = useRef(false);
  const onSuccessRef = useRef(opts?.onSuccess);
  onSuccessRef.current = opts?.onSuccess;

  const stopPolling = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    popupRef.current = null;
  }, []);

  // 登录成功（主标签页拿到会话）：停轮询、恢复按钮、回调
  useEffect(() => {
    if (pendingRef.current && user) {
      pendingRef.current = false;
      stopPolling();
      setLoading(false);
      onSuccessRef.current?.();
    }
  }, [user, stopPolling]);

  useEffect(() => stopPolling, [stopPolling]);

  const loginWithGoogle = useCallback(async () => {
    // APP 内（Capacitor 原生）仍走原深链流程不变（老站目前没有 APP，
    // com.dustan.hub 读的是新站；这条是以后 JoyRx 打包 APP 时用的）。
    // prompt=select_account：以后 APP 里退出再登能换账号。
    if (Capacitor.isNativePlatform()) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
            queryParams: { prompt: "select_account" },
          },
        });
        if (error) toast({ title: translateAuthError(error.message), variant: "destructive" });
      } catch (err: unknown) {
        toast({ title: translateAuthError(err instanceof Error ? err.message : String(err)), variant: "destructive" });
      }
      return;
    }

    // 网页端：先同步打开空白弹窗（必须在 await 之前，否则被拦截）
    const popup = window.open("", "_blank", "width=500,height=600");
    setLoading(true);
    pendingRef.current = true;
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth-callback`,
          skipBrowserRedirect: true,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("未拿到谷歌登录地址");

      if (!popup || popup.closed) {
        // 弹窗被拦截：回退整页跳转，登完靠 /auth-callback + 真刷新兜底
        window.location.href = data.url;
        return;
      }
      popup.location.href = data.url;
      popupRef.current = popup;

      // 每 500ms 轮询：用户手动关弹窗就恢复按钮；登录成功由 user 变化接住。
      // 最长 2 分钟：超时清定时器、关弹窗、恢复按钮。
      const startTime = Date.now();
      timerRef.current = window.setInterval(() => {
        const p = popupRef.current;
        if (Date.now() - startTime > 120000) {
          stopPolling();
          if (pendingRef.current) {
            pendingRef.current = false;
            setLoading(false);
            try {
              p?.close();
            } catch {
              /* ignore */
            }
          }
          return;
        }
        if (!p || p.closed) {
          stopPolling();
          // 弹窗关了：查一下是不是已登录（登完弹窗自己关的，localStorage
          // 里已有会话，user effect 随后会接住 onSuccess）；没登录才是
          // 用户手动关的，恢复按钮。
          void supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session && pendingRef.current) {
              pendingRef.current = false;
              setLoading(false);
            }
          });
        }
      }, 500);
    } catch (err: unknown) {
      pendingRef.current = false;
      stopPolling();
      setLoading(false);
      try {
        popup?.close();
      } catch {
        /* ignore */
      }
      toast({ title: translateAuthError(err instanceof Error ? err.message : String(err)), variant: "destructive" });
    }
  }, [stopPolling, toast]);

  return { loginWithGoogle, loading };
}
