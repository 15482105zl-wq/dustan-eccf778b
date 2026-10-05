import { supabase } from "@/integrations/supabase/client";

export type CounterCategory = "visit" | "netdisk" | "service" | "app";

/** Fire-and-forget counter increment; never blocks navigation. */
export const track = (key: string, label: string, category: CounterCategory) => {
  try {
    void supabase.rpc("increment_counter", { p_key: key, p_label: label, p_category: category }).then(() => {}, () => {});
  } catch {
    /* ignore */
  }
};
