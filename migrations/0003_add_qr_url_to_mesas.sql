-- Add qr_url column to mesas so generated QR public URLs can be persisted
ALTER TABLE IF EXISTS mesas
ADD COLUMN IF NOT EXISTS qr_url text;

-- Optional: create an index for quick lookups by qr_url (if you plan to query by it)
-- CREATE INDEX IF NOT EXISTS idx_mesas_qr_url ON mesas (qr_url);

-- NOTE: After applying this migration in Supabase, create a public bucket (e.g., 'qr-codes')
-- and set its privacy to public if you want the stored publicUrl to be accessible by clients.
