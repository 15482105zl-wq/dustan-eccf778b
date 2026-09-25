import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Edit3, Check, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AnnouncementData {
  id?: string;
  title: string;
  tag: string;
  content: string[];
  download_url: string;
  button_text: string;
  version: string;
  is_active: boolean;
}

const DEFAULT_ANNOUNCEMENT: AnnouncementData = {
  title: "🔥 官方客户端全新上线",
  tag: "官方重磅更新",
  content: [
    "手机端独立 App 正式发布，极致流畅体验",
    "极速节点一键直达，全站资源随身畅享",
    "支持免翻墙高速直连与新功能抢先体验",
  ],
  download_url: "https://pxyfbbohoazbslneagix.supabase.co/storage/v1/object/public/downloads/DustanHub.apk",
  button_text: "立即下载官方 APP",
  version: "1.0.0",
  is_active: true,
};

const STORAGE_KEY = "dustan_seen_announcement_version";
type EditForm = Omit<AnnouncementData, "id" | "content"> & { contentRaw: string };

export default function AnnouncementModal() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState(DEFAULT_ANNOUNCEMENT);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({ ...DEFAULT_ANNOUNCEMENT, contentRaw: DEFAULT_ANNOUNCEMENT.content.join("\n") });

  useEffect(() => {
    void fetchAnnouncement();
  }, []);

  const checkShouldShow = (announcement: AnnouncementData) => {
    if (!announcement.is_active) return;
    if (localStorage.getItem(STORAGE_KEY) !== announcement.version) setIsOpen(true);
  };

  const fetchAnnouncement = async () => {
    try {
      const { data: result, error } = await supabase.from("site_announcements" as any).select("*").limit(1).maybeSingle();
      if (!error && result) {
        const row = result as any;
        const announcement: AnnouncementData = {
          id: row.id,
          title: row.title || DEFAULT_ANNOUNCEMENT.title,
          tag: row.tag || DEFAULT_ANNOUNCEMENT.tag,
          content: Array.isArray(row.content) ? row.content : DEFAULT_ANNOUNCEMENT.content,
          download_url: row.download_url || DEFAULT_ANNOUNCEMENT.download_url,
          button_text: row.button_text || DEFAULT_ANNOUNCEMENT.button_text,
          version: row.version || DEFAULT_ANNOUNCEMENT.version,
          is_active: row.is_active ?? true,
        };
        setData(announcement);
        checkShouldShow(announcement);
      } else {
        checkShouldShow(DEFAULT_ANNOUNCEMENT);
      }
    } catch {
      checkShouldShow(DEFAULT_ANNOUNCEMENT);
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    localStorage.setItem(STORAGE_KEY, data.version);
    setIsOpen(false);
    setIsEditing(false);
  };

  const startEdit = () => {
    setEditForm({ ...data, contentRaw: data.content.join("\n") });
    setIsOpen(true);
    setIsEditing(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const content = editForm.contentRaw.split("\n").map((line) => line.trim()).filter(Boolean);
    const payload = { ...editForm, content, updated_at: new Date().toISOString() };
    delete (payload as Partial<typeof payload>).contentRaw;
    try {
      const query = supabase.from("site_announcements" as any);
      const result = data.id
        ? await query.update(payload).eq("id", data.id)
        : await query.update(payload).eq("id", "00000000-0000-0000-0000-000000000001");
      if (result.error) throw result.error;
      const next = { ...data, ...payload } as AnnouncementData;
      setData(next);
      setIsEditing(false);
      if (next.is_active && localStorage.getItem(STORAGE_KEY) !== next.version) setIsOpen(true);
      else if (!next.is_active) setIsOpen(false);
      toast({ title: "保存成功", description: "公告配置已实时更新，全网秒级生效！" });
    } catch (error: any) {
      toast({ title: "保存失败", description: error.message || "更新出错，请检查管理员权限", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || (!isOpen && !isEditing)) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }} className="relative w-full max-w-md rounded-2xl bg-zinc-950/95 border border-primary/40 shadow-2xl shadow-primary/20 p-6 overflow-hidden text-left">
          <div className="absolute -top-20 -left-20 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {isAdmin && !isEditing && <button type="button" onClick={startEdit} title="管理员编辑" className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-xs flex items-center gap-1 border border-primary/30"><Edit3 className="w-3.5 h-3.5" /><span>编辑</span></button>}
            <button type="button" onClick={close} className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          {isEditing ? (
            <form onSubmit={save} className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800"><span className="font-bold text-white text-sm">🛠️ 管理员编辑公告</span><label className="flex items-center gap-1.5 text-zinc-300"><input type="checkbox" checked={editForm.is_active} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })} />启用弹窗</label></div>
              <label className="text-zinc-400 block">标签徽章<input value={editForm.tag} onChange={(e) => setEditForm({ ...editForm, tag: e.target.value })} className="field" /></label>
              <label className="text-zinc-400 block">公告主标题<input required value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="field" /></label>
              <label className="text-zinc-400 block">更新日志内容（每行一条）<textarea rows={3} value={editForm.contentRaw} onChange={(e) => setEditForm({ ...editForm, contentRaw: e.target.value })} className="field resize-none" /></label>
              <label className="text-zinc-400 block">APP 下载链接<input required value={editForm.download_url} onChange={(e) => setEditForm({ ...editForm, download_url: e.target.value })} className="field" /></label>
              <div className="grid grid-cols-2 gap-2"><label className="text-zinc-400">按钮文字<input value={editForm.button_text} onChange={(e) => setEditForm({ ...editForm, button_text: e.target.value })} className="field" /></label><label className="text-zinc-400">版本号<input value={editForm.version} onChange={(e) => setEditForm({ ...editForm, version: e.target.value })} className="field" /></label></div>
              <div className="flex gap-2 pt-2"><button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300">取消</button><button type="submit" disabled={saving} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-1.5">{saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}保存生效</button></div>
            </form>
          ) : (
            <div className="space-y-4 pt-1"><div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-medium"><Sparkles className="w-3.5 h-3.5" />{data.tag}</div><h3 className="text-lg sm:text-xl font-bold text-white tracking-wide">{data.title}</h3><div className="space-y-2.5 py-2">{data.content.map((item, index) => <div key={`${item}-${index}`} className="flex items-start gap-2.5 text-zinc-300 text-xs sm:text-sm"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" /><span className="leading-relaxed">{item}</span></div>)}</div><div className="space-y-2 pt-2"><button type="button" onClick={() => window.open(data.download_url, "_blank", "noopener,noreferrer")} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary via-amber-400 to-yellow-500 text-black font-bold flex items-center justify-center gap-2 shadow-lg"><Download className="w-4 h-4" />{data.button_text}</button><button type="button" onClick={close} className="w-full py-2.5 rounded-xl bg-zinc-900/80 text-zinc-400 text-xs border border-zinc-800">我知道了 · 进入网站</button></div></div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
