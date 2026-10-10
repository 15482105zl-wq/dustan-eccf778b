import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AnnouncementData {
  title: string;
  tag: string;
  content: string[];
  download_url: string;
  button_text: string;
}

/**
 * 首页公告横幅：标题下方一条瘦横幅，点开看公告全文。
 * 数据与 AnnouncementModal 同源（site_announcements 表），不碰原弹窗组件。
 * 弹窗点"我知道了"之后，用户从这里随时回看。
 */
export default function AnnouncementBanner() {
  const [data, setData] = useState<AnnouncementData | null>(null);

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
          onClick={() => window.dispatchEvent(new CustomEvent("open-announcement"))}
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
    </>
  );
}
