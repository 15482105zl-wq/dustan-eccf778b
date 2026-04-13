import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Comment {
  id: string;
  nickname: string;
  content: string;
  created_at: string;
}

const CommentSection = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setComments(data as Comment[]);
    if (error) console.error(error);
  };

  useEffect(() => {
    fetchComments();
    const channel = supabase
      .channel("comments-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => {
        fetchComments();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNick = nickname.trim();
    const trimmedContent = content.trim();
    if (!trimmedNick || !trimmedContent) {
      toast({ title: "请填写昵称和内容", variant: "destructive" });
      return;
    }
    if (trimmedNick.length > 20 || trimmedContent.length > 500) {
      toast({ title: "昵称最多20字，内容最多500字", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("comments").insert({ nickname: trimmedNick, content: trimmedContent });
    setLoading(false);
    if (error) {
      toast({ title: "发送失败", description: error.message, variant: "destructive" });
    } else {
      setContent("");
      toast({ title: "留言成功 ✨" });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) {
      toast({ title: "删除失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "已删除 🗑️" });
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "刚刚";
    if (mins < 60) return `${mins}分钟前`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}小时前`;
    return `${Math.floor(hrs / 24)}天前`;
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="w-full max-w-2xl mx-auto mt-16 px-4"
    >
      <h2 className="font-heading text-xl font-semibold flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-primary" />
        <span className="gradient-text">实时留言互动区</span>
      </h2>

      <form onSubmit={handleSubmit} className="glass rounded-xl p-4 mb-6 space-y-3">
        <Input
          placeholder="你的昵称"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={20}
          className="bg-secondary/50 border-border/50 focus:border-primary/50 placeholder:text-muted-foreground/50"
        />
        <Textarea
          placeholder="说点什么..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
          rows={3}
          className="bg-secondary/50 border-border/50 focus:border-primary/50 placeholder:text-muted-foreground/50 resize-none"
        />
        <Button type="submit" disabled={loading} className="w-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30">
          <Send className="w-4 h-4 mr-2" />
          {loading ? "发送中..." : "发送留言"}
        </Button>
      </form>

      <div className="space-y-3 pb-12">
        <AnimatePresence>
          {comments.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="glass rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary">{c.nickname}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{timeAgo(c.created_at)}</span>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-destructive/60 hover:text-destructive transition-colors p-1"
                      title="删除留言"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{c.content}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        {comments.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">还没有留言，来说点什么吧 ✨</p>
        )}
      </div>
    </motion.section>
  );
};

export default CommentSection;
