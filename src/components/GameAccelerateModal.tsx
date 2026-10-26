import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Check, Copy } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CODE = "dustan1024";
const SITE_URL = "https://geilijiasu.com";

const HIGHLIGHTS = [
  "电竞级专线，延迟更低更稳定",
  "全时段无排队，随时都能加速",
  "手机电脑双端通用",
  "覆盖 Steam 等平台的海外游戏",
];

const STEPS = [
  "去官网下载给梨加速器，注册登录账号",
  "在 App 内找到兑换入口，输入兑换码",
  "选好游戏，开始加速",
];

export default function GameAccelerateModal({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(CODE);
      setCopied(true);
      toast({ title: "兑换码已复制" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "复制失败，请手动长按复制", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>游戏加速</DialogTitle>
        </DialogHeader>

        <p className="text-sm font-semibold" style={{ color: "#fbbf24" }}>
          终身免费
        </p>
        <p className="text-sm text-muted-foreground">
          专攻游戏低延迟，Steam 等海外游戏都能加速，手机电脑双端通用。
        </p>

        <div className="grid grid-cols-2 gap-2">
          {HIGHLIGHTS.map((h) => (
            <p key={h} className="text-sm flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: "#fbbf24" }} />
              {h}
            </p>
          ))}
        </div>

        <div>
          <p className="font-semibold mb-3">三步用起来</p>
          <div className="space-y-3">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-400 text-sm font-semibold text-white">
                  {i + 1}
                </span>
                <p className="text-sm">{s}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-yellow-400 p-4">
          <div>
            <p className="text-xs text-muted-foreground">兑换码</p>
            <p className="text-2xl font-bold tracking-wide">{CODE}</p>
          </div>
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(90deg,#38bdf8,#6366f1)" }}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "已复制" : "复制"}
          </button>
        </div>

        <button
          onClick={() => window.open(SITE_URL, "_blank", "noopener,noreferrer")}
          className="w-full rounded-xl py-3 font-semibold text-white"
          style={{ background: "linear-gradient(90deg,#38bdf8,#6366f1)" }}
        >
          去官网下载
        </button>
        <p className="text-center text-xs text-muted-foreground">兑换一次，终身有效。</p>
      </DialogContent>
    </Dialog>
  );
}
