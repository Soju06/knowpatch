---
ecosystem: platforms
description: BaaS/platform API key changes, auth patterns
tags: [supabase, anon, service_role, publishable, secret, jwks, baas, firebase, platform]
last_updated: "2026-02-25"
entries: []
---

# Platforms & BaaS — Version Corrections

> Last updated: 2026-02-25

## Table of Contents
- [Supabase API Keys](#supabase-api-keys)
- [Supabase JWKS JWT Verification](#supabase-jwks-jwt-verification)

---

### Supabase API Keys — 2025-06
- **Wrong (training data)**: Use `SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY` (JWT-based, 10-year expiry, non-revocable)
- **Correct (current)**:
  - `anon` key and `service_role` key are **deprecated** (security anti-pattern)
  - New key structure:
    - **Publishable key** (`sb_publishable_...`) — Client-side, low privilege, individually revocable
    - **Secret key** (`sb_secret_...`) — Server-side, elevated privilege, individually revocable, multiple per project
  - Environment variable naming:
    - Old: `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — **NEVER use these**
    - New: `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
  - Key differences from legacy keys:

    | Aspect | Legacy Keys (deprecated) | New Keys (correct) |
    |--------|--------------------------|-------------------|
    | Format | Long JWT string | `sb_publishable_...` / `sb_secret_...` |
    | Expiry | 10 years (fixed) | No expiry (revocable anytime) |
    | Rotation | Requires JWT secret rotation (affects all keys) | Independent per-key revocation |
    | Multiple secrets | One per project | Multiple secret keys per project |
    | Revocation | Cannot revoke individual keys | Instant individual revocation |

  - Migration timeline:
    - 2025-06: New keys available on all projects (opt-in)
    - 2025-11: Deprecation reminders for legacy keys
    - Late 2026: Legacy keys will be **fully removed**
  - Edge Functions: use `--no-verify-jwt` flag with new keys
- **Impact**: Using deprecated `anon`/`service_role` keys exposes 10-year non-rotatable JWTs. A leaked key cannot be revoked without rotating the entire JWT secret, affecting all clients. New keys can be revoked instantly and individually.
- **Lookup**: Supabase Dashboard → Settings → API Keys

**Client initialization:**

```typescript
// WRONG (deprecated) — NEVER generate this pattern
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, process.env.SUPABASE_ANON_KEY!)

// CORRECT — client-side
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, process.env.SUPABASE_PUBLISHABLE_KEY!)

// CORRECT — server-side with elevated privileges
const supabaseAdmin = createClient(url, process.env.SUPABASE_SECRET_KEY!)
```

---

### Supabase JWKS JWT Verification — 2025-07
- **Wrong (training data)**: Verify JWTs using shared `JWT_SECRET` from Supabase dashboard (symmetric HMAC)
- **Correct (current)**:
  - Supabase supports **asymmetric JWT signing** (JWKS)
  - Public key endpoint: `GET https://<project>.supabase.co/auth/v1/.well-known/jwks.json`
  - Use `jose` library for verification — no shared secret needed
  - Asymmetric signing with P-256 (Elliptic Curve) recommended
  - `supabase.auth.getClaims()` for faster local verification
  - All new projects default to asymmetric JWTs (since 2025-10)
  - Existing projects can opt-in via dashboard
- **Impact**: Using shared `JWT_SECRET` for verification is a security risk (secret must be distributed to all services). JWKS verification uses public keys only — no secret distribution needed.

**JWT verification with JWKS:**

```typescript
import { createRemoteJWKSet, jwtVerify } from 'jose'

const SUPABASE_JWT_ISSUER = 'https://<project>.supabase.co/auth/v1'
const jwks = createRemoteJWKSet(
  new URL(`${SUPABASE_JWT_ISSUER}/.well-known/jwks.json`)
)

const { payload } = await jwtVerify(token, jwks, {
  issuer: SUPABASE_JWT_ISSUER,
})
```

**Lookup**: `npm view jose version`, Supabase Dashboard → Settings → Auth → JWT Signing Keys
