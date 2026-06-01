import { motion } from "framer-motion";
import { Copy, ExternalLink, LucideIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  url: string;
  code?: string;
  highlight?: boolean;
  delay?: number;
}

const VipResourceCard = ({ icon: Icon, title, description, url, code, highlight, delay = 0 }: Props) => {
  const { toast } = useToast();

  const copyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast({ title: `已复制提取码：${code}` });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
      className={`glass rounded-xl p-4 cursor-pointer relative overflow-hidden group transition-all duration-300 ${
        highlight
          ? "border-accent/50 animate-breathe-glow"
          : "border-glass-border/40 hover:border-primary/40 hover:shadow-glow-sm"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
            highlight ? "bg-accent/20 text-accent" : "bg-primary/15 text-primary"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-foreground text-[15px] truncate">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{description}</p>
          )}
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </div>
      {code && (
        <button
          type="button"
          onClick={copyCode}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-md bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors"
        >
          <span>提取码：{code}</span>
          <Copy className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
};

export default VipResourceCard;
