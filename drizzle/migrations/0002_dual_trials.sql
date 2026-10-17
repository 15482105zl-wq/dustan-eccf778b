ALTER TABLE public.shared_trials ADD COLUMN IF NOT EXISTS label TEXT DEFAULT 'main';
ALTER TABLE public.trial_claims ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE public.trial_claims ADD COLUMN IF NOT EXISTS trial_label TEXT DEFAULT 'main';
UPDATE public.shared_trials SET label = 'main' WHERE label IS NULL;
UPDATE public.trial_claims SET trial_label = 'main' WHERE trial_label IS NULL;

CREATE OR REPLACE FUNCTION public.trial_status()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_month text := to_char(now() AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM');
  v_trials jsonb;
  v_label text;
BEGIN
  SELECT jsonb_agg(jsonb_build_object(
    'label', coalesce(label,'main'),
    'name', CASE coalesce(label,'main') WHEN 'kitty' THEN '流云版' ELSE '疾风版' END,
    'traffic', CASE coalesce(label,'main') WHEN 'kitty' THEN '每月128G · 28节点' ELSE '每月200G · 21节点' END,
    'slots_left', GREATEST(slots_total - slots_claimed, 0),
    'slots_total', slots_total
  ) ORDER BY CASE coalesce(label,'main') WHEN 'main' THEN 0 ELSE 1 END)
  INTO v_trials FROM shared_trials WHERE is_active = true;
  IF v_trials IS NULL THEN RETURN jsonb_build_object('ok', false); END IF;
  IF auth.uid() IS NOT NULL THEN
    SELECT coalesce(trial_label,'main') INTO v_label FROM trial_claims
    WHERE user_id = auth.uid() AND month = v_month ORDER BY claimed_at DESC LIMIT 1;
  END IF;
  RETURN jsonb_build_object('ok', true, 'claimed', v_label IS NOT NULL, 'claimed_label', v_label, 'trials', v_trials);
END; $$;

DROP FUNCTION IF EXISTS public.claim_trial();

CREATE OR REPLACE FUNCTION public.claim_trial(p_label text DEFAULT 'main')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_month text := to_char(now() AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM');
  v_ip text;
  v_claim trial_claims%ROWTYPE;
  t shared_trials%ROWTYPE;
  v_url text;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok',false,'error','not_logged_in'); END IF;
  IF p_label NOT IN ('main','kitty') THEN RETURN jsonb_build_object('ok',false,'error','not_available'); END IF;
  BEGIN
    v_ip := nullif(trim(split_part(current_setting('request.headers', true)::json->>'x-forwarded-for', ',', 1)), '');
  EXCEPTION WHEN others THEN v_ip := NULL; END;

  -- 本账号本月已领：直接返回已领订阅，不扣名额
  SELECT * INTO v_claim FROM trial_claims WHERE user_id = v_uid AND month = v_month LIMIT 1;
  IF v_claim.id IS NOT NULL THEN
    SELECT sub_url INTO v_url FROM shared_trials
    WHERE is_active = true AND coalesce(label,'main') = coalesce(v_claim.trial_label,'main') LIMIT 1;
    RETURN jsonb_build_object('ok',true,'sub_url',coalesce(v_url,''),'already',true);
  END IF;
  -- 同 IP 本月已被其他账号领取
  IF v_ip IS NOT NULL AND EXISTS (SELECT 1 FROM trial_claims WHERE ip_address = v_ip AND month = v_month) THEN
    RETURN jsonb_build_object('ok',false,'error','already_claimed');
  END IF;

  SELECT * INTO t FROM shared_trials WHERE is_active = true AND coalesce(label,'main') = p_label AND sub_url <> '' LIMIT 1 FOR UPDATE;
  IF t.id IS NULL THEN RETURN jsonb_build_object('ok',false,'error','not_available'); END IF;
  IF t.slots_claimed >= t.slots_total THEN RETURN jsonb_build_object('ok',false,'error','sold_out'); END IF;

  INSERT INTO trial_claims (user_id, month, ip_address, trial_label) VALUES (v_uid, v_month, v_ip, p_label);
  UPDATE shared_trials SET slots_claimed = slots_claimed + 1 WHERE id = t.id;
  RETURN jsonb_build_object('ok',true,'sub_url',t.sub_url,'already',false);
END; $$;

GRANT EXECUTE ON FUNCTION public.claim_trial(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.trial_status() TO anon, authenticated;