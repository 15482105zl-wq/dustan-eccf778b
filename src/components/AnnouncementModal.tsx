import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Edit3, Check, RefreshCw, Eye } from "lucide-react";
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
  title: "国内手机装不了谷歌？我帮你搞定了",
  tag: "安卓用户必看",
  content: [
    "资源路径：首页四大网盘 → 高价值资源包 → 海外应用 → 主流应用 → 谷歌全家桶",
    "如有问题请前往【BBS论坛】反馈。",
    "Google 服务包（支持 Android 12–17）已整理完成，四大组件按版本归档",
    "安装顺序：框架 → 账号管理器 → Play 服务 → 商店，安装后重启即可使用",
    "文件来源 APKMirror（Google LLC），20 余款官方正版应用，完全免费",
    "安装官方应用，即可使用完整的谷歌服务",
  ],
  download_url: "https://pxyfbbohoazbslneagix.supabase.co/storage/v1/object/public/downloads/DustanHub.apk",
  button_text: "立即下载官方 APP",
  version: "2.0.0",
  is_active: true,
};

const STORAGE_KEY = "dustan_seen_announcement_version";
const INPUT_CLASS = "w-full mt-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs outline-none focus:border-accent transition-colors";

// 谷歌四色：蓝 / 红 / 黄 / 绿
const GOOGLE_COLORS = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];

type EditForm = Omit<AnnouncementData, "id" | "content"> & { contentRaw: string };

export default function AnnouncementModal() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState(DEFAULT_ANNOUNCEMENT);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTab, setEditTab] = useState<"form" | "preview">("form");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    ...DEFAULT_ANNOUNCEMENT,
    contentRaw: DEFAULT_ANNOUNCEMENT.content.join("\n"),
  });

  useEffect(() => {
    void fetchAnnouncement();
  }, []);

  const checkShouldShow = (announcement: AnnouncementData) => {
    if (!announcement.is_active) return;
    if (localStorage.getItem(STORAGE_KEY) !== announcement.version) {
      setIsOpen(true);
    }
  };

  const fetchAnnouncement = async () => {
    try {
      const { data: result, error } = await supabase
        .from("site_announcements" as any)
        .select("*")
        .limit(1)
        .maybeSingle();

      if (!error && result) {
        const row = result as any;
        const announcement: AnnouncementData = {
          id: row.id,
          title: row.title || DEFAULT_ANNOUNCEMENT.title,
          tag: row.tag || DEFAULT_ANNOUNCEMENT.tag,
          content: Array.isArray(row.content) && row.content.length > 0 ? row.content : DEFAULT_ANNOUNCEMENT.content,
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
    setEditForm({
      title: data.title,
      tag: data.tag,
      download_url: data.download_url,
      button_text: data.button_text,
      version: data.version,
      is_active: data.is_active,
      contentRaw: data.content.join("\n"),
    });
    setEditTab("form");
    setIsEditing(true);
    setIsOpen(true);
  };

  const executeSave = async () => {
    setSaving(true);
    const contentLines = editForm.contentRaw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedData: AnnouncementData = {
      id: data.id,
      title: editForm.title.trim() || DEFAULT_ANNOUNCEMENT.title,
      tag: editForm.tag.trim() || DEFAULT_ANNOUNCEMENT.tag,
      content: contentLines.length ? contentLines : DEFAULT_ANNOUNCEMENT.content,
      download_url: editForm.download_url.trim() || DEFAULT_ANNOUNCEMENT.download_url,
      button_text: editForm.button_text.trim() || DEFAULT_ANNOUNCEMENT.button_text,
      version: editForm.version.trim() || DEFAULT_ANNOUNCEMENT.version,
      is_active: editForm.is_active,
    };

    try {
      if (data.id) {
        const { error } = await supabase
          .from("site_announcements" as any)
          .update({
            title: updatedData.title,
            tag: updatedData.tag,
            content: updatedData.content,
            download_url: updatedData.download_url,
            button_text: updatedData.button_text,
            version: updatedData.version,
            is_active: updatedData.is_active,
            updated_at: new Date().toISOString(),
          } as any)
          .eq("id", data.id);

        if (error) throw error;
      }

      setData(updatedData);
      setIsEditing(false);
      toast({
        title: "✨ 公告配置已更新",
        description: `新版本号 ${updatedData.version} 已生效，全站即刻同步！`,
      });
    } catch (err: any) {
      toast({
        title: "保存失败",
        description: err?.message || "网络异常，请重试",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void executeSave();
  };

  if (loading) return null;

  // 未打开弹窗且不在编辑中：仅给管理员展示右下角常驻悬浮管理入口
  if (!isOpen && !isEditing) {
    if (!isAdmin) return null;
    return (
      <button
        type="button"
        onClick={startEdit}
        title="管理员编辑公告"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-background/90 hover:bg-card text-accent hover:text-accent-foreground border border-accent/40 shadow-lg shadow-accent/20 text-xs font-medium backdrop-blur-md transition-all hover:scale-105"
      >
        <Edit3 className="w-3.5 h-3.5 text-accent" />
        <span>公告管理</span>
      </button>
    );
  }

  const previewContent = editForm.contentRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="relative w-full max-w-md my-auto rounded-2xl bg-[#090c15]/95 border border-[#4285F4]/30 shadow-[0_25px_60px_rgba(0,0,0,0.6),0_0_44px_rgba(66,133,244,0.14)] p-6 sm:p-7 overflow-hidden text-left"
        >
          {/* 谷歌四色顶栏 */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <span className="flex-1 bg-[#4285F4]" />
            <span className="flex-1 bg-[#EA4335]" />
            <span className="flex-1 bg-[#FBBC05]" />
            <span className="flex-1 bg-[#34A853]" />
          </div>
          <div className="absolute -top-24 -left-24 w-52 h-52 bg-[#4285F4]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-[#34A853]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            {isAdmin && !isEditing && (
              <button
                type="button"
                onClick={startEdit}
                title="管理员编辑"
                className="p-1.5 rounded-lg bg-accent/15 hover:bg-accent/25 text-accent transition-colors text-xs flex items-center gap-1 border border-accent/40"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>编辑</span>
              </button>
            )}
            <button
              type="button"
              onClick={close}
              className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setEditTab("form")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      editTab === "form"
                        ? "bg-accent text-accent-foreground shadow-sm font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>编辑内容</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTab("preview")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      editTab === "preview"
                        ? "bg-accent text-accent-foreground shadow-sm font-semibold"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>实时预览</span>
                  </button>
                </div>

                <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                    className="rounded border-zinc-700 bg-zinc-900 accent-accent"
                  />
                  <span>启用弹窗</span>
                </label>
              </div>

              {editTab === "form" ? (
                <form onSubmit={handleFormSubmit} className="space-y-3">
                  <label className="text-zinc-400 block">
                    标签徽章
                    <input
                      value={editForm.tag}
                      onChange={(e) => setEditForm({ ...editForm, tag: e.target.value })}
                      className={INPUT_CLASS}
                    />
                  </label>

                  <label className="text-zinc-400 block">
                    公告主标题
                    <input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className={INPUT_CLASS}
                    />
                  </label>

                  <label className="text-zinc-400 block">
                    更新内容（每行一条）
                    <textarea
                      rows={4}
                      value={editForm.contentRaw}
                      onChange={(e) => setEditForm({ ...editForm, contentRaw: e.target.value })}
                      className={`${INPUT_CLASS} resize-none leading-relaxed font-mono`}
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-zinc-400 block">
                      版本号
                      <input
                        value={editForm.version}
                        onChange={(e) => setEditForm({ ...editForm, version: e.target.value })}
                        className={INPUT_CLASS}
                      />
                    </label>
                    <label className="text-zinc-400 block">
                      按钮文字
                      <input
                        value={editForm.button_text}
                        onChange={(e) => setEditForm({ ...editForm, button_text: e.target.value })}
                        className={INPUT_CLASS}
                      />
                    </label>
                  </div>

                  <label className="text-zinc-400 block">
                    APK 下载链接
                    <input
                      value={editForm.download_url}
                      onChange={(e) => setEditForm({ ...editForm, download_url: e.target.value })}
                      className={INPUT_CLASS}
                    />
                  </label>

                  <div className="flex gap-2 pt-2 border-t border-border/60">
                    <button
                      type="button"
                      onClick={() => setEditTab("preview")}
                      className="flex-1 py-2 rounded-xl bg-secondary/40 hover:bg-secondary/70 text-zinc-300 flex items-center justify-center gap-1.5 transition-colors border border-border/50"
                    >
                      <Eye className="w-3.5 h-3.5 text-accent" />
                      切换预览
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-2 rounded-xl bg-accent text-accent-foreground font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                      {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      保存生效
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between pb-1">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/20 border border-accent/40 text-accent text-[11px] font-semibold">
                      <Eye className="w-3 h-3" />
                      预览效果中
                    </div>
                    <span className="text-[11px] text-muted-foreground">v{editForm.version}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src="/logo.png"
                      alt="Dustan Hub"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/40 shadow-md shadow-primary/20"
                    />
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4285F4]/15 border border-[#4285F4]/40 text-[#8ab4f8] text-xs font-medium">
                        <span className="inline-flex items-center gap-[3px]">
                          <i className="block w-[7px] h-[7px] rounded-full bg-[#4285F4]" />
                          <i className="block w-[7px] h-[7px] rounded-full bg-[#EA4335]" />
                          <i className="block w-[7px] h-[7px] rounded-full bg-[#FBBC05]" />
                          <i className="block w-[7px] h-[7px] rounded-full bg-[#34A853]" />
                        </span>
                        {editForm.tag}
                      </div>
                    </div>
                  </div>

                  <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight">
                    <span className="[background:linear-gradient(90deg,#4285F4,#EA4335,#FBBC05,#34A853)] bg-clip-text text-transparent">{editForm.title}</span>
                  </h3>

                  <div className="space-y-2 py-1">
                    {previewContent.length > 0 ? (
                      previewContent.map((item, index) => (
                        <div
                          key={`${item}-${index}`}
                          className="flex items-start gap-3 p-2.5 rounded-xl bg-secondary/30 border border-border/50 text-foreground/90 text-xs sm:text-sm"
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                            style={{
                              backgroundColor: GOOGLE_COLORS[index % GOOGLE_COLORS.length],
                              boxShadow: `0 0 8px ${GOOGLE_COLORS[index % GOOGLE_COLORS.length]}`,
                            }}
                          />
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground italic">暂无更新日志内容</div>
                    )}
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      className="w-full py-3.5 rounded-xl bg-[#4285F4] text-white font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(66,133,244,0.35)] opacity-90 cursor-default"
                    >
                      <Download className="w-4 h-4" />
                      {editForm.button_text || "立即下载官方 APP"}
                    </button>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border/60">
                    <button
                      type="button"
                      onClick={() => setEditTab("form")}
                      className="flex-1 py-2 rounded-xl bg-secondary/40 hover:bg-secondary/70 text-zinc-300 flex items-center justify-center gap-1.5 transition-colors border border-border/50"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      返回修改
                    </button>
                    <button
                      type="button"
                      onClick={executeSave}
                      disabled={saving}
                      className="flex-1 py-2 rounded-xl bg-accent text-accent-foreground font-semibold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                      {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      确认保存生效
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Dustan Hub"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/40 shadow-md shadow-primary/20"
                />
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4285F4]/15 border border-[#4285F4]/40 text-[#8ab4f8] text-xs font-medium">
                    <span className="inline-flex items-center gap-[3px]">
                      <i className="block w-[7px] h-[7px] rounded-full bg-[#4285F4]" />
                      <i className="block w-[7px] h-[7px] rounded-full bg-[#EA4335]" />
                      <i className="block w-[7px] h-[7px] rounded-full bg-[#FBBC05]" />
                      <i className="block w-[7px] h-[7px] rounded-full bg-[#34A853]" />
                    </span>
                    {data.tag}
                  </div>
                </div>
              </div>

              <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight">
                <span className="[background:linear-gradient(90deg,#4285F4,#EA4335,#FBBC05,#34A853)] bg-clip-text text-transparent">{data.title}</span>
              </h3>

              <div className="space-y-2 py-1">
                {data.content.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-secondary/30 border border-border/50 text-foreground/90 text-xs sm:text-sm"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{
                        backgroundColor: GOOGLE_COLORS[index % GOOGLE_COLORS.length],
                        boxShadow: `0 0 8px ${GOOGLE_COLORS[index % GOOGLE_COLORS.length]}`,
                      }}
                    />
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => window.open(data.download_url, "_blank", "noopener,noreferrer")}
                  className="w-full py-3.5 rounded-xl bg-[#4285F4] hover:bg-[#3367d6] text-white font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(66,133,244,0.35)] transition-all hover:scale-[1.01]"
                >
                  <Download className="w-4 h-4" />
                  {data.button_text}
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="w-full py-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground text-xs border border-border/60 transition-colors"
                >
                  我知道了 · 进入网站
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
