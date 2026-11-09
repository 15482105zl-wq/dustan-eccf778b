import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { track } from "@/lib/track";

const APP_DOWNLOAD_URL = "https://wwwa.qyshare.com:2083/s/dustin";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


// 弹窗图标：首页左上角 logo
export default function AppDownloadModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <img
          src="/logo.webp"
          alt="Dustan Hub"
          className="mx-auto h-16 w-16 rounded-full object-cover ring-2 ring-primary/30"
        />
        <DialogTitle className="mt-4 text-xl font-bold">装上 APP，下次一点就进</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground">浏览器关掉就找不着了，才 11MB。</DialogDescription>
        <a
          href={APP_DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("app_download_vip_popup", "APP下载（VIP弹窗）", "app")}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full py-3 font-semibold text-white"
          style={{ background: "#a855f7" }}
        >
          <Download className="h-4 w-4" />
          下载官方APP
        </a>
        <button
          onClick={() => onOpenChange(false)}
          className="text-sm text-muted-foreground"
        >
          继续用浏览器访问
        </button>
      </DialogContent>
    </Dialog>
  );
}
