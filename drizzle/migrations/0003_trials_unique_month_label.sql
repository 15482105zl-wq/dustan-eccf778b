ALTER TABLE public.shared_trials DROP CONSTRAINT IF EXISTS shared_trials_month_key;
ALTER TABLE public.shared_trials ADD CONSTRAINT shared_trials_month_label_key UNIQUE (month, label);