import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogIn, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

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
