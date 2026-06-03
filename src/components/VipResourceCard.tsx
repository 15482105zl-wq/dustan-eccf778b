import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
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
      className={`glass rounded-xl p-4 cursor-pointer relative overflow-hidden group transition-all duration-300 h-full ${
        highlight
          ? "border-accent/50 animate-breathe-glow shadow-[0_0_24px_hsl(var(--accent)/0.35)]"
          : "border-glass-border/40 hover:border-primary/40 hover:shadow-glow-sm"
      }`}
    >
      <div className="flex flex-col gap-2.5">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            highlight ? "bg-accent/20 text-accent" : "bg-primary/15 text-primary"
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="font-heading font-semibold text-foreground text-[13px] leading-tight break-words">{title}</p>
          {description && (
            <p className="text-[11px] text-muted-foreground mt-1 break-words leading-snug">{description}</p>
          )}
        </div>
      </div>

    </motion.div>
  );
};

export default VipResourceCard;
