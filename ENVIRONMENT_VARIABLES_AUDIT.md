# Environment Variables Audit

This document lists environment variables used across the JSONDeck monorepo (frontend, backend, and test tooling), based on direct `process.env` references.

## A) Suggested `.env.example` variables with placeholders

```bash
# ===== Shared / cross-service integration =====
BACKEND_URL=http://localhost:4001/api
BACKEND_JWT_SECRET=replace-with-backend-jwt-secret
BACKEND_JWT_ISSUER=jsondeck-backend
BACKEND_JWT_AUDIENCE=jsondeck-frontend

# ===== Frontend (Next.js / NextAuth) =====
NEXTAUTH_URL=http://localhost:4000
NEXTAUTH_SECRET=replace-with-nextauth-secret
GOOGLE_CLIENT_ID=replace-with-google-oauth-client-id
GOOGLE_CLIENT_SECRET=replace-with-google-oauth-client-secret
GITHUB_CLIENT_ID=replace-with-github-oauth-client-id
GITHUB_CLIENT_SECRET=replace-with-github-oauth-client-secret
NEXT_PUBLIC_SITE_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4001/api
NEXT_PUBLIC_APP_URL=http://localhost:4000
NEXT_PUBLIC_SITE_LABEL=JSONDeck

# ===== Backend core =====
NODE_ENV=development
PORT=6000
MONGODB_URI=mongodb://localhost:27017/jsondeck
JWT_SECRET=replace-with-jwt-secret
JWT_ISSUER=jsondeck-api
JWT_AUDIENCE=jsondeck-clients
CORS_ORIGINS=http://localhost:4000,http://localhost:4001
LOG_LEVEL=info

# ===== Backend Redis / cache =====
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=false
TRANSFORM_CACHE_TTL=300
TOOLS_CACHE_TTL=300
CONFIG_CACHE_TTL=900
SHARE_CACHE_TTL=86400
ANALYTICS_CACHE_TTL=180

# ===== Backend OTP / email =====
OTP_SECRET=replace-with-otp-secret
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_SECURE=false
EMAIL_SERVER_USER=replace-with-smtp-user
EMAIL_SERVER_PASSWORD=replace-with-smtp-password
EMAIL_FROM="JSONDeck <no-reply@example.com>"

# ===== Backend upload =====
UPLOAD_DIR=./uploads
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=application/json,text/plain,application/octet-stream

# ===== Backend billing =====
RAZORPAY_KEY_ID=replace-with-razorpay-key-id
RAZORPAY_KEY_SECRET=replace-with-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=replace-with-razorpay-webhook-secret

# ===== Test / CI tooling =====
PLAYWRIGHT_BASE_URL=http://localhost:4000
CI=false
```

## B) Actual variable usage mapping

### FRONTEND ONLY

| Variable | Usage locations | Depends on | Example format | Required for production? |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `apps/frontend/src/lib/public-env.ts:10` | Public canonical site URL surfaced in frontend runtime config. | `https://jsondeck.example.com` | Recommended |
| `NEXT_PUBLIC_API_URL` | `apps/frontend/src/lib/public-env.ts:11` | Public API base URL used by frontend-side API calls/config. | `https://api.jsondeck.example.com` | Yes |
| `NEXT_PUBLIC_APP_URL` | `apps/frontend/src/lib/public-env.ts:12` | Public app URL in frontend runtime config. | `https://app.jsondeck.example.com` | Recommended |
| `NEXT_PUBLIC_SITE_LABEL` | `apps/frontend/src/lib/public-env.ts:13` | Display label/branding in frontend config. | `JSONDeck` | No |
| `NEXTAUTH_URL` | `apps/frontend/src/lib/server-env.ts:11` | NextAuth base URL configuration for auth flows. | `https://app.jsondeck.example.com` | Yes |
| `NEXTAUTH_SECRET` | `apps/frontend/src/lib/auth.ts:162`, `apps/frontend/src/middleware.ts:25` | Session/JWT signing and token verification in NextAuth middleware. | `a-long-random-secret` | Yes |
| `GOOGLE_CLIENT_ID` | `apps/frontend/src/lib/auth.ts:71` | Google OAuth provider config in NextAuth. | `1234567890-abc.apps.googleusercontent.com` | Conditional (required if Google login enabled) |
| `GOOGLE_CLIENT_SECRET` | `apps/frontend/src/lib/auth.ts:72` | Google OAuth provider config in NextAuth. | `GOCSPX-...` | Conditional (required if Google login enabled) |
| `GITHUB_CLIENT_ID` | `apps/frontend/src/lib/auth.ts:75` | GitHub OAuth provider config in NextAuth. | `Iv1.123abc456def` | Conditional (required if GitHub login enabled) |
| `GITHUB_CLIENT_SECRET` | `apps/frontend/src/lib/auth.ts:76` | GitHub OAuth provider config in NextAuth. | `ghs_...` | Conditional (required if GitHub login enabled) |
| `BACKEND_JWT_SECRET` | `apps/frontend/src/lib/backend-auth.ts:20` | Signs short-lived backend bearer token from frontend server actions/auth callbacks. | `backend-shared-jwt-secret` | Yes (for backend sync operations) |
| `BACKEND_JWT_ISSUER` | `apps/frontend/src/lib/backend-auth.ts:21` | JWT issuer claim for backend token minted by frontend. | `jsondeck-backend` | Yes (for backend sync operations) |
| `BACKEND_JWT_AUDIENCE` | `apps/frontend/src/lib/backend-auth.ts:22` | JWT audience claim for backend token minted by frontend. | `jsondeck-frontend` | Yes (for backend sync operations) |
| `BACKEND_URL` | `apps/frontend/src/lib/server-env.ts:10` | Base URL for frontend server-side calls to backend APIs. | `https://api.jsondeck.example.com/api` | Yes |

### BACKEND ONLY

| Variable | Usage locations | Depends on | Example format | Required for production? |
|---|---|---|---|---|
| `NODE_ENV` | `apps/backend/src/config/env.ts:67` | Runtime mode validation and environment branching. | `production` | Yes |
| `PORT` | `apps/backend/src/config/env.ts:68` | API server listening port. | `6000` | Yes |
| `MONGODB_URI` | `apps/backend/src/config/env.ts:69` | MongoDB connection string for persistence. | `mongodb+srv://user:pass@cluster/db` | Yes |
| `JWT_SECRET` | `apps/backend/src/config/env.ts:70`, `apps/backend/src/business/services/otp-service.ts:10` | Core JWT signing + OTP fallback secret. | `a-long-random-jwt-secret` | Yes |
| `JWT_ISSUER` | `apps/backend/src/config/env.ts:71` | JWT issuer claim validation/signing context. | `jsondeck-api` | Yes |
| `JWT_AUDIENCE` | `apps/backend/src/config/env.ts:72` | JWT audience claim validation/signing context. | `jsondeck-clients` | Yes |
| `CORS_ORIGINS` | `apps/backend/src/config/env.ts:73` | Comma-separated CORS allowlist. | `https://app.example.com,https://admin.example.com` | Yes |
| `REDIS_HOST` | `apps/backend/src/config/env.ts:74` | Redis host for queues/caching. | `redis.internal` | Yes |
| `REDIS_PORT` | `apps/backend/src/config/env.ts:75` | Redis port for queues/caching. | `6379` | Yes |
| `REDIS_PASSWORD` | `apps/backend/src/config/env.ts:76` | Redis auth password when required by deployment. | `strong-redis-password` | Conditional |
| `REDIS_TLS` | `apps/backend/src/config/env.ts:77` | Enables TLS mode for Redis connection. | `true` | Conditional |
| `LOG_LEVEL` | `apps/backend/src/config/env.ts:78` | Backend logger verbosity. | `info` | Recommended |
| `OTP_SECRET` | `apps/backend/src/business/services/otp-service.ts:10` | Dedicated HMAC secret for OTP hashing (falls back to `JWT_SECRET`). | `a-different-random-secret` | Recommended |
| `EMAIL_SERVER_HOST` | `apps/backend/src/services/email.ts:25` | SMTP server host used by OTP email sender. | `smtp.sendgrid.net` | Conditional (required if OTP email is used) |
| `EMAIL_SERVER_PORT` | `apps/backend/src/services/email.ts:26` | SMTP port used by email sender. | `587` | Conditional (required if OTP email is used) |
| `EMAIL_SERVER_SECURE` | `apps/backend/src/services/email.ts:27` | SMTP secure transport flag (`"true"` / `"false"`). | `false` | Conditional |
| `EMAIL_SERVER_USER` | `apps/backend/src/services/email.ts:29` | SMTP auth username. | `apikey` | Conditional (required if OTP email is used) |
| `EMAIL_SERVER_PASSWORD` | `apps/backend/src/services/email.ts:30` | SMTP auth password/api key. | `super-secret` | Conditional (required if OTP email is used) |
| `EMAIL_FROM` | `apps/backend/src/services/email.ts:46` | From-address for OTP emails. | `JSONDeck <no-reply@example.com>` | Conditional (required if OTP email is used) |
| `RAZORPAY_KEY_ID` | `apps/backend/src/services/razorpay.ts:17,24` | Razorpay client initialization and key exposure for checkout setup. | `rzp_test_ABC123` | Conditional (required if billing enabled) |
| `RAZORPAY_KEY_SECRET` | `apps/backend/src/services/razorpay.ts:18,26` | Razorpay API auth secret. | `razorpay-secret` | Conditional (required if billing enabled) |
| `RAZORPAY_WEBHOOK_SECRET` | `apps/backend/src/services/razorpay.ts:28` | Verifies Razorpay webhook signatures. | `razorpay-webhook-secret` | Conditional (required if billing enabled) |
| `UPLOAD_DIR` | `apps/backend/src/routes/upload.ts:7` | Local/volume path for uploaded files. | `/var/lib/jsondeck/uploads` | Recommended |
| `UPLOAD_MAX_SIZE` | `apps/backend/src/routes/upload.ts:8` | Upload size cap in bytes. | `5242880` | Recommended |
| `UPLOAD_ALLOWED_TYPES` | `apps/backend/src/routes/upload.ts:10` | Comma-separated MIME type allowlist for uploads. | `application/json,text/plain` | Recommended |
| `TRANSFORM_CACHE_TTL` | `apps/backend/src/routes/transform.ts:9`, `apps/backend/src/services/cache.ts:13` | Cache TTL for transform results and route-level cache middleware. | `300` | No |
| `TOOLS_CACHE_TTL` | `apps/backend/src/services/cache.ts:14` | Cache TTL for tools endpoint results. | `300` | No |
| `CONFIG_CACHE_TTL` | `apps/backend/src/routes/config.ts:14`, `apps/backend/src/services/cache.ts:15` | Cache TTL for config endpoint and storage cache helper. | `900` | No |
| `SHARE_CACHE_TTL` | `apps/backend/src/services/cache.ts:16` | Cache TTL for shared-link payloads. | `86400` | No |
| `ANALYTICS_CACHE_TTL` | `apps/backend/src/services/cache.ts:17` | Cache TTL for analytics query results. | `180` | No |

### BOTH (frontend + backend runtime code)

No identical env variable names are read directly by both frontend and backend application runtime code.

### Tooling / CI (repository root)

| Variable | Usage locations | Depends on | Example format | Required for production? |
|---|---|---|---|---|
| `PLAYWRIGHT_BASE_URL` | `playwright.config.ts:6,9` | E2E test target URL; skips webServer startup when set. | `http://localhost:4000` | No |
| `CI` | `playwright.config.ts:14` | Controls Playwright `reuseExistingServer` behavior. | `true` | No |

## Discovery commands used

- `rg -n "process\.env" .`
- `nl -ba apps/backend/src/config/env.ts | sed -n '1,220p'`
- `nl -ba apps/backend/src/business/services/otp-service.ts | sed -n '1,120p'`
- `nl -ba apps/backend/src/services/email.ts | sed -n '1,160p'`
- `nl -ba apps/backend/src/services/razorpay.ts | sed -n '1,140p'`
- `nl -ba apps/backend/src/routes/upload.ts | sed -n '1,160p'`
- `nl -ba apps/backend/src/routes/transform.ts | sed -n '1,120p'`
- `nl -ba apps/backend/src/routes/config.ts | sed -n '1,120p'`
- `nl -ba apps/backend/src/services/cache.ts | sed -n '1,80p'`
- `nl -ba apps/frontend/src/lib/public-env.ts | sed -n '1,120p'`
- `nl -ba apps/frontend/src/lib/server-env.ts | sed -n '1,120p'`
- `nl -ba apps/frontend/src/lib/backend-auth.ts | sed -n '1,120p'`
- `nl -ba apps/frontend/src/lib/auth.ts | sed -n '1,240p'`
- `nl -ba apps/frontend/src/middleware.ts | sed -n '1,140p'`
- `nl -ba playwright.config.ts | sed -n '1,120p'`
