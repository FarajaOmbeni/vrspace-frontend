-- Add salary column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS salary NUMERIC(10,2) NOT NULL DEFAULT 0;
