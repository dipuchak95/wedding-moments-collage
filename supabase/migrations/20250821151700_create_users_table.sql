-- Create users table to mirror authenticated users into public schema
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies (permissive for this public app)
CREATE POLICY "Users are viewable by everyone"
ON public.users
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert users"
ON public.users
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update users"
ON public.users
FOR UPDATE
USING (true)
WITH CHECK (true);

