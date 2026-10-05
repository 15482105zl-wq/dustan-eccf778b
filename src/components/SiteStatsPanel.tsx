import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Loader2, RefreshCw, RotateCcw } from "lucide-react";

type Row = { key: string; label: string; category: string; count: number };

const GROUPS: { id: string; name: string }[] = [
  { id: "visit", name: "页面访问" },
  { id: "netdisk", name: "网盘点击" },
  { id: "service", name: "服务卡片" },
  { id: "app", name: "APP 下载" },
];

const SiteStatsPanel = () => {
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_counters").select("key,label,category,count");
    if (error) toast({ title: "读取失败", description: error.message, variant: "destructive" });
    setRows((data as Row[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const reset = async () => {
    setResetting(true);
    const { error } = await supabase.from("site_counters").update({ count: 0, updated_at: new Date().toISOString() }).neq("key", "");
    setResetting(false);
    setConfirming(false);
    if (error) toast({ title: "重置失败", description: error.message, variant: "destructive" });
    else { toast({ title: "已清零" }); load(); }
  };

  return (
    <div className="w-full max-w-sm glass rounded-xl p-6 mt-6 space-y-4 animate-breathe-glow">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent" />
          <span className="gradient-text">站点数据统计</span>
        </h2>
        <Button size="sm" variant="ghost" onClick={load} disabled={loading} className="h-8 text-xs">
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} />刷新数据
        </Button>
      </div>

      {loading && rows.length === 0 ? (
        <div className="flex justify-center py-6 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /></div>
      ) : rows.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">暂无数据</p>
      ) : (
        GROUPS.map((g) => {
          const items = rows.filter((r) => r.category === g.id).sort((a, b) => b.count - a.count);
          if (!items.length) return null;
          const max = Math.max(...items.map((i) => i.count), 1);
          return (
            <div key={g.id} className="space-y-2">
              <p className="text-xs text-muted-foreground">{g.name}</p>
              {items.map((i) => (
                <div key={i.key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground/90">{i.label}</span>
                    <span className="font-semibold text-accent tabular-nums">{i.count}</span>
                  </div>
                  <div className="h-1 rounded-full bg-secondary/60 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${(i.count / max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          );
        })
      )}

      {confirming ? (
        <div className="flex gap-2">
          <Button variant="destructive" className="flex-1" onClick={reset} disabled={resetting}>
            {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : "确认清零"}
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => setConfirming(false)}>取消</Button>
        </div>
      ) : (
        <Button variant="outline" className="w-full border-destructive/40 text-destructive hover:bg-destructive/10" onClick={() => setConfirming(true)}>
          <RotateCcw className="w-4 h-4 mr-2" />重置清零
        </Button>
      )}
    </div>
  );
};

export default SiteStatsPanel;
