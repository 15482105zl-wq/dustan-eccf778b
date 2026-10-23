import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Download, Sparkles, ChevronLeft, ChevronRight, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// 公告栏 = 原弹窗的历史存档：原弹窗每发布一版（版本号变化），数据库自动存一份快照到 announcement_history。
// 本组件只读存档表，与原弹窗互不影响。
interface HistoryRow {
  id: string;
  title: string;
  tag: string | null;
  content: string[];
  download_url: string | null;
  button_text: string | null;
  version: string | null;
  published_at: string | null;
  seq: number;
  is_pinned: boolean;
}

const READ_KEY = "dustan_bell_read_history";
const PAGE_SIZE = 10;
const DEFAULT_DOWNLOAD_URL =
  "https://pxyfbbohoazbslneagix.supabase.co/storage/v1/object/public/downloads/DustanHub.apk";

function loadReadSet(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

function saveReadSet(set: Set<string>) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // localStorage unavailable, ignore
  }
}

// 日期显示：今年发布的只标「M月D日」，往年的自动带上年份（按访客当前日期现算）
function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  return d.getFullYear() === now.getFullYear()
    ? `${d.getMonth() + 1}月${d.getDate()}日`
    : `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function stripNumbering(line: string): string {
  return line.replace(/^\s*\d+\s*[.、．]\s*/, "");
}

export default function AnnouncementBell() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [readSet, setReadSet] = useState<Set<string>>(() => loadReadSet());
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<HistoryRow | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("announcement_history" as any)
          .select("*")
          .order("is_pinned", { ascending: false })
          .order("published_at", { ascending: false })
          .order("seq", { ascending: false });
        if (!error && Array.isArray(data)) {
          setRows(data as unknown as HistoryRow[]);
        }
      } catch {
        // 存档加载失败时静默，不影响首页其他功能
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const hasUnread = rows.some((r) => !readSet.has(r.id));
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const latest = rows[0];

  const markRead = (id: string) => {
    setReadSet((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveReadSet(next);
      return next;
    });
  };

  const markAllRead = () => {
    const next = new Set(readSet);
    rows.forEach((r) => next.add(r.id));
    setReadSet(next);
    saveReadSet(next);
  };

  const openRow = (row: HistoryRow) => {
    markRead(row.id);
    setSelected(row);
  };

  const closeAll = () => {
    setIsOpen(false);
    setSelected(null);
  };

  // 加载完成前先占住同尺寸位置，防止铃铛出现时把登录按钮和整页顶得跳动
  if (!loaded || rows.length === 0) {
    return <div className="w-10 h-10" aria-hidden="true" />;
  }

  return (
    <>
      {/* 小铃铛：首页右上角、登录按钮正下方；有未读存档时只挂红点、不带数字 */}
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        onClick={() => {
          setPage(1);
          setSelected(null);
          setIsOpen(true);
        }}
        aria-label="往期公告"
        title="往期公告"
        className="relative w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border/60 shadow-lg flex items-center justify-center text-foreground/80 hover:text-foreground hover:scale-105 transition-all"
      >
        <Bell className="w-5 h-5" />
        {hasUnread && (
          <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-background" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md max-h-[88vh] overflow-y-auto rounded-2xl bg-[#090c15]/95 border border-accent/40 animate-breathe-glow shadow-2xl p-6 sm:p-7 text-left"
            >
              <div className="absolute -top-24 -left-24 w-52 h-52 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-accent/25 rounded-full blur-3xl pointer-events-none" />

              <button
                type="button"
                onClick={closeAll}
                aria-label="关闭"
                className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {selected ? (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center gap-3">
                    <img
                      src="/logo.png"
                      alt="Dustan Hub"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/40 shadow-md shadow-primary/20"
                    />
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/40 text-accent text-xs font-medium">
                        <Sparkles className="w-3 h-3" />
                        {selected.tag || "公告"}
                      </div>
                    </div>
                  </div>

                  <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight">
                    <span
                      style={{
                        background: "linear-gradient(90deg,#4285F4,#EA4335,#FBBC05,#34A853)",
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {selected.title}
                    </span>
                  </h3>

                  <div className="space-y-2 py-1">
                    {(Array.isArray(selected.content) ? selected.content : []).map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="flex items-start gap-3 p-2.5 rounded-xl bg-secondary/30 border border-border/50 text-foreground/90 text-xs sm:text-sm"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0 shadow-[0_0_8px_hsl(var(--accent))]" />
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        window.open(selected.download_url || DEFAULT_DOWNLOAD_URL, "_blank", "noopener,noreferrer")
                      }
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary via-accent to-accent hover:opacity-95 text-white font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all hover:scale-[1.01]"
                    >
                      <Download className="w-4 h-4" />
                      {selected.button_text || "立即下载官方APP"}
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelected(null)}
                        className="flex-1 py-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground text-xs border border-border/60 transition-colors flex items-center justify-center gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        返回列表
                      </button>
                      <button
                        type="button"
                        onClick={closeAll}
                        className="flex-1 py-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground text-xs border border-border/60 transition-colors"
                      >
                        关闭公告
                      </button>
                    </div>
                  </div>
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
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent/15 border border-accent/40 text-accent text-xs font-medium">
                        <Sparkles className="w-3 h-3" />
                        {latest?.tag || "公告存档"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-2 pr-6">
                    <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight">
                      <span
                        style={{
                          background: "linear-gradient(90deg,#4285F4,#EA4335,#FBBC05,#34A853)",
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          color: "transparent",
                        }}
                      >
                        往期公告
                      </span>
                    </h3>
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-700/60 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      一键已读
                    </button>
                  </div>

                  <div className="space-y-2 py-1">
                    {pageRows.map((row) => {
                      const unread = !readSet.has(row.id);
                      const firstLine =
                        Array.isArray(row.content) && row.content.length > 0
                          ? stripNumbering(row.content[0])
                          : "";
                      return (
                        <button
                          key={row.id}
                          type="button"
                          onClick={() => openRow(row)}
                          className="w-full flex items-start gap-3 p-2.5 rounded-xl bg-secondary/30 border border-border/50 text-left hover:bg-secondary/50 transition-colors"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0 shadow-[0_0_8px_hsl(var(--accent))]" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-foreground/95 truncate">
                                {row.title}
                              </span>
                              {row.is_pinned && (
                                <span className="shrink-0 px-1.5 py-px rounded bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] leading-tight">
                                  置顶
                                </span>
                              )}
                              {unread && (
                                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                              )}
                            </div>
                            {firstLine && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{firstLine}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                            <span className="text-[11px] text-muted-foreground">
                              {formatDate(row.published_at)}
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setPage(currentPage - 1)}
                      className="p-1 rounded-md hover:bg-secondary/60 disabled:opacity-30 transition"
                      aria-label="上一页"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span>
                      第 {currentPage} 页 / 共 {totalPages} 页
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setPage(currentPage + 1)}
                      className="p-1 rounded-md hover:bg-secondary/60 disabled:opacity-30 transition"
                      aria-label="下一页"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        window.open(latest?.download_url || DEFAULT_DOWNLOAD_URL, "_blank", "noopener,noreferrer")
                      }
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary via-accent to-accent hover:opacity-95 text-white font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all hover:scale-[1.01]"
                    >
                      <Download className="w-4 h-4" />
                      {latest?.button_text || "立即下载官方APP"}
                    </button>
                    <button
                      type="button"
                      onClick={closeAll}
                      className="w-full py-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground text-xs border border-border/60 transition-colors"
                    >
                      关闭公告
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
