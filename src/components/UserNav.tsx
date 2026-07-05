import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogIn, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const UserNav = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      setDisplayName("");
      return;
    }
    supabase
      .from("profiles")
      .select("avatar_url, display_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setAvatarUrl(data.avatar_url);
          setDisplayName(data.display_name || "");
        }
      });
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error("Sign out error:", e);
    } finally {
      toast({ title: "已退出登录" });
      navigate("/");
    }
  };

  if (!user) {
    return (
      <button
        onClick={() => navigate("/auth")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <LogIn className="w-4 h-4" />
        登录
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => navigate("/profile")}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <Avatar className="w-7 h-7 border border-primary/30">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="bg-secondary text-xs">
            {displayName?.[0]?.toUpperCase() || <User className="w-3 h-3" />}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm text-foreground/80 hidden sm:inline">{displayName || "我的"}</span>
      </button>
      <button
        onClick={handleSignOut}
        className="text-muted-foreground hover:text-destructive transition-colors"
        title="退出登录"
        aria-label="退出登录"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};

export default UserNav;
