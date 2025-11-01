# QR Generation — Manual

This document describes how to generate and verify QR codes for tables (mesas).

Endpoints
- POST /api/mesas/:id/generate-qr?format=png|pdf&venueId={venueId}
  - Protected: requires `Authorization: Bearer <token>` and admin role.
  - Default returns `image/png` inline. Use `?format=pdf` to download a PDF.

Examples (PowerShell)

Request PNG (inline):

```powershell
$token = "<ADMIN_JWT>"
Invoke-RestMethod -Uri "http://localhost:4000/api/mesas/3/generate-qr" -Headers @{ Authorization = "Bearer $token" } -Method Post -OutFile mesa-3-qr.png
```

Request PDF:

```powershell
$token = "<ADMIN_JWT>"
Invoke-RestMethod -Uri "http://localhost:4000/api/mesas/3/generate-qr?format=pdf" -Headers @{ Authorization = "Bearer $token" } -Method Post -OutFile mesa-3-qr.pdf
```

Manual verification steps (DoD):
1. Generate PNG and PDF for a mesa.
2. Download and open on 3 different devices (phone, tablet, laptop). Ensure QR is readable and not distorted.
3. Scan QR — it should open `{CLIENT_URL}/m/{venueId}/table/{tableId}` (redirect to `/login` if user unauthenticated).
4. If tableId invalid, endpoint returns `400` with `Mesa no encontrada (tableId inválido)`.

Security notes
- The QR encodes only `venueId` and `tableId`. Do not add secrets or PII.
- Consider storing generated assets in Supabase Storage for long-term retrieval (not implemented by default).
  
Storage (optional)
- If you want generated QR assets to be stored automatically, set the following environment variables in your backend:
  - `SAVE_QR_TO_STORAGE=true` (default: true)
  - `QR_BUCKET=qr-codes` (default bucket name used by controller)

The controller will attempt to upload the generated PNG/PDF to the specified bucket and persist the public URL in the `mesas.qr_url` column (best-effort). Ensure the bucket exists and is configured for public access or adjust to use signed URLs.
