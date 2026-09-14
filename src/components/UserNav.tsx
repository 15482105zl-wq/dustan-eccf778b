import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Bell, CheckCheck, LogIn, LogOut, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

type Notification = {
  id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender_name?: string;
  message_id?: string;
  mention_type?: string;
};

const UserNav = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // 自己维护会话，不依赖 useAuth 的字段名
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const user: SupabaseUser | null = session?.user ?? null;
  const isAuthenticated = !!user;
  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "";

  useEffect(() => {
    // 先注册监听，再取当前会话，避免漏事件
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("fetch notifications error:", error);
      return;
    }

    setNotifications(data || []);
    setUnreadCount((data || []).filter((n) => !n.read).length);
  }, [user]);

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markOneRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const n = payload.new as Notification;

          setNotifications((prev) => [n, ...prev].slice(0, 10));

          if (!n.read) {
            setUnreadCount((c) => c + 1);
            toast({
              title: `🔔 ${n.sender_name || "系统通知"}`,
              description: n.content,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, fetchNotifications]);

  // 点击面板外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    };

    if (showPanel) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPanel]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate("/auth", { replace: true });
  };

  if (loading) return null;

  return (
    <div className="relative flex items-center gap-2">
      {isAuthenticated ? (
        <>
          {/* 通知铃铛 */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setShowPanel((prev) => !prev)}
              className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="通知"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showPanel && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="font-medium text-foreground">通知</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      全部已读
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      暂无通知
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={async () => {
                          await markOneRead(n.id);
                          setShowPanel(false);
                          navigate("/messages");
                        }}
                        className={`flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors hover:bg-accent ${
                          n.read ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{n.sender_name || "系统通知"}</span>
                          <span>
                            {new Date(n.created_at).toLocaleTimeString("zh-CN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-sm text-foreground">
                          {n.content}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 用户头像与资料 */}
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={(user?.user_metadata?.avatar_url as string) || ""}
                alt={displayName || "用户"}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {displayName?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium text-foreground sm:inline">
              {displayName || "我的"}
            </span>
          </button>

          {/* 退出按钮 */}
          <button
            onClick={handleSignOut}
            title="退出登录"
            className="p-1.5 text-muted-foreground transition-colors hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </>
      ) : (
        <button
          onClick={() => navigate("/auth")}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <LogIn className="h-4 w-4" />
          登录
        </button>
      )}
    </div>
  );
};

export default UserNav;
