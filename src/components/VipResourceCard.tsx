import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  subDescription?: string;
  url?: string;
  onClick?: () => void;
  highlight?: boolean;
  singleLine?: boolean;
  delay?: number;
}

const VipResourceCard = ({ icon: Icon, title, description, subDescription, url, onClick, highlight, delay = 0 }: Props) => {
  const handleClick = () => {
    if (onClick) return onClick();
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`bg-transparent backdrop-blur-xl rounded-xl p-3 cursor-pointer relative overflow-hidden group transition-all duration-300 min-h-[120px] flex flex-col items-center justify-center text-center border ${
        highlight
          ? "border-accent/50 animate-breathe-glow shadow-[0_0_24px_hsl(var(--accent)/0.35)]"
          : "border-glass-border/40 hover:border-primary/40 hover:shadow-glow-sm"
      }`}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mb-2 bg-primary/15 text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-heading font-semibold text-foreground text-[13px] leading-tight whitespace-nowrap">
        {title}
      </p>
      {description && (
        <p className="text-[11px] text-muted-foreground mt-1 whitespace-nowrap">
          {description}
        </p>
      )}
      {subDescription && (
        <p className="text-[11px] text-muted-foreground mt-0.5 whitespace-nowrap">
          {subDescription}
        </p>
      )}
    </motion.div>
  );
};

export default VipResourceCard;
