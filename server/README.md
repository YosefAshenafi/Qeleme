# MegaTest API Gateway

Next.js middleware server between the **MegaTest mobile app** and upstream services (REST API, payments, OTP). The app only knows `GATEWAY_BASE_URL` (`https://megatest-api.vercel.app` in production). Upstream hosts, API keys, and legacy domains stay on this server.

## What it proxies

| Mobile app calls | Gateway route | Upstream (env) |
|------------------|---------------|----------------|
| `/api/auth/login`, `/api/mcq`, … | `GET/POST /api/*` | `UPSTREAM_API_URL` |
| `/api/payments/pay` | `POST /api/payments/pay` | `PAYMENT_UPSTREAM_URL` |
| `/api/payments/verify` | `POST /api/payments/verify` | `PAYMENT_UPSTREAM_URL` |
| `/api/otp/send` | `POST /api/otp/send` | AfroMessage (key server-side) |
| `/api/otp/verify` | `POST /api/otp/verify` | In-memory OTP store |
| Relative image paths | `GET /upstream/*` | `UPSTREAM_API_URL` |
| Payment return page | `GET /payment-success.html` | Served from `public/` |

## Setup

```bash
cd server
cp .env.example .env
# Edit .env — set OTP_API_KEY and GATEWAY_PUBLIC_URL
bun install
bun run dev
```

Gateway runs at **http://localhost:3000**.

### Environment variables

| Variable | Purpose |
|----------|---------|
| `GATEWAY_PUBLIC_URL` | Public URL of this gateway (payment callbacks) |
| `UPSTREAM_API_URL` | Main backend, e.g. `https://www.trustechit.com` |
| `PAYMENT_UPSTREAM_URL` | Payment host (never shipped in the app) |
| `OTP_UPSTREAM_URL` | AfroMessage API base |
| `OTP_API_KEY` | AfroMessage bearer token |
| `OTP_IDENTIFIER_ID` | AfroMessage sender ID |
| `OTP_SENDER_NAME` | SMS sender label |
| `OTP_DEV_BYPASS` | `true` to accept `+251900000000` / OTP `123456` |

## Local development with the mobile app

1. Start the gateway: `make server-dev` (from repo root) or `bun run dev` in `server/`.
2. Point the app at the gateway:
   - **iOS Simulator:** `http://localhost:3000` (default when `app.json` `extra.apiUrl` is unset locally — set `extra.apiUrl` to `http://localhost:3000` for local testing).
   - **Android Emulator:** `http://10.0.2.2:3000`
   - **Physical device:** your machine's LAN IP, e.g. `http://192.168.1.10:3000`

**Production:** `https://megatest-api.vercel.app` (Vercel). The mobile app reads this from `app.json` → `extra.apiUrl`.

**Custom domain (optional):** `api.megatest.app` is linked on Vercel — add DNS `A` record → `76.76.21.21`, then update `GATEWAY_PUBLIC_URL` on Vercel and `extra.apiUrl` in `app.json` to `https://api.megatest.app`.

## Deploy (Vercel)

```bash
cd server
vercel
```

Add all variables from `.env.example` in the Vercel project settings. Set `GATEWAY_PUBLIC_URL` to your production gateway URL.

## Health check

```bash
curl http://localhost:3000/api/health
```
