import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Shield, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import ParticleBackground from "@/components/ParticleBackground";

interface Comment {
  id: string;
  nickname: string;
  content: string;
  created_at: string;
}

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [fetching, setFetching] = useState(false);

  const fetchAll = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false });
    setFetching(false);
    if (error) {
      toast({ title: "加载失败", description: error.message, variant: "destructive" });
      return;
    }
    setComments((data || []) as Comment[]);
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!isAdmin) return;
    fetchAll();
    const channel = supabase
      .channel("admin-comments")
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, isAdmin, loading]);

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除该留言？")) return;
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) {
      toast({ title: "删除失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "已删除 🗑️" });
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        加载中...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen relative">
        <ParticleBackground />
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center gap-4">
          <Shield className="w-12 h-12 text-destructive" />
          <h1 className="font-heading text-2xl font-bold">无访问权限</h1>
          <p className="text-sm text-muted-foreground">仅管理员可访问此页面</p>
          <Button onClick={() => navigate("/")} variant="outline">返回首页</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <ParticleBackground />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </motion.button>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="gradient-text">留言管理</span>
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAll}
            disabled={fetching}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} />
            刷新
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          共 {comments.length} 条留言
        </p>

        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="glass rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-primary truncate">{c.nickname}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {new Date(c.created_at).toLocaleString("zh-CN")}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-destructive/70 hover:text-destructive transition-colors p-1.5 rounded hover:bg-destructive/10 shrink-0"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap break-words">
                {c.content}
              </p>
            </div>
          ))}
          {!fetching && comments.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-12">暂无留言</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
