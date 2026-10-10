import { useEffect, useState } from "react";
import { X, Download, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AnnouncementData {
  title: string;
  tag: string;
  content: string[];
  download_url: string;
  button_text: string;
}

const GOOGLE_COLORS = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];

/**
 * 首页公告横幅：标题下方一条瘦横幅，点开看公告全文。
 * 数据与 AnnouncementModal 同源（site_announcements 表），不碰原弹窗组件。
 * 弹窗点"我知道了"之后，用户从这里随时回看。
 */
export default function AnnouncementBanner() {
  const [data, setData] = useState<AnnouncementData | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: row, error } = await supabase
          .from("site_announcements" as any)
          .select("title,tag,content,download_url,button_text,is_active")
          .limit(1)
          .maybeSingle();
        if (cancelled || error || !row) return;
        const r = row as any;
        if (r.is_active === false) return;
        setData({
          title: r.title || "",
          tag: r.tag || "",
          content: Array.isArray(r.content) ? r.content : [],
          download_url: r.download_url || "",
          button_text: r.button_text || "立即下载官方 APP",
        });
      } catch {
        /* 静默失败：不展示横幅即可 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return null;

  return (
    <>
      <div className="w-full max-w-2xl mb-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="查看最新公告"
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#4285F4]/10 border border-[#4285F4]/35 text-left transition-transform hover:scale-[1.01]"
        >
          <span
            className="w-[7px] h-[7px] rounded-full shrink-0"
            style={{ backgroundColor: "#4285F4", boxShadow: "0 0 8px #4285F4" }}
          />
          <span className="flex-1 text-[13px] text-foreground/90 truncate">
            {data.title}
          </span>
          <ChevronRight className="w-4 h-4 text-[#7aa7f8] shrink-0" />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-md my-auto rounded-2xl bg-[#090c15]/95 border border-[#4285F4]/30 shadow-[0_25px_60px_rgba(0,0,0,0.6)] p-6 sm:p-7 overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 flex">
              <span className="flex-1 bg-[#4285F4]" />
              <span className="flex-1 bg-[#EA4335]" />
              <span className="flex-1 bg-[#FBBC05]" />
              <span className="flex-1 bg-[#34A853]" />
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="关闭"
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="Dustan Hub"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/40"
                />
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

              <h3 className="font-heading text-xl sm:text-2xl font-bold tracking-tight">
                <span className="text-foreground">
                  {data.title}
                </span>
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

              {data.download_url && (
                <button
                  type="button"
                  onClick={() => window.open(data.download_url, "_blank", "noopener,noreferrer")}
                  className="w-full py-3.5 rounded-xl bg-[#4285F4] hover:bg-[#3367d6] text-white font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(66,133,244,0.35)] transition-all hover:scale-[1.01]"
                >
                  <Download className="w-4 h-4" />
                  {data.button_text}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
