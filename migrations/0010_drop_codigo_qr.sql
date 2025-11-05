-- Migration: drop codigo_qr column from mesas
-- Run this in Supabase SQL editor or via psql. This will remove the legacy
-- `codigo_qr` column now that QR images/URLs are stored in `qr_url`.

ALTER TABLE IF EXISTS public.mesas
  DROP COLUMN IF EXISTS codigo_qr;

-- Note: Before running this migration, ensure no application code relies on
-- `codigo_qr`. The repo code has been updated to use `qr_url` instead.
-- Also consider backing up the table or copying codigo_qr values to another
-- column if you need them later:
-- ALTER TABLE public.mesas ADD COLUMN codigo_qr_backup text;
-- UPDATE public.mesas SET codigo_qr_backup = codigo_qr;

-- After running: verify migrations and update any client apps that expected
-- the old column.
