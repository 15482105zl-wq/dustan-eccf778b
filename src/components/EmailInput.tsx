import { useState, useRef, useEffect } from "react";
import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const DOMAINS = ["@qq.com", "@163.com", "@139.com", "@sina.com", "@gmail.com"];

interface EmailInputProps extends Omit<React.ComponentProps<"input">, "type" | "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
}

const EmailInput = ({ value, onChange, className, placeholder = "邮箱", ...rest }: EmailInputProps) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const atIndex = value.indexOf("@");
  const prefix = atIndex >= 0 ? value.slice(0, atIndex) : value;
  const typedDomain = atIndex >= 0 ? value.slice(atIndex).toLowerCase() : "";

  const suggestions = DOMAINS.filter((d) => !typedDomain || d.startsWith(typedDomain));
  const showList = open && prefix.length > 0 && suggestions.length > 0;

  const pickDomain = (domain: string) => {
    onChange(`${prefix}${domain}`);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
      <Input
        {...rest}
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder={placeholder}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        className={cn("pl-9", className)}
      />
      {showList && (
        <ul className="absolute left-0 right-0 top-full mt-1 z-50 glass border border-primary/20 rounded-md py-1 max-h-60 overflow-auto shadow-lg">
          {suggestions.map((d) => (
            <li key={d}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); pickDomain(d); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors"
              >
                <span className="text-foreground">{prefix}</span>
                <span className="text-primary">{d}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmailInput;
