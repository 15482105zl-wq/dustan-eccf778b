import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  url?: string;
  onClick?: () => void;
  delay?: number;
  badge?: boolean;
}

const VipResourceCard = ({ icon: Icon, title, subtitle, url, onClick, delay = 0, badge = false }: Props) => {
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
      className="bg-transparent rounded-xl p-3 cursor-pointer relative overflow-hidden group transition-colors duration-300 min-h-[108px] flex flex-col items-center justify-center text-center border border-glass-border/40 hover:border-primary/40"
    >
      {badge && (
        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-destructive shadow-[0_0_6px_hsl(var(--destructive)/0.7)]" />
      )}
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mb-2 bg-primary/15 text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-heading font-semibold text-foreground text-[13px] leading-tight whitespace-nowrap">
        {title}
      </p>
      <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
        {subtitle}
      </p>
    </motion.div>
  );
};

export default VipResourceCard;