# StellarRemit Backend

![CI](https://github.com/HorizonBridgeLabs/StellarRemit-Backend/actions/workflows/ci.yml/badge.svg)

Production-ready NestJS API for a Stellar-based remittance platform.

## Stack

- NestJS + TypeScript
- PostgreSQL + Prisma ORM
- JWT Authentication with refresh tokens
- Stellar SDK (Testnet/Mainnet)
- Swagger/OpenAPI Documentation
- Helmet Security Headers
- Rate Limiting & Request Logging

## Project Structure

```
src/
  auth/           Register, login, JWT strategy & guard
  users/          User profile endpoints
  wallet/         Stellar wallet management & balance fetching
  transactions/   Transaction records & history with pagination
  stellar/        Stellar SDK integration (XLM, USDC payments)
  prisma/         Global Prisma service
  health/         Health check endpoint
  common/         Global exception filter & request logging middleware
prisma/
  schema.prisma   User, Wallet, Transaction models
```

## Setup

### 1. Clone & install

```bash
git clone https://github.com/HorizonBridgeLabs/StellarRemit-Backend.git
cd StellarRemit-Backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, STELLAR_SECRET_KEY
```

### 3. Run with Docker

```bash
docker-compose up --build
```

### 4. Run locally

```bash
# Start Postgres, then:
npx prisma migrate dev
npm run start:dev
```

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/v1/auth/register | — | Register new user |
| POST | /api/v1/auth/login | — | Login, returns JWT |
| POST | /api/v1/auth/refresh | — | Refresh access token |
| POST | /api/v1/auth/logout | ✓ | Logout and revoke tokens |
| GET | /api/v1/auth/me | ✓ | Get current authenticated user |
| GET | /api/v1/users/me | ✓ | Get current user profile |
| PATCH | /api/v1/users/me | ✓ | Update current user profile |
| DELETE | /api/v1/users/me | ✓ | Soft-delete current user account |
| GET | /api/v1/wallet | ✓ | List all wallets |
| POST | /api/v1/wallet | ✓ | Upsert wallet by public key |
| POST | /api/v1/wallet/create | ✓ | Create wallet with label |
| POST | /api/v1/wallet/fund | ✓ | Fund wallet via friendbot |
| GET | /api/v1/wallet/balance | ✓ | Get default wallet balance |
| GET | /api/v1/wallet/total-balance | ✓ | Get total balance across all wallets |
| GET | /api/v1/wallet/:id/balance | ✓ | Get specific wallet balance |
| PATCH | /api/v1/wallet/:id/default | ✓ | Set wallet as default |
| DELETE | /api/v1/wallet/:id | ✓ | Delete a wallet |
| POST | /api/v1/transactions | ✓ | Create transaction |
| GET | /api/v1/transactions | ✓ | List transactions with pagination |
| PATCH | /api/v1/transactions/:id/status | ✓ | Update transaction status |
| GET | /api/v1/health | — | Health check |
| GET | /api/docs | — | Swagger API documentation |

## Example Requests

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get balance (replace TOKEN)
curl http://localhost:3000/api/v1/wallet/balance \
  -H "Authorization: Bearer TOKEN"

# Create transaction
curl -X POST http://localhost:3000/api/v1/transactions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient":"GXXXXXX","amount":10,"asset":"XLM"}'

# List transactions with pagination
curl "http://localhost:3000/api/v1/transactions?page=1&limit=10" \
  -H "Authorization: Bearer TOKEN"
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `STELLAR_NETWORK` | `testnet` or `mainnet` |
| `STELLAR_SECRET_KEY` | Stellar keypair secret for signing transactions |
| `PORT` | Server port (default: 3000) |
| `BALANCE_CACHE_TTL_MS` | Wallet balance cache TTL in milliseconds |

## Testing

```bash
# Unit tests
npm test
npm run test:cov

# E2E tests
npm run test:e2e
```

## Contributing

See [open issues](https://github.com/HorizonBridgeLabs/StellarRemit-Backend/issues) — 50 issues are ready to be assigned.
