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
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const raw = payload.new as Notification;
          const [withName] = await attachSenderNames([raw]);

          setNotifications((prev) => {
            if (prev.some((item) => item.id === withName.id)) {
              return prev;
            }
            return [withName, ...prev].slice(0, 10);
          });

          if (!withName.is_read) {
            setUnreadCount((c) => c + 1);
            toast({
              title: `🔔 ${withName.sender_name || "系统通知"}`,
              description: withName.content,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, fetchNotifications]);

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
    <div className="flex items-center gap-3" ref={panelRef}>
      {isAuthenticated ? (
        <>
          <div className="relative">
            <button
              onClick={() => setShowPanel((prev) => !prev)}
              className="relative rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="通知"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showPanel && (
              <div className="absolute right-0 top-11 w-72 sm:w-80 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-2xl z-50">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="text-sm font-semibold text-foreground">通知</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      全部已读
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      暂无通知
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={async () => {
                          await markOneRead(n.id);
                          setShowPanel(false);
                          navigate("/vip");
                        }}
                        className={`flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors hover:bg-accent ${
                          n.is_read ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{n.sender_name || "系统通知"}</span>
                          <span>
                            {new Date(n.created_at).toLocaleTimeString("zh-CN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="text-sm text-foreground line-clamp-2">
                          {n.content}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <Avatar className="w-7 h-7 border border-primary/30">
              <AvatarImage src={myProfile?.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary text-xs">
                {displayName?.[0]?.toUpperCase() || <User className="w-3 h-3" />}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-foreground/80 hidden sm:inline">
              {displayName || "我的"}
            </span>
          </button>

          <button
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-destructive transition-colors"
            title="退出登录"
            aria-label="退出登录"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </>
      ) : (
        <button
          onClick={() => navigate("/auth")}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <LogIn className="w-4 h-4" />
          登录
        </button>
      )}
    </div>
  );
};

export default UserNav;