-- Project Topi Ration Portal – Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Single table for all beneficiaries (Lalas)
CREATE TABLE IF NOT EXISTS public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  cnic TEXT NOT NULL UNIQUE,
  phone TEXT,
  designation TEXT,
  location TEXT NOT NULL CHECK (location IN ('inside_giki', 'outside_giki')),
  zakaat_eligible BOOLEAN,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by location and status
CREATE INDEX IF NOT EXISTS idx_beneficiaries_location ON public.beneficiaries (location);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_status ON public.beneficiaries (status);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_cnic ON public.beneficiaries (cnic);

-- Enable Row Level Security (optional; adjust policies if you use RLS)
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write for anon key (suitable for demo; tighten in production)
CREATE POLICY "Allow anon read beneficiaries"
  ON public.beneficiaries FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert beneficiaries"
  ON public.beneficiaries FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update beneficiaries"
  ON public.beneficiaries FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete beneficiaries"
  ON public.beneficiaries FOR DELETE
  TO anon
  USING (true);

-- Done. Table is ready for the app.
