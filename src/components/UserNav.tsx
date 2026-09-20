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
  is_read: boolean;
  sender_id?: string;
  sender_name?: string;
  message_id?: string;
  mention_type?: string;
};

type MyProfile = {
  avatar_url?: string | null;
  display_name?: string | null;
};

const UserNav = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState<MyProfile | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const user: SupabaseUser | null = session?.user ?? null;
  const isAuthenticated = !!user;
  const displayName =
    myProfile?.display_name ||
    (user?.user_metadata?.display_name as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "";

  useEffect(() => {
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

  // 查自己的 profile，拿真实头像和昵称
  useEffect(() => {
    if (!user) {
      setMyProfile(null);
      return;
    }
    supabase
      .from("profiles")
      .select("avatar_url, display_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setMyProfile(data);
      });
  }, [user]);

  const attachSenderNames = async (list: Notification[]): Promise<Notification[]> => {
    const senderIds = Array.from(
      new Set(list.map((n) => n.sender_id).filter((id): id is string => !!id))
    );
    if (senderIds.length === 0) return list;

    const { data: profs } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", senderIds);

    const nameMap: Record<string, string> = {};
    profs?.forEach((p: any) => {
      nameMap[p.user_id] = p.display_name;
    });

    return list.map((n) => ({
      ...n,
      sender_name: n.sender_id ? nameMap[n.sender_id] || "某用户" : n.sender_name,
    }));
  };

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

    const withNames = await attachSenderNames((data || []) as Notification[]);
    setNotifications(withNames);
    setUnreadCount(withNames.filter((n) => !n.is_read).length);
  }, [user]);

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const markOneRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
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
      .channel("user-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const newNotif = payload.new as Notification;
          const [withName] = await attachSenderNames([newNotif]);
          setNotifications((prev) => [withName, ...prev.slice(0, 9)]);
          setUnreadCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchNotifications]);

  // 点击外部关闭通知浮窗
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "已退出登录" });
    navigate("/");
  };

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-muted/40 animate-pulse" />;
  }

  return (
    <div className="flex items-center gap-2 relative">
      {isAuthenticated ? (
        <>
          {/* 通知铃铛 */}
          <div className="relative" ref={panelRef}>
            <button
              onClick={() => setShowPanel(!showPanel)}
              className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-foreground/80 hover:text-foreground"
              title="通知中心"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* 通知浮窗 - 修复手机端居中且防止被屏幕边缘裁切 */}
            {showPanel && (
              <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 rounded-xl border border-border/50 bg-background/95 backdrop-blur-md shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">通知中心</span>
                    {unreadCount > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {unreadCount} 条未读
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      全部已读
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-border/20 py-1">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                      暂无通知
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={async () => {
                          await markOneRead(n.id);
                          setShowPanel(false);
                          const targetUrl = n.message_id
                            ? `/vip?chat=true&msgId=${n.message_id}`
                            : `/vip?chat=true`;
                          navigate(targetUrl);
                        }}
                        className={`py-2.5 px-2 rounded-lg cursor-pointer transition-colors text-xs ${
                          n.is_read
                            ? "opacity-60 hover:opacity-100 hover:bg-white/5"
                            : "bg-primary/5 hover:bg-primary/10 font-medium"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-primary/90 truncate max-w-[140px]">
                            {n.sender_name || "系统消息"}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {new Date(n.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="line-clamp-2 leading-relaxed">{n.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 用户个人中心按钮（只显示头像） */}
          <button
            onClick={() => navigate("/profile")}
            className="rounded-full hover:ring-2 hover:ring-primary/50 transition-all shrink-0"
            title={displayName || "个人中心"}
          >
            <Avatar className="w-7 h-7 ring-1 ring-border/50">
              {myProfile?.avatar_url && <AvatarImage src={myProfile.avatar_url} />}
              <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                {displayName.slice(0, 1).toUpperCase() || <User className="w-3 h-3" />}
              </AvatarFallback>
            </Avatar>
          </button>

          {/* 退出登录按钮 */}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground shrink-0"
            title="退出登录"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </>
      ) : (
        <button
          onClick={() => navigate("/auth")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>登录</span>
        </button>
      )}
    </div>
  );
};

export default UserNav;
